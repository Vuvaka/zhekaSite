import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

interface IncomingOrderItem {
  name: string;
  weight?: string;
  price: number;
  quantity: number;
}

interface IncomingOrderPayload {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  comment: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'paid_online' | 'on_delivery';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  estimatedMinutes: string;
  items: IncomingOrderItem[];
  consentAccepted: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validateOrderPayload(body: unknown): {
  valid: boolean;
  error?: string;
  data?: IncomingOrderPayload;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Некорректные данные заказа.' };
  }

  const raw = body as Record<string, unknown>;
  const customerName = sanitizeText(raw.customerName, 100);
  const phone = sanitizeText(raw.phone, 32);
  const deliveryMethod = raw.deliveryMethod === 'pickup' ? 'pickup' : raw.deliveryMethod === 'delivery' ? 'delivery' : null;
  const paymentMethod = raw.paymentMethod === 'card' ? 'card' : raw.paymentMethod === 'cash' ? 'cash' : null;
  const address = sanitizeText(raw.address, 250);
  const comment = sanitizeText(raw.comment, 500);
  const consentAccepted = raw.consentAccepted === true;

  if (!customerName) {
    return { valid: false, error: 'Укажите имя покупателя.' };
  }
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return { valid: false, error: 'Укажите корректный номер телефона.' };
  }
  if (!deliveryMethod) {
    return { valid: false, error: 'Некорректный способ получения.' };
  }
  if (!paymentMethod) {
    return { valid: false, error: 'Некорректный способ оплаты.' };
  }
  if (deliveryMethod === 'delivery' && !address) {
    return { valid: false, error: 'Укажите адрес доставки.' };
  }
  if (!consentAccepted) {
    return { valid: false, error: 'Необходимо согласие на обработку персональных данных.' };
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 60) {
    return { valid: false, error: 'Корзина заказа пуста или некорректна.' };
  }

  const normalizedItems: IncomingOrderItem[] = [];
  for (const entry of raw.items) {
    if (!entry || typeof entry !== 'object') {
      return { valid: false, error: 'Некорректная позиция в заказе.' };
    }
    const itemRecord = entry as Record<string, unknown>;
    const nestedItem =
      itemRecord.item && typeof itemRecord.item === 'object'
        ? (itemRecord.item as Record<string, unknown>)
        : itemRecord;

    const name = sanitizeText(nestedItem.name, 140);
    const weight = sanitizeText(nestedItem.weight, 40);
    const price = Number(nestedItem.price);
    const quantity = Number(itemRecord.quantity);

    if (
      !name ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 100000 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return { valid: false, error: 'Некорректное количество или цена позиции.' };
    }

    normalizedItems.push({ name, weight, price, quantity });
  }

  const orderNumber = sanitizeText(raw.orderNumber, 24) || `ПМ-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = normalizedItems.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  const discount = deliveryMethod === 'pickup' ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = deliveryMethod === 'pickup' || subtotal >= 1500 ? 0 : 200;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    valid: true,
    data: {
      orderNumber,
      createdAt: sanitizeText(raw.createdAt, 40) || new Date().toISOString(),
      customerName,
      phone,
      address: deliveryMethod === 'pickup' ? 'г. Кандалакша, ул. Советская, д. 5' : address,
      comment,
      deliveryMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'card' ? 'paid_online' : 'on_delivery',
      subtotal,
      discount,
      deliveryFee,
      total,
      estimatedMinutes: deliveryMethod === 'pickup' ? '15–20 минут' : '30–45 минут',
      items: normalizedItems,
      consentAccepted: true,
    },
  };
}

async function sendTelegramNotification(order: IncomingOrderPayload): Promise<'sent' | 'not_configured' | 'failed'> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatIdRaw) return 'not_configured';

  const chatIds = chatIdRaw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (chatIds.length === 0) return 'not_configured';

  const itemsText = order.items
    .map((it) => `• ${escapeHtml(it.name)} × ${it.quantity} — ${it.price * it.quantity} ₽`)
    .join('\n');

  const deliveryLabel = order.deliveryMethod === 'pickup' ? 'Самовывоз (−10%)' : 'Доставка';
  const paymentLabel = order.paymentMethod === 'card' ? 'Картой на сайте' : 'Наличными при получении';

  const message = [
    `<b>Новый заказ #${escapeHtml(order.orderNumber)}</b>`,
    ``,
    `<b>Клиент:</b> ${escapeHtml(order.customerName)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `<b>Получение:</b> ${deliveryLabel}`,
    `<b>Адрес:</b> ${escapeHtml(order.address)}`,
    `<b>Оплата:</b> ${paymentLabel}`,
    order.comment ? `<b>Комментарий:</b> ${escapeHtml(order.comment)}` : '',
    ``,
    `<b>Состав заказа:</b>`,
    itemsText,
    ``,
    order.discount > 0 ? `Скидка самовывоз: −${order.discount} ₽` : '',
    order.deliveryMethod === 'delivery'
      ? `Доставка: ${order.deliveryFee === 0 ? 'Бесплатно' : `${order.deliveryFee} ₽`}`
      : '',
    `<b>Итого: ${order.total} ₽</b>`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const results = await Promise.all(
      chatIds.map(async (chatId) => {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
        return res.ok;
      })
    );
    return results.every(Boolean) ? 'sent' : 'failed';
  } catch (err) {
    console.error('[Telegram notify error]', err instanceof Error ? err.message : 'Unknown error');
    return 'failed';
  }
}

async function sendEmailNotification(order: IncomingOrderPayload): Promise<'sent' | 'not_configured' | 'failed'> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const to = (process.env.NOTIFY_EMAIL_TO || user || '').trim();

  if (!host || !user || !pass || !to) return 'not_configured';

  const deliveryLabel = order.deliveryMethod === 'pickup' ? 'Самовывоз (−10%)' : 'Доставка';
  const paymentLabel = order.paymentMethod === 'card' ? 'Картой на сайте' : 'Наличными при получении';

  const plainItems = order.items
    .map((it) => `- ${it.name} × ${it.quantity} = ${it.price * it.quantity} ₽`)
    .join('\n');

  const htmlItems = order.items
    .map(
      (it) =>
        `<li><strong>${escapeHtml(it.name)}</strong> × ${it.quantity} — ${it.price * it.quantity} ₽</li>`
    )
    .join('');

  const textBody = [
    `Новый заказ #${order.orderNumber} (Пелемешка)`,
    `Клиент: ${order.customerName}`,
    `Телефон: ${order.phone}`,
    `Способ получения: ${deliveryLabel}`,
    `Адрес: ${order.address}`,
    `Оплата: ${paymentLabel}`,
    order.comment ? `Комментарий: ${order.comment}` : '',
    '',
    'Состав заказа:',
    plainItems,
    '',
    `Итого: ${order.total} ₽`,
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px;">
      <h2 style="margin-bottom: 12px;">Новый заказ #${escapeHtml(order.orderNumber)} — Пелемешка</h2>
      <p><strong>Клиент:</strong> ${escapeHtml(order.customerName)}<br/>
         <strong>Телефон:</strong> ${escapeHtml(order.phone)}<br/>
         <strong>Получение:</strong> ${deliveryLabel}<br/>
         <strong>Адрес:</strong> ${escapeHtml(order.address)}<br/>
         <strong>Оплата:</strong> ${paymentLabel}
         ${order.comment ? `<br/><strong>Комментарий:</strong> ${escapeHtml(order.comment)}` : ''}
      </p>
      <h3>Состав заказа:</h3>
      <ul>${htmlItems}</ul>
      <p style="font-size: 16px;"><strong>Итого: ${order.total} ₽</strong></p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Пелемешка Заказы" <${user}>`,
      to,
      subject: `Новый заказ #${order.orderNumber} на ${order.total} ₽`,
      text: textBody,
      html: htmlBody,
    });
    return 'sent';
  } catch (err) {
    console.error('[Email notify error]', err instanceof Error ? err.message : 'Unknown error');
    return 'failed';
  }
}

async function sendSmsNotification(order: IncomingOrderPayload): Promise<'sent' | 'not_configured' | 'failed'> {
  const apiId = process.env.SMSRU_API_ID?.trim();
  const targetPhone = process.env.NOTIFY_SMS_PHONE?.trim();
  if (!apiId || !targetPhone) return 'not_configured';

  const cleanTarget = targetPhone.replace(/\D/g, '');
  if (cleanTarget.length < 10) return 'not_configured';

  const deliveryShort = order.deliveryMethod === 'pickup' ? 'Самовывоз' : order.address;
  const smsText = `Пелемешка: заказ #${order.orderNumber} на ${order.total}р. ${order.customerName}, ${order.phone}. ${deliveryShort}`.slice(0, 160);

  try {
    const params = new URLSearchParams({
      api_id: apiId,
      to: cleanTarget,
      msg: smsText,
      json: '1',
    });

    const res = await fetch(`https://sms.ru/sms/send?${params.toString()}`, {
      method: 'GET',
    });
    if (!res.ok) return 'failed';
    const json = (await res.json()) as { status?: string };
    return json.status === 'OK' ? 'sent' : 'failed';
  } catch (err) {
    console.error('[SMS notify error]', err instanceof Error ? err.message : 'Unknown error');
    return 'failed';
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.post('/api/orders', async (req: Request, res: Response) => {
    const validation = validateOrderPayload(req.body);
    if (!validation.valid || !validation.data) {
      res.status(400).json({ ok: false, error: validation.error || 'Некорректный заказ.' });
      return;
    }

    const order = validation.data;

    const [telegramStatus, emailStatus, smsStatus] = await Promise.all([
      sendTelegramNotification(order),
      sendEmailNotification(order),
      sendSmsNotification(order),
    ]);

    res.status(201).json({
      ok: true,
      orderNumber: order.orderNumber,
      notifications: {
        telegram: telegramStatus,
        email: emailStatus,
        sms: smsStatus,
      },
    });
  });

  const KANDALAKSHA_FALLBACK_STREETS: Array<{ name: string; lat: number; lng: number }> = [
    { name: 'ул. Советская', lat: 67.1541, lng: 32.4106 },
    { name: 'ул. Набережная', lat: 67.1538, lng: 32.3982 },
    { name: 'ул. Первомайская', lat: 67.1558, lng: 32.4125 },
    { name: 'ул. Спекова', lat: 67.1574, lng: 32.4184 },
    { name: 'ул. Пронина', lat: 67.1586, lng: 32.4057 },
    { name: 'ул. Максима Горького', lat: 67.1563, lng: 32.4071 },
    { name: 'ул. Кировская', lat: 67.1526, lng: 32.4148 },
    { name: 'ул. Комсомольская', lat: 67.1599, lng: 32.4235 },
    { name: 'ул. Аэронавтов', lat: 67.1632, lng: 32.4198 },
    { name: 'ул. Данилова', lat: 67.1578, lng: 32.4121 },
    { name: 'ул. Борисова', lat: 67.1618, lng: 32.4086 },
    { name: 'ул. Беломорская', lat: 67.1489, lng: 32.4162 },
    { name: 'ул. Мурманская', lat: 67.1569, lng: 32.4294 },
    { name: 'ул. Фрунзе', lat: 67.1605, lng: 32.4152 },
    { name: 'ул. Чкалова', lat: 67.1551, lng: 32.4216 },
    { name: 'ул. Локомотивная', lat: 67.1674, lng: 32.4112 },
    { name: 'ул. 50 лет Октября', lat: 67.1642, lng: 32.4178 },
    { name: 'ул. Новая', lat: 67.1592, lng: 32.4039 },
    { name: 'ул. Путейская', lat: 67.1681, lng: 32.4169 },
    { name: 'ул. Школьная', lat: 67.1514, lng: 32.4075 },
    { name: 'ул. Линейная', lat: 67.1656, lng: 32.4241 },
    { name: 'ул. Заречная', lat: 67.1476, lng: 32.3991 },
    { name: 'ул. Наймушина', lat: 67.1521, lng: 32.4244 },
    { name: 'Кандалакшское шоссе', lat: 67.1612, lng: 32.4352 },
  ];

  interface NominatimEntry {
    place_id?: number;
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: {
      road?: string;
      house_number?: string;
      city?: string;
      town?: string;
      village?: string;
      suburb?: string;
    };
  }

  function formatNominatimEntryLabel(entry: NominatimEntry): string {
    const road = entry.address?.road?.trim();
    const house = entry.address?.house_number?.trim();
    const city =
      entry.address?.town || entry.address?.city || entry.address?.village || 'Кандалакша';
    if (road && house) return `${city}, ${road}, ${house}`;
    if (road) return `${city}, ${road}`;
    const raw = (entry.display_name || '')
      .split(',')
      .slice(0, 3)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ');
    return raw || 'г. Кандалакша';
  }

  app.get('/api/geocode/search', async (req: Request, res: Response) => {
    const rawQ = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    if (rawQ.length < 2) {
      res.json({ results: [] });
      return;
    }

    const normalizedQuery = rawQ.toLowerCase();
    const fallbackMatches = KANDALAKSHA_FALLBACK_STREETS.filter((st) =>
      st.name.toLowerCase().includes(normalizedQuery)
    )
      .slice(0, 5)
      .map((st) => ({
        id: `local-${st.name}`,
        label: `Кандалакша, ${st.name}`,
        subtitle: 'г. Кандалакша',
        lat: st.lat,
        lng: st.lng,
      }));

    try {
      const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
      searchUrl.searchParams.set(
        'q',
        normalizedQuery.includes('кандалакш') ? rawQ : `Кандалакша, ${rawQ}`
      );
      searchUrl.searchParams.set('format', 'jsonv2');
      searchUrl.searchParams.set('addressdetails', '1');
      searchUrl.searchParams.set('limit', '6');
      searchUrl.searchParams.set('countrycodes', 'ru');
      searchUrl.searchParams.set('accept-language', 'ru');
      searchUrl.searchParams.set('viewbox', '32.25,67.23,32.58,67.08');
      searchUrl.searchParams.set('bounded', '1');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const upstream = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'PelemeshkaKandalaksha/1.0 (delivery map lookup)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!upstream.ok) {
        res.json({ results: fallbackMatches });
        return;
      }

      const data = (await upstream.json()) as NominatimEntry[];
      const seen = new Set<string>();
      const apiResults: Array<{
        id: string;
        label: string;
        subtitle: string;
        lat: number;
        lng: number;
      }> = [];

      for (const entry of data) {
        const lat = Number(entry.lat);
        const lng = Number(entry.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const label = formatNominatimEntryLabel(entry);
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        apiResults.push({
          id: String(entry.place_id || `${lat},${lng}`),
          label,
          subtitle: 'г. Кандалакша, Мурманская обл.',
          lat,
          lng,
        });
      }

      if (apiResults.length > 0) {
        res.json({ results: apiResults.slice(0, 6) });
        return;
      }

      res.json({ results: fallbackMatches });
    } catch {
      res.json({ results: fallbackMatches });
    }
  });

  app.get('/api/geocode/reverse', async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      res.status(400).json({ error: 'Некорректные координаты.' });
      return;
    }

    try {
      const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
      reverseUrl.searchParams.set('format', 'jsonv2');
      reverseUrl.searchParams.set('lat', String(lat));
      reverseUrl.searchParams.set('lon', String(lng));
      reverseUrl.searchParams.set('addressdetails', '1');
      reverseUrl.searchParams.set('accept-language', 'ru');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const upstream = await fetch(reverseUrl.toString(), {
        headers: {
          'User-Agent': 'PelemeshkaKandalaksha/1.0 (delivery map reverse)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!upstream.ok) {
        res.json({ address: '' });
        return;
      }

      const entry = (await upstream.json()) as NominatimEntry;
      res.json({ address: formatNominatimEntryLabel(entry) });
    } catch {
      res.json({ address: '' });
    }
  });

  if (IS_PROD) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
