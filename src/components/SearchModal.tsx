import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

export function SearchModal() {
  const {
    categories,
    menuItems,
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateQuantity,
    getItemQuantity,
    getSizedItemTotalQuantity,
    openSizePrompt,
    selectCategoryAndScroll,
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSearchOpen, closeSearch]);

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace('шаверм', 'шаурм');
    if (!q) return menuItems.slice(0, 6);
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (categoryMap.get(item.categoryId)?.toLowerCase().includes(q) ?? false)
    );
  }, [menuItems, searchQuery, categoryMap]);

  const handleGoToMenu = () => {
    closeSearch();
    selectCategoryAndScroll('all');
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-14 sm:pt-20"
          role="dialog"
          aria-modal="true"
          aria-label="Быстрый поиск по меню"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#16161A] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Search Input Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#FFD400] shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGoToMenu();
                }}
                placeholder="Найти блюдо: пельмени, чизбургер, шаурма, морс, мороженое..."
                aria-label="Поиск по меню"
                className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить строку поиска"
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 cursor-pointer"
                >
                  Сбросить
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Закрыть поиск"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
              <p className="text-xs text-zinc-400 px-1 mb-2">
                {searchQuery.trim()
                  ? `Найдено блюд: ${results.length}`
                  : 'Популярные блюда'}
              </p>

              {results.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-white mb-1">Ничего не найдено</p>
                  <p className="text-xs text-zinc-400">
                    Попробуйте ввести другое название блюда или категории.
                  </p>
                </div>
              ) : (
                results.map((item) => {
                  const hasSizes = Boolean(item.sizes && item.sizes.length > 0);
                  const qty = hasSizes
                    ? getSizedItemTotalQuantity(item)
                    : getItemQuantity(item.id);
                  const categoryName = categoryMap.get(item.categoryId) ?? '';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#18181B] border border-white/[0.06] hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodImage
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-12 rounded-lg shrink-0 border border-white/[0.06]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-400">
                            {categoryName} · <span className="font-mono tabular-nums">{item.weight}</span>
                            {hasSizes && (
                              <span className="text-[#FFD400] ml-1.5">· 3 размера</span>
                            )}
                          </p>
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono tabular-nums text-sm font-bold text-[#FFD400] whitespace-nowrap">
                          {hasSizes ? `от ${item.price} ₽` : `${item.price} ₽`}
                        </span>

                        {hasSizes ? (
                          <button
                            type="button"
                            onClick={() => openSizePrompt(item)}
                            aria-label={`Выбрать размер для ${item.name}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              qty > 0
                                ? 'bg-[#23232A] border border-[#FFD400]/50 text-[#FFD400]'
                                : 'bg-[#FFD400] text-[#111111] hover:bg-[#ffe033]'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{qty > 0 ? `${qty} шт.` : 'Размер'}</span>
                          </button>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              closeSearch();
                              addToCart(item);
                            }}
                            aria-label={`Добавить ${item.name} в корзину`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFD400] text-[#111111] text-xs font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">В корзину</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#23232A] border border-[#FFD400]/40">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              aria-label="Уменьшить"
                              className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center font-mono tabular-nums text-xs font-semibold text-[#FFD400]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              aria-label="Увеличить"
                              className="w-7 h-7 rounded flex items-center justify-center text-[#111111] bg-[#FFD400] hover:bg-[#ffe033] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.08] bg-[#141417] flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Нажмите Enter, чтобы перейти к результатам в меню
              </span>
              <button
                type="button"
                onClick={handleGoToMenu}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD400] hover:text-white transition-colors cursor-pointer"
              >
                <span>Показать в меню</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
