import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FoodImage } from './FoodImage';

export function SaucePromptModal() {
  const {
    menuItems,
    saucePromptItem,
    dismissSaucePrompt,
    addToCart,
    updateQuantity,
    getItemQuantity,
  } = useStore();

  const sauces = useMemo(
    () => menuItems.filter((item) => item.categoryId === 'sauces'),
    [menuItems]
  );

  useEffect(() => {
    if (!saucePromptItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissSaucePrompt();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saucePromptItem, dismissSaucePrompt]);

  const totalSaucesSelected = sauces.reduce((sum, s) => sum + getItemQuantity(s.id), 0);

  return (
    <AnimatePresence>
      {saucePromptItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sauce-prompt-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismissSaucePrompt}
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
              <div>
                <p className="text-xs font-medium text-[#FFD400] mb-1">
                  Добавлено в корзину: {saucePromptItem.name}
                </p>
                <h2
                  id="sauce-prompt-title"
                  className="font-display text-2xl font-bold text-white leading-tight"
                >
                  Нужен ли соус?
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Соусы заказываются отдельно — выберите подходящий вкус к вашему блюду.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissSaucePrompt}
                aria-label="Закрыть выбор соуса"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sauce Choices */}
            <div className="p-5 space-y-2.5 max-h-[55vh] overflow-y-auto">
              {sauces.map((sauce) => {
                const qty = getItemQuantity(sauce.id);

                return (
                  <div
                    key={sauce.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                      qty > 0
                        ? 'bg-[#1D1D23] border-[#FFD400]/50'
                        : 'bg-[#18181B] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FoodImage
                        src={sauce.image}
                        alt={sauce.name}
                        className="w-12 h-12 rounded-lg shrink-0 border border-white/[0.06]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {sauce.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          <span className="font-mono tabular-nums">{sauce.weight}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-[#FFD400] font-semibold">
                            {sauce.price} ₽
                          </span>
                        </p>
                      </div>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(sauce)}
                        className="px-3.5 py-2 rounded-lg bg-[#FFD400] text-[#111111] text-xs font-semibold hover:bg-[#ffe033] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Добавить
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#23232A] border border-[#FFD400]/40 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(sauce.id, qty - 1)}
                          aria-label={`Уменьшить ${sauce.name}`}
                          className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono tabular-nums text-xs font-semibold text-[#FFD400]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(sauce.id, qty + 1)}
                          aria-label={`Увеличить ${sauce.name}`}
                          className="w-7 h-7 rounded flex items-center justify-center text-[#111111] bg-[#FFD400] hover:bg-[#ffe033] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-white/[0.08] bg-[#141417] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={dismissSaucePrompt}
                className="flex-1 py-2.5 px-4 rounded-lg border border-white/15 text-sm font-medium text-zinc-200 hover:border-white/35 hover:text-white transition-colors cursor-pointer"
              >
                Без соуса
              </button>
              <button
                type="button"
                onClick={dismissSaucePrompt}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>{totalSaucesSelected > 0 ? 'Готово' : 'Продолжить'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
