import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

const SLIDE_INTERVAL_MS = 4000;

export function HeroSlider() {
  const { heroSlides, selectCategoryAndScroll, openPromotions } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slidesCount = heroSlides.length;

  const goNext = useCallback(() => {
    if (slidesCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slidesCount);
  }, [slidesCount]);

  const goPrev = useCallback(() => {
    if (slidesCount <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slidesCount) % slidesCount);
  }, [slidesCount]);

  useEffect(() => {
    if (isPaused || slidesCount <= 1) return;
    const timer = window.setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, slidesCount]);

  if (slidesCount === 0) {
    return (
      <section
        id="hero"
        aria-label="Главные предложения Пелемешки"
        className="relative w-full bg-[#111111] py-16 sm:py-24 border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#FFD400] font-medium mb-3">
              <span>Горячие блюда каждый день</span>
              <span className="text-zinc-500" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-[#FFD400]" aria-hidden="true" />
                {RESTAURANT_INFO.fullAddress}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
              {RESTAURANT_INFO.brand} — доставка горячих блюд в Кандалакше
            </h1>
            <button
              type="button"
              onClick={() => selectCategoryAndScroll('all')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-sm sm:text-base hover:bg-[#ffe033] cursor-pointer"
            >
              <span>Перейти в меню</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const safeIndex = currentIndex % slidesCount;
  const activeSlide = heroSlides[safeIndex];

  return (
    <section
      id="hero"
      aria-label="Главные предложения Пелемешки"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full overflow-hidden bg-[#111111]"
    >
      <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[600px] w-full flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <FoodImage
              src={activeSlide.image}
              alt={activeSlide.title}
              priority
              className="w-full h-full"
            />
            {/* Measured contrast scrims >= 4.5:1 */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/75 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/35"
              aria-hidden="true"
            />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pb-20 lg:pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-content'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#FFD400] font-medium mb-3">
                <span>{activeSlide.kicker}</span>
                <span className="text-zinc-500" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-[#FFD400]" aria-hidden="true" />
                  {RESTAURANT_INFO.fullAddress}
                </span>
              </div>

              <h1
                className="font-display font-bold text-white leading-[1.08] tracking-tight mb-4"
                style={{
                  fontSize: 'clamp(1.75rem, 4.4vw, 3.75rem)',
                  textWrap: 'balance',
                }}
              >
                {activeSlide.title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-200 leading-relaxed max-w-xl mb-6 sm:mb-8">
                {activeSlide.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => selectCategoryAndScroll(activeSlide.categoryId)}
                  className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-sm sm:text-base hover:bg-[#ffe033] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>{activeSlide.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={openPromotions}
                  className="text-sm font-medium text-zinc-200 hover:text-[#FFD400] transition-colors underline underline-offset-4 decoration-white/25 hover:decoration-[#FFD400] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Бесплатная доставка от {RESTAURANT_INFO.freeDeliveryThreshold} ₽
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Prev / Next Controls */}
        {slidesCount > 1 && (
          <div className="hidden sm:flex items-center gap-2 absolute right-6 lg:right-10 bottom-20 lg:bottom-24 z-20">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Предыдущий баннер"
              className="w-11 h-11 rounded-lg bg-[#18181B]/85 border border-white/15 text-white flex items-center justify-center hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Следующий баннер"
              className="w-11 h-11 rounded-lg bg-[#18181B]/85 border border-white/15 text-white flex items-center justify-center hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bottom Indicators + Mobile Prev/Next */}
        <div
          className="absolute bottom-4 left-0 right-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3"
          role="tablist"
          aria-label="Переключение баннеров"
        >
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 min-w-0">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Баннер ${idx + 1}: ${slide.ctaLabel}`}
                  onClick={() => setCurrentIndex(idx)}
                  className="py-1.5 group cursor-pointer focus-visible:outline-none"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-7 sm:w-10 bg-[#FFD400]'
                        : 'w-2 sm:w-3.5 bg-white/30 group-hover:bg-white/60'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {slidesCount > 1 && (
              <div className="flex sm:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Предыдущий баннер"
                  className="w-8 h-8 rounded-lg bg-[#18181B]/90 border border-white/15 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Следующий баннер"
                  className="w-8 h-8 rounded-lg bg-[#18181B]/90 border border-white/15 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <span className="font-mono tabular-nums text-xs text-zinc-400">
              {String(safeIndex + 1).padStart(2, '0')} / {String(slidesCount).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
