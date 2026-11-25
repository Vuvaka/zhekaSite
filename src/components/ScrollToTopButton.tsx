import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const { toast } = useStore();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Subtle Toast when adding to cart */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-4 sm:left-6 z-40 max-w-xs px-4 py-2.5 rounded-lg bg-[#1C1C22] border border-[#FFD400]/50 text-sm text-white shadow-xl flex items-center gap-2.5 pointer-events-none"
          >
            <Check className="w-4 h-4 text-[#FFD400] shrink-0" aria-hidden="true" />
            <span className="truncate">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={scrollToTop}
            aria-label="Наверх"
            className="fixed bottom-6 right-4 sm:right-6 z-30 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#18181B]/95 border border-white/15 text-xs font-semibold text-white hover:border-[#FFD400] hover:text-[#FFD400] shadow-lg backdrop-blur-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Наверх</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
