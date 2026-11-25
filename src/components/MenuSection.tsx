import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { History, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

export function MenuSection() {
  const {
    categories,
    menuItems,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateQuantity,
    getItemQuantity,
    getSizedItemTotalQuantity,
    openSizePrompt,
    orders,
    openCart,
  } = useStore();

  const tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tablistRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!activeBtn) return;
    const targetLeft =
      activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, [activeCategory, categories.length]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      const headerHeight = window.innerWidth >= 640 ? 64 : 56;
      if (menuEl.getBoundingClientRect().top < headerHeight - 20) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase().replace('шаверм', 'шаурм');
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (categoryMap.get(item.categoryId)?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [menuItems, activeCategory, searchQuery, categoryMap]);

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-14 sm:scroll-mt-16"
    >
      {/* Header + Search + History Button */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#FFD400] mb-1.5">
            Горячие блюда каждый день
          </p>
          <h2
            id="menu-heading"
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
          >
            Наше меню
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск блюд: пельмени, шаурма, купаты, морс..."
              aria-label="Поиск блюд по меню"
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Очистить поиск"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => openCart('history')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <History className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
              <span>Мои заказы ({orders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Category Filter Bar */}
      <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2.5 pb-3 mb-7 bg-[#111111]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Фильтр по категориям"
          className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => handleSelectCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] ${
              activeCategory === 'all'
                ? 'bg-[#FFD400] text-[#111111] font-semibold'
                : 'bg-[#18181B] text-zinc-300 border border-white/[0.08] hover:text-white hover:border-white/25'
            }`}
          >
            Все блюда
          </button>

          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] ${
                  isActive
                    ? 'bg-[#FFD400] text-[#111111] font-semibold'
                    : 'bg-[#18181B] text-zinc-300 border border-white/[0.08] hover:text-white hover:border-white/25'
                }`}
              >
                {category.emoji} {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-xl bg-[#18181B] border border-white/[0.08]">
          <p className="font-display text-2xl font-semibold text-white mb-2">
            По вашему запросу ничего не найдено
          </p>
          <p className="text-sm text-zinc-400 mb-6">
            Попробуйте изменить запрос или сбросить фильтр категорий.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, idx) => {
            const hasSizes = Boolean(item.sizes && item.sizes.length > 0);
            const quantity = hasSizes
              ? getSizedItemTotalQuantity(item)
              : getItemQuantity(item.id);
            const categoryName = categoryMap.get(item.categoryId) ?? '';

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min((idx % 6) * 0.04, 0.2),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex flex-col rounded-xl overflow-hidden bg-[#18181B] border border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Dish Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                    <FoodImage src={item.image} alt={item.name} className="w-full h-full" />
                  </div>
                </div>

                {/* Dish Details */}
                <div className="flex-1 flex flex-col justify-between p-5">
                  <div>
                    {/* Clean unboxed metadata kicker */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                      <span>{categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.weight}</span>
                      {item.tag && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#FFD400] font-medium">{item.tag}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white leading-snug mb-2">
                      {item.name}
                    </h3>

                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-5">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Add to Cart Row */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2.5 sm:gap-4">
                    <span className="font-mono tabular-nums text-xl font-bold text-white whitespace-nowrap">
                      {hasSizes ? `от ${item.price} ₽` : `${item.price} ₽`}
                    </span>

                    {hasSizes ? (
                      <button
                        type="button"
                        onClick={() => openSizePrompt(item)}
                        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          quantity > 0
                            ? 'bg-[#222227] border border-[#FFD400]/50 text-[#FFD400] hover:border-[#FFD400]'
                            : 'bg-[#FFD400] text-[#111111] hover:bg-[#ffe033]'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {quantity > 0 ? `Размер (${quantity})` : 'Выбрать размер'}
                        </span>
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                        <span>В корзину</span>
                      </button>
                    ) : (
                      <div
                        className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#222227] border border-[#FFD400]/40 shrink-0"
                        aria-label={`Количество товара ${item.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          aria-label={`Уменьшить количество ${item.name}`}
                          className="w-8 h-8 rounded flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-7 text-center font-mono tabular-nums text-sm font-semibold text-[#FFD400]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          aria-label={`Увеличить количество ${item.name}`}
                          className="w-8 h-8 rounded flex items-center justify-center text-[#111111] bg-[#FFD400] hover:bg-[#ffe033] transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
