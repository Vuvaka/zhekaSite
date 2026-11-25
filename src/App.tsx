import { MotionConfig } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { CategoriesSection } from './components/CategoriesSection';
import { MenuSection } from './components/MenuSection';
import { LegalPageView } from './components/LegalPageView';
import { AdminPanelView } from './components/AdminPanelView';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SaucePromptModal } from './components/SaucePromptModal';
import { SizePromptModal } from './components/SizePromptModal';
import { PromotionsModal } from './components/PromotionsModal';
import { AddressMapModal } from './components/AddressMapModal';
import { SearchModal } from './components/SearchModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function MainContent() {
  const { activeLegalPage, isAdminOpen } = useStore();

  if (isAdminOpen) {
    return (
      <main className="flex-1">
        <AdminPanelView />
      </main>
    );
  }

  if (activeLegalPage) {
    return (
      <main className="flex-1">
        <LegalPageView />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <HeroSlider />
      <CategoriesSection />
      <MenuSection />
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <div className="min-h-screen flex flex-col bg-[#111111] text-white">
            <Header />
            <MainContent />
            <Footer />
            <CartDrawer />
            <AddressMapModal />
            <SaucePromptModal />
            <SizePromptModal />
            <PromotionsModal />
            <SearchModal />
            <ScrollToTopButton />
          </div>
        </StoreProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
