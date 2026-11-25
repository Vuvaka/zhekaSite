import { useState } from 'react';
import { History, Menu, Phone, Search, ShoppingBag, X } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';

const NAV_LINKS = [
  { href: '#hero', label: 'Главная' },
  { href: '#menu', label: 'Меню' },
  { action: 'promotions' as const, label: 'Акции' },
  { href: '#contacts', label: 'Контакты' },
];

export function Header() {
  const {
    orders,
    totalItemsCount,
    cartSubtotal,
    openCart,
    openSearch,
    openPromotions,
    closeLegalPage,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111111]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#hero"
          onClick={() => closeLegalPage(false)}
          className="font-display text-base sm:text-xl lg:text-2xl font-bold tracking-wide uppercase text-white hover:text-[#FFD400] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded"
        >
          Пелемешка
        </a>

        {/* Zone 2: Desktop navigation links (lg+ so tablet portrait never overflows) */}
        <nav
          aria-label="Основная навигация"
          className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-zinc-300"
        >
          {NAV_LINKS.map((link) =>
            link.action === 'promotions' ? (
              <button
                key={link.label}
                type="button"
                onClick={openPromotions}
                className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#FFD400] after:transition-all after:duration-200 hover:after:w-full focus-visible:outline-none focus-visible:text-[#FFD400]"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={() => closeLegalPage(false)}
                className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#FFD400] after:transition-all after:duration-200 hover:after:w-full focus-visible:outline-none focus-visible:text-[#FFD400]"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Zone 3: Phone + Search + Orders + Cart + Mobile/Tablet Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0 min-w-0">
          <a
            href={RESTAURANT_INFO.phoneHref}
            className="hidden xl:inline-flex items-center gap-2 text-sm font-mono tabular-nums text-zinc-300 hover:text-[#FFD400] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded px-1.5 py-1"
          >
            <Phone className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
            <span>{RESTAURANT_INFO.phoneDisplay}</span>
          </a>

          <button
            type="button"
            onClick={openSearch}
            aria-label="Поиск блюд"
            className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-10 sm:px-3 sm:gap-2 rounded-lg bg-[#18181B] border border-white/10 text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Поиск</span>
          </button>

          <button
            type="button"
            onClick={() => openCart('history')}
            aria-label={`История заказов${orders.length > 0 ? `: ${orders.length}` : ''}`}
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-[#18181B] border border-[#FFD400]/30 text-zinc-100 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
          >
            <History className="w-4 h-4 text-[#FFD400] shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-medium">Заказы</span>
            {orders.length > 0 && (
              <span className="font-mono tabular-nums text-[11px] font-semibold bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 px-1.5 py-0.5 rounded">
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openCart('cart')}
            aria-label={`Открыть корзину, товаров: ${totalItemsCount}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-xs sm:text-sm hover:bg-[#ffe033] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className={totalItemsCount > 0 ? 'hidden sm:inline' : 'inline'}>Корзина</span>
            {totalItemsCount > 0 && (
              <span className="font-mono tabular-nums text-[11px] sm:text-xs bg-[#111111] text-[#FFD400] px-1.5 py-0.5 rounded">
                {totalItemsCount}
                <span className="hidden min-[380px]:inline"> · {cartSubtotal} ₽</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 text-zinc-200 hover:text-[#FFD400] hover:border-[#FFD400]/40 transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#141417] px-4 py-4 space-y-3">
          <nav aria-label="Мобильная навигация" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.action === 'promotions' ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openPromotions();
                  }}
                  className="text-left py-2.5 px-3 rounded-lg text-base font-medium text-zinc-200 hover:bg-white/[0.05] hover:text-[#FFD400] transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    closeLegalPage(false);
                  }}
                  className="py-2.5 px-3 rounded-lg text-base font-medium text-zinc-200 hover:bg-white/[0.05] hover:text-[#FFD400] transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCart('history');
              }}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg text-base font-medium text-zinc-100 bg-[#18181B] border border-[#FFD400]/25 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer mt-1"
            >
              <span className="inline-flex items-center gap-2">
                <History className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
                <span>История заказов</span>
              </span>
              {orders.length > 0 && (
                <span className="font-mono tabular-nums text-xs font-semibold bg-[#FFD400]/15 text-[#FFD400] px-2 py-0.5 rounded">
                  {orders.length}
                </span>
              )}
            </button>
          </nav>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-sm text-zinc-300">
            <a
              href={RESTAURANT_INFO.phoneHref}
              className="inline-flex items-center gap-2 font-mono tabular-nums text-[#FFD400]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>{RESTAURANT_INFO.phoneDisplay}</span>
            </a>
            <span className="text-xs text-zinc-400">{RESTAURANT_INFO.street}</span>
          </div>
        </div>
      )}
    </header>
  );
}
