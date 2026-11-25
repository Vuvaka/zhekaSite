import { ArrowLeft, FileCheck2, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function LegalPageView() {
  const { activeLegalPage, closeLegalPage } = useStore();

  if (!activeLegalPage) return null;

  if (activeLegalPage === 'privacy') {
    return (
      <section
        aria-labelledby="privacy-policy-heading"
        className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          onClick={() => closeLegalPage(false)}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-[#FFD400] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Вернуться на сайт</span>
        </button>

        <article className="rounded-2xl bg-[#16161A] border border-white/10 p-6 sm:p-10 space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <div className="flex items-start gap-3.5 pb-6 border-b border-white/[0.08]">
            <div className="w-11 h-11 rounded-xl bg-[#FFD400]/10 border border-[#FFD400]/25 flex items-center justify-center text-[#FFD400] shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#FFD400] mb-1">
                Политика конфиденциальности
              </p>
              <h1
                id="privacy-policy-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight"
              >
                Политика обработки персональных данных при регистрации пользователей
              </h1>
            </div>
          </div>

          <p>
            Настоящая Политика определяет порядок обработки персональных данных, осуществляемой
            Оператором при регистрации пользователей на сайте{' '}
            <a
              href="https://piknik51.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD400] hover:underline underline-offset-4"
            >
              https://piknik51.ru
            </a>
            . Мы придаем большое значение защите конфиденциальности ваших данных и стремимся
            обеспечить их безопасную и законную обработку.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              1. Цели обработки персональных данных
            </h2>
            <p>
              Персональные данные пользователей, полученные при регистрации, обрабатываются
              Оператором в следующих целях:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Обратная связь и поддержка:</strong> Мы используем
                ваши данные, чтобы связываться с вами по вопросам, связанным с использованием
                сайта, оказывать техническую поддержку и отвечать на ваши запросы.
              </li>
              <li>
                <strong className="text-white">Осуществление доставки:</strong> Ваши данные
                необходимы для правильной обработки и выполнения заказов, включая доставку товаров
                или услуг.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              2. Категории и перечень обрабатываемых персональных данных
            </h2>
            <p>
              При регистрации Оператор обрабатывает следующие категории персональных данных:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Идентификационные данные:</strong>
              </li>
              <li>
                <strong className="text-white">
                  Контактные данные (для обратной связи и доставки):
                </strong>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-300">
                  <li>
                    <strong className="text-white">Адрес электронной почты:</strong> Используется
                    для обратной связи, уведомлений и ответов на запросы.
                  </li>
                  <li>
                    <strong className="text-white">Контактный телефон:</strong> Используется для
                    оперативной связи, включая уточнение деталей по заказам и доставке.
                  </li>
                  <li>
                    <strong className="text-white">Фамилия, Имя, Отчество:</strong> Необходимы
                    для оформления документов, идентификации получателя и персонализации доставки.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-white">Данные для осуществления доставки:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-300">
                  <li>
                    <strong className="text-white">Фамилия, Имя, Отчество:</strong> Необходимы
                    для оформления документов, идентификации получателя и персонализации доставки.
                  </li>
                  <li>
                    <strong className="text-white">Город проживания:</strong> Используется для
                    логистики и расчета стоимости доставки.
                  </li>
                  <li>
                    <strong className="text-white">Адрес:</strong> Точный адрес доставки (улица,
                    номер дома, квартира/офис, почтовый индекс).
                  </li>
                  <li>
                    <strong className="text-white">Контактный телефон:</strong> Используется для
                    оперативной связи, включая уточнение деталей по заказам и доставке
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              3. Категории субъектов персональных данных
            </h2>
            <p>
              Субъектами персональных данных являются физические лица, регистрирующиеся на сайте{' '}
              <a
                href="https://piknik51.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFD400] hover:underline underline-offset-4"
              >
                https://piknik51.ru
              </a>{' '}
              и предоставляющие свои персональные данные.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              4. Способы обработки персональных данных
            </h2>
            <p>
              Обработка персональных данных осуществляется как с использованием средств
              автоматизации (автоматизированная обработка), так и без использования таких средств
              (неавтоматизированная обработка).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>Сбор;</li>
              <li>Запись;</li>
              <li>Накопление;</li>
              <li>Хранение;</li>
              <li>Уточнение (обновление, изменение);</li>
              <li>Использование;</li>
              <li>Блокирование; Удаление; Уничтожение.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              5. Сроки обработки и хранения персональных данных
            </h2>
            <p>
              Персональные данные хранятся в течение срока, необходимого для достижения целей их
              обработки. Для всех целей срок обработки — 1 год, срок хранения данных — 3 года.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white">
              6. Порядок уничтожения персональных данных
            </h2>
            <p>Персональные данные подлежат уничтожению в следующих случаях:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>Достижение целей обработки персональных данных.</li>
              <li>Истечение срока хранения персональных данных.</li>
              <li>
                Отзыв согласия субъекта персональных данных на обработку его данных (если иное не
                предусмотрено законодательством).
              </li>
              <li>Выявление неправомерной обработки персональных данных.</li>
              <li>Ликвидация (реорганизация) Оператора.</li>
            </ul>
            <p>
              Уничтожение персональных данных осуществляется путем стирания, обнуления или
              физического уничтожения носителей информации, исключающего возможность их дальнейшего
              восстановления.
            </p>
          </section>

          <div className="pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => closeLegalPage(false)}
              className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
            >
              Вернуться к меню
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="consent-heading"
      className="py-10 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <button
        type="button"
        onClick={() => closeLegalPage(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-[#FFD400] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Вернуться к оформлению заказа</span>
      </button>

      <article className="rounded-2xl bg-[#16161A] border border-white/10 p-6 sm:p-10 space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
        <div className="flex items-start gap-3.5 pb-6 border-b border-white/[0.08]">
          <div className="w-11 h-11 rounded-xl bg-[#FFD400]/10 border border-[#FFD400]/25 flex items-center justify-center text-[#FFD400] shrink-0">
            <FileCheck2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1
            id="consent-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight"
          >
            СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ
          </h1>
        </div>

        <p>
          Я даю согласие <strong className="text-white">ИП Данилов Евгений Львович</strong> (ИНН
          510203726101, ОГРНИП 324510000022371, юридический адрес: Мурманская обл, г Кандалакша,
          ул Набережная, д 145, кв 50) на обработку моих персональных данных:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-white font-medium">
          <li>ФИО</li>
          <li>Контактный телефон</li>
          <li>Адрес электронной почты</li>
          <li>Адрес доставки</li>
          <li>Платежные реквизиты</li>
        </ul>

        <div className="space-y-2.5">
          <h2 className="font-display text-xl font-semibold text-white">Цели обработки:</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>Оформление и выполнение заказа</li>
            <li>Доставка товара (включая передачу данных курьерской службе)</li>
            <li>Обработка оплаты</li>
            <li>Обратная связь и консультации</li>
            <li>Отправка информации о статусе заказа</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h2 className="font-display text-xl font-semibold text-white">
            Согласие действует до момента отзыва (или в течение 5 лет), который можно осуществить:
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>
              По email:{' '}
              <a
                href="mailto:mr.eud2011@yandex.ru"
                className="text-[#FFD400] hover:underline underline-offset-4"
              >
                mr.eud2011@yandex.ru
              </a>
            </li>
            <li>
              По телефону:{' '}
              <a
                href="tel:+79110634785"
                className="text-[#FFD400] hover:underline underline-offset-4 font-mono tabular-nums"
              >
                +7-911-063-47-85
              </a>
            </li>
            <li>
              Письмом по адресу: Мурманская обл, г Кандалакша, ул Набережная, д 145, кв 50
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => closeLegalPage(true)}
            className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
          >
            Вернуться к оформлению заказа
          </button>
        </div>
      </article>
    </section>
  );
}
