import { Clock, ExternalLink, Lock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { openCart, openPromotions, openLegalPage, closeLegalPage, openAdmin } = useStore();

  return (
    <footer
      id="contacts"
      className="border-t border-white/[0.08] bg-[#0D0D0F] pt-14 pb-10 mt-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand & Address Column */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <a
                href="#hero"
                className="font-display text-2xl font-bold uppercase tracking-wide text-white hover:text-[#FFD400] transition-colors"
              >
                Пелемешка
              </a>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-sm">
                Быстрая доставка горячих блюд в г. Кандалакша.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-zinc-200">
                <MapPin className="w-4 h-4 text-[#FFD400] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-white">{RESTAURANT_INFO.city}</p>
                  <p className="text-zinc-400">{RESTAURANT_INFO.street}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-zinc-200">
                <Clock className="w-4 h-4 text-[#FFD400] shrink-0" aria-hidden="true" />
                <span>{RESTAURANT_INFO.hours}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FFD400] shrink-0" aria-hidden="true" />
                <a
                  href={RESTAURANT_INFO.phoneHref}
                  className="font-mono tabular-nums text-white hover:text-[#FFD400] transition-colors"
                >
                  {RESTAURANT_INFO.phoneDisplay}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://vk.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Пелемешка ВКонтакте"
                className="px-3.5 py-2 rounded-lg bg-[#18181B] border border-white/10 text-xs font-semibold text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors"
              >
                ВКонтакте
              </a>
              <a
                href="https://max.ru"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Пелемешка в мессенджере MAX"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181B] border border-white/10 text-xs font-semibold text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Мессенджер MAX</span>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-lg font-semibold text-white">Навигация</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <a
                  href="#hero"
                  onClick={() => closeLegalPage(false)}
                  className="hover:text-[#FFD400] transition-colors"
                >
                  Главная
                </a>
              </li>
              <li>
                <a
                  href="#categories"
                  onClick={() => closeLegalPage(false)}
                  className="hover:text-[#FFD400] transition-colors"
                >
                  Категории блюд
                </a>
              </li>
              <li>
                <a
                  href="#menu"
                  onClick={() => closeLegalPage(false)}
                  className="hover:text-[#FFD400] transition-colors"
                >
                  Меню
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPromotions}
                  className="hover:text-[#FFD400] transition-colors cursor-pointer"
                >
                  Акции и доставка
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openCart('history')}
                  className="hover:text-[#FFD400] transition-colors cursor-pointer"
                >
                  Мои заказы
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegalPage('privacy')}
                  className="hover:text-[#FFD400] transition-colors cursor-pointer"
                >
                  Политика конфиденциальности
                </button>
              </li>
            </ul>
          </div>

          {/* Interactive Stylized Location Map */}
          <div className="lg:col-span-5">
            <div className="relative h-64 rounded-xl overflow-hidden bg-[#151519] border border-white/10 group">
              {/* Stylized Vector Map of Kandalaksha center */}
              <svg
                viewBox="0 0 600 280"
                className="w-full h-full object-cover opacity-85"
                aria-label="Схема проезда: г. Кандалакша, ул. Советская, д. 5"
              >
                <rect width="600" height="280" fill="#151519" />
                {/* City Blocks */}
                <rect x="30" y="24" width="120" height="75" rx="6" fill="#1D1D23" />
                <rect x="175" y="24" width="145" height="75" rx="6" fill="#1D1D23" />
                <rect x="345" y="24" width="220" height="75" rx="6" fill="#1D1D23" />
                <rect x="30" y="130" width="120" height="115" rx="6" fill="#1D1D23" />
                <rect x="175" y="130" width="145" height="115" rx="6" fill="#23232B" stroke="#FFD400" strokeOpacity="0.25" />
                <rect x="345" y="130" width="110" height="115" rx="6" fill="#1D1D23" />
                <rect x="475" y="130" width="90" height="115" rx="6" fill="#1D1D23" />

                {/* Streets */}
                <path d="M0 114 H600" stroke="#2B2B33" strokeWidth="14" />
                <path d="M0 114 H600" stroke="#FFD400" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="6 6" />
                <path d="M162 0 V280" stroke="#27272E" strokeWidth="10" />
                <path d="M332 0 V280" stroke="#27272E" strokeWidth="10" />
                <path d="M465 114 V280" stroke="#24242B" strokeWidth="8" />

                {/* Street Labels */}
                <text x="38" y="118" fill="#A1A1AA" fontSize="11" fontFamily="Manrope, sans-serif">
                  ул. Советская
                </text>
                <text x="380" y="118" fill="#71717A" fontSize="11" fontFamily="Manrope, sans-serif">
                  ул. Первомайская
                </text>

                {/* Location Pin at ул. Советская, д. 5 */}
                <g transform="translate(248, 134)">
                  <circle cx="0" cy="0" r="22" fill="#FFD400" fillOpacity="0.16" />
                  <circle cx="0" cy="0" r="9" fill="#FFD400" />
                  <circle cx="0" cy="0" r="3.5" fill="#111111" />
                </g>
              </svg>

              {/* Map Overlay Card */}
              <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-lg bg-[#111111]/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    Пелемешка · Самовывоз −10%
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{RESTAURANT_INFO.fullAddress}</p>
                </div>
                <a
                  href="https://yandex.ru/maps/?text=%D0%B3.%20%D0%9A%D0%B0%D0%BD%D0%B4%D0%B0%D0%BB%D0%B0%D0%BA%D1%88%D0%B0%2C%20%D1%83%D0%BB.%20%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F%2C%205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD400] text-[#111111] text-xs font-semibold hover:bg-[#ffe033] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Открыть карту</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Пелемешка. Доставка еды в г. Кандалакша.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openLegalPage('privacy')}
              className="hover:text-[#FFD400] transition-colors underline underline-offset-4 decoration-white/15 hover:decoration-[#FFD400] cursor-pointer"
            >
              Политика конфиденциальности
            </button>
            <button
              type="button"
              onClick={openAdmin}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-[#FFD400] transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" aria-hidden="true" />
              <span>Управление меню</span>
            </button>
            <span>{RESTAURANT_INFO.fullAddress} · {RESTAURANT_INFO.hours}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
