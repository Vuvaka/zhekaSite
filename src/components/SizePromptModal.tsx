import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

export function SizePromptModal() {
  const {
    sizePromptItem,
    dismissSizePrompt,
    addSizedItemToCart,
    updateQuantity,
    getItemQuantity,
    openCart,
  } = useStore();

  useEffect(() => {
    if (!sizePromptItem) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissSizePrompt();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sizePromptItem, dismissSizePrompt]);

  const sizes = sizePromptItem?.sizes ?? [];
  const totalSelectedCount = sizes.reduce((sum, s) => sum + getItemQuantity(s.id), 0);
  const totalSelectedPrice = sizes.reduce(
    (sum, s) => sum + getItemQuantity(s.id) * s.price,
    0
  );

  return (
    <AnimatePresence>
      {sizePromptItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-prompt-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismissSizePrompt}
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
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <FoodImage
                  src={sizePromptItem.image}
                  alt={sizePromptItem.name}
                  className="w-14 h-14 rounded-xl shrink-0 border border-white/10"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#FFD400] mb-0.5">
                    {sizes.length === 3 ? '3 размера на выбор' : 'Выберите размер порции'}
                  </p>
                  <h2
                    id="size-prompt-title"
                    className="font-display text-2xl font-bold text-white leading-tight truncate"
                  >
                    {sizePromptItem.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Можно сразу добавить несколько порций разных размеров
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissSizePrompt}
                aria-label="Закрыть выбор размера"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size Options */}
            <div className="p-5 space-y-2.5 max-h-[55vh] overflow-y-auto">
              {sizes.map((size) => {
                const qty = getItemQuantity(size.id);

                return (
                  <div
                    key={size.id}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                      qty > 0
                        ? 'bg-[#1D1D23] border-[#FFD400]/50'
                        : 'bg-[#18181B] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {size.label}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        <span className="font-mono tabular-nums">{size.weight}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-[#FFD400] font-semibold text-sm">
                          {size.price} ₽
                        </span>
                      </p>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addSizedItemToCart(sizePromptItem, size)}
                        className="px-4 py-2 rounded-lg bg-[#FFD400] text-[#111111] text-xs sm:text-sm font-semibold hover:bg-[#ffe033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Добавить
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#23232A] border border-[#FFD400]/40 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(size.id, qty - 1)}
                          aria-label={`Уменьшить ${sizePromptItem.name} ${size.shortLabel}`}
                          className="w-8 h-8 rounded flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono tabular-nums text-sm font-semibold text-[#FFD400]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(size.id, qty + 1)}
                          aria-label={`Увеличить ${sizePromptItem.name} ${size.shortLabel}`}
                          className="w-8 h-8 rounded flex items-center justify-center text-[#111111] bg-[#FFD400] hover:bg-[#ffe033] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.08] bg-[#141417] space-y-3">
              {totalSelectedCount > 0 && (
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Выбрано порций: {totalSelectedCount}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#FFD400]">
                    {totalSelectedPrice} ₽
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {totalSelectedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => openCart('cart')}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/15 text-sm font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    <span>В корзину</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={dismissSizePrompt}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>{totalSelectedCount > 0 ? 'Готово' : 'Закрыть'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
