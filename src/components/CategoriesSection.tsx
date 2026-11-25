import { Search, Truck, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

export function CategoriesSection() {
  const {
    categories,
    menuItems,
    activeCategory,
    selectCategoryAndScroll,
    searchQuery,
    setSearchQuery,
    openPromotions,
  } = useStore();

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 sm:mb-10"
      >
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#FFD400] mb-1.5">
            Выбирайте вкус под настроение
          </p>
          <h2
            id="categories-heading"
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
          >
            Категории меню
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
          <div className="relative sm:w-72">
            <Search
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  selectCategoryAndScroll('all');
                }
              }}
              placeholder="Быстрый поиск блюд..."
              aria-label="Быстрый поиск по категориям и блюдам"
              className="w-full pl-10 pr-9 py-2 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] transition-colors"
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

          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <button
              type="button"
              onClick={() => selectCategoryAndScroll('all')}
              className="text-sm font-medium text-zinc-300 hover:text-[#FFD400] transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#FFD400] cursor-pointer whitespace-nowrap"
            >
              Показать все блюда
            </button>

            <span className="text-zinc-600 select-none" aria-hidden="true">
              ·
            </span>

            <button
              type="button"
              onClick={openPromotions}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FFD400] hover:text-white transition-colors underline underline-offset-4 decoration-[#FFD400]/40 hover:decoration-white cursor-pointer whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Акции и доставка</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {categories.map((category, index) => {
          const isSelected = activeCategory === category.id;
          const count = menuItems.filter((item) => item.categoryId === category.id).length;

          return (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => selectCategoryAndScroll(category.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.04, 0.24),
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group relative text-left rounded-xl overflow-hidden bg-[#18181B] border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] ${
                isSelected
                  ? 'border-[#FFD400] shadow-[0_0_0_1px_rgba(255,212,0,0.4)]'
                  : 'border-white/[0.08] hover:border-white/25'
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                  <FoodImage src={category.image} alt={category.name} className="w-full h-full" />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/55 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <span className="font-display text-sm sm:text-lg lg:text-xl font-semibold text-white group-hover:text-[#FFD400] transition-colors truncate">
                      {category.emoji} {category.name}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] sm:text-xs text-zinc-400 shrink-0">
                      {count}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-1">{category.subtitle}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
