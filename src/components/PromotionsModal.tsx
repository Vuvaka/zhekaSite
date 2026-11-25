import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Percent, Truck, X } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';

const PROMOTIONS = [
  {
    id: 'delivery',
    title: `Бесплатная доставка от ${RESTAURANT_INFO.freeDeliveryThreshold} ₽`,
    subtitle: `При заказе до ${RESTAURANT_INFO.freeDeliveryThreshold} ₽ — ${RESTAURANT_INFO.deliveryFee} ₽ по г. Кандалакша`,
    icon: Truck,
  },
  {
    id: 'pickup',
    title: 'Скидка 10% на самовывоз',
    subtitle: `${RESTAURANT_INFO.street} · готовность 15–20 минут`,
    icon: Percent,
  },
  {
    id: 'fresh',
    title: 'Готовим сразу после заказа',
    subtitle: `Ежедневно ${RESTAURANT_INFO.hours} · доставка 30–45 минут`,
    icon: Clock,
  },
];

export function PromotionsModal() {
  const { isPromotionsOpen, closePromotions, selectCategoryAndScroll } = useStore();

  useEffect(() => {
    if (!isPromotionsOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePromotions();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPromotionsOpen, closePromotions]);

  return (
    <AnimatePresence>
      {isPromotionsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotions-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closePromotions}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#16161A] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
              <h2
                id="promotions-modal-title"
                className="font-display text-xl sm:text-2xl font-bold text-white"
              >
                Акции и доставка
              </h2>
              <button
                type="button"
                onClick={closePromotions}
                aria-label="Закрыть окно акций"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compact Promo Rows */}
            <div className="p-5 space-y-3">
              {PROMOTIONS.map((promo) => {
                const Icon = promo.icon;
                return (
                  <div
                    key={promo.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#18181B] border border-white/[0.08]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#FFD400]/10 border border-[#FFD400]/20 flex items-center justify-center text-[#FFD400] shrink-0">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                        {promo.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-snug">
                        {promo.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  closePromotions();
                  selectCategoryAndScroll('all');
                }}
                className="w-full mt-2 py-3 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
              >
                Перейти к меню
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
