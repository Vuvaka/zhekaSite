import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { CATEGORIES, HERO_SLIDES, MENU_ITEMS, RESTAURANT_INFO } from '../data/catalog';
import {
  OperationType,
  PRIMARY_ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';
import {
  CartItem,
  Category,
  CategoryId,
  DeliveryMethod,
  DishSizeOption,
  HeroSlide,
  MenuItem,
  Order,
  OrderFormData,
} from '../types/menu';

type CartTab = 'cart' | 'checkout' | 'payment' | 'success' | 'history';

interface ToastMessage {
  id: number;
  text: string;
}

export type LegalPageType = 'privacy' | 'consent';

export interface SavedDeliveryAddress {
  deliveryMethod: DeliveryMethod;
  streetAddress: string;
  apartmentDetails: string;
  lat: number;
  lng: number;
  confirmed: boolean;
}

const SAUCE_PROMPT_CATEGORIES: ReadonlySet<CategoryId> = new Set<CategoryId>([
  'snacks',
  'pelmeni',
  'kupaty',
  'fries',
  'chicken',
]);

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function makeSafeId(rawId: string | undefined, prefix: string, maxLen: number): string {
  if (rawId && VALID_ID_REGEX.test(rawId)) {
    return rawId.slice(0, maxLen);
  }
  return `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`.slice(0, maxLen);
}

function sanitizeMenuItemPayload(
  item: MenuItem,
  sortOrderFallback: number
): {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  weight: string;
  price: number;
  image: string;
  tag?: string;
  available: boolean;
  sortOrder: number;
  sizes?: DishSizeOption[];
} {
  const safeId = makeSafeId(item.id, 'dish', 80);
  const safeCategoryId = makeSafeId(item.categoryId, 'cat', 64);
  const safePrice = Math.min(100000, Math.max(0, Math.round(Number(item.price) || 0)));
  const safeSortOrder = Math.min(
    100000,
    Math.max(0, Math.round(Number(item.sortOrder ?? sortOrderFallback) || 0))
  );

  const payload: {
    id: string;
    categoryId: CategoryId;
    name: string;
    description: string;
    weight: string;
    price: number;
    image: string;
    tag?: string;
    available: boolean;
    sortOrder: number;
    sizes?: DishSizeOption[];
  } = {
    id: safeId,
    categoryId: safeCategoryId,
    name: item.name.trim().slice(0, 140),
    description: item.description.trim().slice(0, 500),
    weight: item.weight.trim().slice(0, 40),
    price: safePrice,
    image: item.image.trim().slice(0, 500),
    available: item.available !== false,
    sortOrder: safeSortOrder,
  };

  const trimmedTag = item.tag?.trim().slice(0, 40);
  if (trimmedTag) {
    payload.tag = trimmedTag;
  }

  if (item.sizes && item.sizes.length > 0) {
    payload.sizes = item.sizes.slice(0, 6).map((sz, idx) => ({
      id: makeSafeId(sz.id, `${safeId}-size-${idx + 1}`, 80),
      label: sz.label.trim().slice(0, 60) || `Вариант ${idx + 1}`,
      shortLabel: sz.shortLabel.trim().slice(0, 20) || `S${idx + 1}`,
      weight: sz.weight.trim().slice(0, 40),
      price: Math.min(100000, Math.max(0, Math.round(Number(sz.price) || 0))),
    }));
  }

  return payload;
}

function sanitizeCategoryPayload(
  category: Category,
  sortOrderFallback: number
): {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  image: string;
  available: boolean;
  sortOrder: number;
} {
  const safeId = makeSafeId(category.id, 'cat', 64);
  const safeSortOrder = Math.min(
    100000,
    Math.max(0, Math.round(Number(category.sortOrder ?? sortOrderFallback) || 0))
  );

  return {
    id: safeId,
    name: category.name.trim().slice(0, 80) || 'Новая категория',
    emoji: category.emoji.trim().slice(0, 16) || '🍽️',
    subtitle: category.subtitle.trim().slice(0, 200),
    image: category.image.trim().slice(0, 500),
    available: category.available !== false,
    sortOrder: safeSortOrder,
  };
}

function sanitizeHeroSlidePayload(
  slide: HeroSlide,
  sortOrderFallback: number
): {
  id: string;
  categoryId: CategoryId;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
  image: string;
  available: boolean;
  sortOrder: number;
} {
  const safeId = makeSafeId(slide.id, 'slide', 80);
  const safeCategoryId = makeSafeId(slide.categoryId, 'cat', 64);
  const safeSortOrder = Math.min(
    100000,
    Math.max(0, Math.round(Number(slide.sortOrder ?? sortOrderFallback) || 0))
  );

  return {
    id: safeId,
    categoryId: safeCategoryId,
    kicker: slide.kicker.trim().slice(0, 140),
    title: slide.title.trim().slice(0, 180) || 'Новое предложение',
    description: slide.description.trim().slice(0, 500),
    ctaLabel: slide.ctaLabel.trim().slice(0, 80) || 'Перейти к разделу',
    image: slide.image.trim().slice(0, 500),
    available: slide.available !== false,
    sortOrder: safeSortOrder,
  };
}

interface StoreContextValue {
  cart: CartItem[];
  orders: Order[];
  menuItems: MenuItem[];
  allMenuItems: MenuItem[];
  categories: Category[];
  allCategories: Category[];
  heroSlides: HeroSlide[];
  allHeroSlides: HeroSlide[];
  isCatalogSeeded: boolean;
  isCategoriesSeeded: boolean;
  isSlidesSeeded: boolean;
  isCatalogLoading: boolean;
  authUser: User | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  activeCategory: 'all' | CategoryId;
  searchQuery: string;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isPromotionsOpen: boolean;
  isAddressMapOpen: boolean;
  isAdminOpen: boolean;
  activeLegalPage: LegalPageType | null;
  cartTab: CartTab;
  lastCreatedOrder: Order | null;
  saucePromptItem: MenuItem | null;
  sizePromptItem: MenuItem | null;
  savedAddress: SavedDeliveryAddress;
  toast: ToastMessage | null;
  totalItemsCount: number;
  cartSubtotal: number;
  setActiveCategory: (category: 'all' | CategoryId) => void;
  setSearchQuery: (query: string) => void;
  openCart: (tab?: CartTab) => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openPromotions: () => void;
  closePromotions: () => void;
  openAddressMap: (returnToCheckout?: boolean) => void;
  closeAddressMap: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  openLegalPage: (page: LegalPageType) => void;
  closeLegalPage: (reopenCheckout?: boolean) => void;
  confirmAddressSelection: (next: SavedDeliveryAddress) => void;
  setSavedDeliveryMethod: (method: DeliveryMethod) => void;
  setCartTab: (tab: CartTab) => void;
  addToCart: (item: MenuItem) => void;
  addSizedItemToCart: (parentItem: MenuItem, size: DishSizeOption) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getSizedItemTotalQuantity: (item: MenuItem) => number;
  submitOrder: (formData: OrderFormData) => Promise<Order>;
  repeatOrder: (order: Order) => void;
  selectCategoryAndScroll: (category: 'all' | CategoryId) => void;
  dismissSaucePrompt: () => void;
  openSizePrompt: (item: MenuItem) => void;
  dismissSizePrompt: () => void;
  signInAsAdmin: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  seedMenuToFirestore: () => Promise<void>;
  saveMenuItem: (item: MenuItem, isNew: boolean) => Promise<void>;
  quickUpdatePrice: (itemId: string, nextPrice: number) => Promise<void>;
  toggleItemAvailability: (itemId: string, available: boolean) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  saveCategory: (category: Category, isNew: boolean) => Promise<void>;
  toggleCategoryAvailability: (categoryId: string, available: boolean) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveHeroSlide: (slide: HeroSlide, isNew: boolean) => Promise<void>;
  toggleSlideAvailability: (slideId: string, available: boolean) => Promise<void>;
  deleteHeroSlide: (slideId: string) => Promise<void>;
}

const CART_STORAGE_KEY = 'pelemeshka_cart_v1';
const ORDERS_STORAGE_KEY = 'pelemeshka_orders_v1';

const DEFAULT_SAVED_ADDRESS: SavedDeliveryAddress = {
  deliveryMethod: 'delivery',
  streetAddress: '',
  apartmentDetails: '',
  lat: 67.1572,
  lng: 32.4119,
  confirmed: false,
};

const FALLBACK_CATALOG_ITEMS: MenuItem[] = MENU_ITEMS.map((item, idx) => ({
  ...item,
  available: true,
  sortOrder: idx + 1,
}));

const FALLBACK_CATEGORIES: Category[] = CATEGORIES.map((cat, idx) => ({
  ...cat,
  available: true,
  sortOrder: idx + 1,
}));

const FALLBACK_HERO_SLIDES: HeroSlide[] = HERO_SLIDES.map((slide, idx) => ({
  ...slide,
  available: true,
  sortOrder: idx + 1,
}));

const StoreContext = createContext<StoreContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isAdminRouteRequested(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hash === '#admin' ||
    new URLSearchParams(window.location.search).get('admin') === '1'
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage<CartItem[]>(CART_STORAGE_KEY, []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage<Order[]>(ORDERS_STORAGE_KEY, []));
  const [firestoreMenuItems, setFirestoreMenuItems] = useState<MenuItem[]>([]);
  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>([]);
  const [firestoreHeroSlides, setFirestoreHeroSlides] = useState<HeroSlide[]>([]);
  const [isCatalogSeeded, setIsCatalogSeeded] = useState(false);
  const [isCategoriesSeeded, setIsCategoriesSeeded] = useState(false);
  const [isSlidesSeeded, setIsSlidesSeeded] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeCategory, setActiveCategory] = useState<'all' | CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(false);
  const [isAddressMapOpen, setIsAddressMapOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => isAdminRouteRequested());
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);
  const [returnToCheckoutAfterMap, setReturnToCheckoutAfterMap] = useState(false);
  const [cartTab, setCartTab] = useState<CartTab>('cart');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [saucePromptItem, setSaucePromptItem] = useState<MenuItem | null>(null);
  const [sizePromptItem, setSizePromptItem] = useState<MenuItem | null>(null);
  const [savedAddress, setSavedAddress] = useState<SavedDeliveryAddress>(DEFAULT_SAVED_ADDRESS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Firebase Auth listener & admin check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setIsAdmin(false);
        setIsAuthReady(true);
        return;
      }

      if (user.email === PRIMARY_ADMIN_EMAIL && user.emailVerified) {
        setIsAdmin(true);
        setIsAuthReady(true);
        return;
      }

      if (user.emailVerified) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(adminDoc.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time menu listener
  useEffect(() => {
    const q = query(collection(db, 'menu_items'), orderBy('sortOrder', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setFirestoreMenuItems([]);
          setIsCatalogSeeded(false);
        } else {
          const loaded: MenuItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: String(data.id || docSnap.id),
              categoryId: String(data.categoryId || 'pelmeni'),
              name: String(data.name || ''),
              description: String(data.description || ''),
              weight: String(data.weight || ''),
              price: Number(data.price || 0),
              image: String(data.image || ''),
              tag: typeof data.tag === 'string' && data.tag ? data.tag : undefined,
              available: data.available !== false,
              sortOrder: Number(data.sortOrder ?? 0),
              sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : undefined,
            };
          });
          setFirestoreMenuItems(loaded);
          setIsCatalogSeeded(true);
        }
        setIsCatalogLoading(false);
      },
      (error) => {
        setIsCatalogLoading(false);
        handleFirestoreError(error, OperationType.GET, 'menu_items');
      }
    );

    return () => unsubscribe();
  }, []);

  // Firestore real-time categories listener
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setFirestoreCategories([]);
          setIsCategoriesSeeded(false);
        } else {
          const loaded: Category[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: String(data.id || docSnap.id),
              name: String(data.name || ''),
              emoji: String(data.emoji || '🍽️'),
              subtitle: String(data.subtitle || ''),
              image: String(data.image || ''),
              available: data.available !== false,
              sortOrder: Number(data.sortOrder ?? 0),
            };
          });
          setFirestoreCategories(loaded);
          setIsCategoriesSeeded(true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    );

    return () => unsubscribe();
  }, []);

  // Firestore real-time hero_slides listener
  useEffect(() => {
    const q = query(collection(db, 'hero_slides'), orderBy('sortOrder', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setFirestoreHeroSlides([]);
          setIsSlidesSeeded(false);
        } else {
          const loaded: HeroSlide[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: String(data.id || docSnap.id),
              categoryId: String(data.categoryId || 'pelmeni'),
              kicker: String(data.kicker || ''),
              title: String(data.title || ''),
              description: String(data.description || ''),
              ctaLabel: String(data.ctaLabel || 'Перейти'),
              image: String(data.image || ''),
              available: data.available !== false,
              sortOrder: Number(data.sortOrder ?? 0),
            };
          });
          setFirestoreHeroSlides(loaded);
          setIsSlidesSeeded(true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'hero_slides');
      }
    );

    return () => unsubscribe();
  }, []);

  const allMenuItems = useMemo(
    () => (isCatalogSeeded ? firestoreMenuItems : FALLBACK_CATALOG_ITEMS),
    [isCatalogSeeded, firestoreMenuItems]
  );

  const menuItems = useMemo(
    () => allMenuItems.filter((item) => item.available !== false),
    [allMenuItems]
  );

  const allCategories = useMemo(
    () => (isCategoriesSeeded ? firestoreCategories : FALLBACK_CATEGORIES),
    [isCategoriesSeeded, firestoreCategories]
  );

  const categories = useMemo(
    () => allCategories.filter((cat) => cat.available !== false),
    [allCategories]
  );

  const allHeroSlides = useMemo(
    () => (isSlidesSeeded ? firestoreHeroSlides : FALLBACK_HERO_SLIDES),
    [isSlidesSeeded, firestoreHeroSlides]
  );

  const heroSlides = useMemo(
    () => allHeroSlides.filter((slide) => slide.available !== false),
    [allHeroSlides]
  );

  // Reset activeCategory to 'all' if the selected category was hidden or deleted
  useEffect(() => {
    if (
      activeCategory !== 'all' &&
      categories.length > 0 &&
      !categories.some((cat) => cat.id === activeCategory)
    ) {
      setActiveCategory('all');
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore quota errors
    }
  }, [orders]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (text: string) => {
    setToast({ id: Date.now(), text });
  };

  const totalItemsCount = useMemo(
    () => cart.reduce((acc, entry) => acc + entry.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0),
    [cart]
  );

  const openCart = (tab: CartTab = 'cart') => {
    setIsSearchOpen(false);
    setIsPromotionsOpen(false);
    setIsAddressMapOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setCartTab(tab);
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openSearch = () => {
    setIsCartOpen(false);
    setIsPromotionsOpen(false);
    setIsAddressMapOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const openPromotions = () => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsAddressMapOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setIsPromotionsOpen(true);
  };

  const closePromotions = () => {
    setIsPromotionsOpen(false);
  };

  const openAddressMap = (returnToCheckout = true) => {
    setIsSearchOpen(false);
    setIsPromotionsOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setReturnToCheckoutAfterMap(returnToCheckout);
    setIsAddressMapOpen(true);
  };

  const closeAddressMap = () => {
    setIsAddressMapOpen(false);
  };

  const openAdmin = () => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsPromotionsOpen(false);
    setIsAddressMapOpen(false);
    setActiveLegalPage(null);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setIsAdminOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const openLegalPage = (page: LegalPageType) => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsPromotionsOpen(false);
    setIsAddressMapOpen(false);
    setIsAdminOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(null);
    setActiveLegalPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeLegalPage = (reopenCheckout = false) => {
    setActiveLegalPage(null);
    setIsAdminOpen(false);
    if (reopenCheckout) {
      setCartTab('checkout');
      setIsCartOpen(true);
    }
  };

  const confirmAddressSelection = (next: SavedDeliveryAddress) => {
    setSavedAddress(next);
    setIsAddressMapOpen(false);
    if (returnToCheckoutAfterMap) {
      setCartTab('checkout');
      setIsCartOpen(true);
    }
    showToast(
      next.deliveryMethod === 'pickup'
        ? 'Выбран самовывоз (−10%)'
        : `Адрес выбран: ${next.streetAddress}`
    );
  };

  const setSavedDeliveryMethod = (method: DeliveryMethod) => {
    setSavedAddress((prev) => ({ ...prev, deliveryMethod: method }));
  };

  const openSizePrompt = (item: MenuItem) => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsPromotionsOpen(false);
    setIsAddressMapOpen(false);
    setSaucePromptItem(null);
    setSizePromptItem(item);
  };

  const dismissSizePrompt = () => {
    setSizePromptItem(null);
  };

  const addToCart = (item: MenuItem) => {
    if (item.sizes && item.sizes.length > 0) {
      openSizePrompt(item);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    showToast(`Добавлено: ${item.name}`);

    if (
      SAUCE_PROMPT_CATEGORIES.has(item.categoryId) &&
      menuItems.some((entry) => entry.categoryId === 'sauces')
    ) {
      setSaucePromptItem(item);
    }
  };

  const addSizedItemToCart = (parentItem: MenuItem, size: DishSizeOption) => {
    const sizedItem: MenuItem = {
      id: size.id,
      categoryId: parentItem.categoryId,
      name: `${parentItem.name} ${size.shortLabel}`,
      description: parentItem.description,
      weight: size.weight,
      price: size.price,
      image: parentItem.image,
    };

    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === sizedItem.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === sizedItem.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { item: sizedItem, quantity: 1 }];
    });
    showToast(`Добавлено: ${sizedItem.name}`);
  };

  const dismissSaucePrompt = () => {
    setSaucePromptItem(null);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((entry) => entry.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((entry) => (entry.item.id === itemId ? { ...entry, quantity } : entry))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantity = (itemId: string) => {
    return cart.find((entry) => entry.item.id === itemId)?.quantity ?? 0;
  };

  const getSizedItemTotalQuantity = (item: MenuItem) => {
    if (!item.sizes || item.sizes.length === 0) {
      return getItemQuantity(item.id);
    }
    return item.sizes.reduce((sum, size) => sum + getItemQuantity(size.id), 0);
  };

  const submitOrder = async (formData: OrderFormData): Promise<Order> => {
    const subtotal = cartSubtotal;
    const isPickup = formData.deliveryMethod === 'pickup';
    const discount = isPickup ? Math.round(subtotal * RESTAURANT_INFO.pickupDiscountRate) : 0;
    const afterDiscount = subtotal - discount;
    const deliveryFee =
      isPickup || subtotal >= RESTAURANT_INFO.freeDeliveryThreshold ? 0 : RESTAURANT_INFO.deliveryFee;
    const total = Math.max(0, afterDiscount + deliveryFee);

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `${Date.now()}-${randomDigits}`,
      orderNumber: `ПМ-${randomDigits}`,
      createdAt: new Date().toISOString(),
      items: cart,
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      address: isPickup ? RESTAURANT_INFO.fullAddress : formData.address.trim(),
      comment: formData.comment.trim(),
      deliveryMethod: formData.deliveryMethod,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'card' ? 'paid_online' : 'on_delivery',
      subtotal,
      discount,
      deliveryFee,
      total,
      estimatedMinutes: isPickup ? '15–20 минут' : '30–45 минут',
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          consentAccepted: Boolean(formData.consentAccepted),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.status === 400 && errorData?.error) {
          throw new Error(errorData.error);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message && !err.message.includes('fetch')) {
        throw err;
      }
    }

    setOrders((prev) => [newOrder, ...prev].slice(0, 20));
    setLastCreatedOrder(newOrder);
    setCart([]);
    setCartTab('success');
    return newOrder;
  };

  const repeatOrder = (order: Order) => {
    setCart(order.items);
    setCartTab('cart');
    showToast(`Заказ #${order.orderNumber} добавлен в корзину`);
  };

  const selectCategoryAndScroll = (category: 'all' | CategoryId) => {
    setActiveLegalPage(null);
    setIsAdminOpen(false);
    setActiveCategory(category);
    window.setTimeout(() => {
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  // Admin Auth & Firestore CRUD operations
  const signInAsAdmin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutAdmin = async () => {
    await signOut(auth);
  };

  const seedMenuToFirestore = async () => {
    const batch = writeBatch(db);

    if (!isCatalogSeeded) {
      MENU_ITEMS.forEach((item, index) => {
        const sanitized = sanitizeMenuItemPayload(item, index + 1);
        batch.set(doc(db, 'menu_items', sanitized.id), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    if (!isCategoriesSeeded) {
      CATEGORIES.forEach((cat, index) => {
        const sanitized = sanitizeCategoryPayload(cat, index + 1);
        batch.set(doc(db, 'categories', sanitized.id), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    if (!isSlidesSeeded) {
      HERO_SLIDES.forEach((slide, index) => {
        const sanitized = sanitizeHeroSlidePayload(slide, index + 1);
        batch.set(doc(db, 'hero_slides', sanitized.id), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    try {
      await batch.commit();
      showToast('Каталог, категории и слайды загружены в базу');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'menu_items');
    }
  };

  const ensureMenuItemsSeededBatch = (
    batch: ReturnType<typeof writeBatch>,
    skipId?: string
  ) => {
    if (isCatalogSeeded) return;
    MENU_ITEMS.forEach((item, index) => {
      if (skipId && item.id === skipId) return;
      const sanitized = sanitizeMenuItemPayload(item, index + 1);
      batch.set(doc(db, 'menu_items', sanitized.id), {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  };

  const saveMenuItem = async (item: MenuItem, isNew: boolean) => {
    const sanitized = sanitizeMenuItemPayload(item, allMenuItems.length + 1);
    const path = `menu_items/${sanitized.id}`;
    const docRef = doc(db, 'menu_items', sanitized.id);

    try {
      if (!isCatalogSeeded) {
        const batch = writeBatch(db);
        ensureMenuItemsSeededBatch(batch, isNew ? undefined : sanitized.id);
        batch.set(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        showToast(isNew ? `Блюдо добавлено: ${sanitized.name}` : `Сохранено: ${sanitized.name}`);
        return;
      }

      if (isNew) {
        await setDoc(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast(`Блюдо добавлено: ${sanitized.name}`);
      } else {
        const updatePayload: Record<string, unknown> = {
          categoryId: sanitized.categoryId,
          name: sanitized.name,
          description: sanitized.description,
          weight: sanitized.weight,
          price: sanitized.price,
          image: sanitized.image,
          tag: sanitized.tag ?? '',
          available: sanitized.available,
          sortOrder: sanitized.sortOrder,
          sizes: sanitized.sizes ?? [],
          updatedAt: serverTimestamp(),
        };
        await updateDoc(docRef, updatePayload);
        showToast(`Сохранено: ${sanitized.name}`);
      }
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const quickUpdatePrice = async (itemId: string, nextPrice: number) => {
    const safePrice = Math.min(100000, Math.max(0, Math.round(Number(nextPrice) || 0)));
    const path = `menu_items/${itemId}`;
    try {
      if (!isCatalogSeeded) {
        const batch = writeBatch(db);
        MENU_ITEMS.forEach((item, idx) => {
          const sanitized = sanitizeMenuItemPayload(
            item.id === itemId ? { ...item, price: safePrice } : item,
            idx + 1
          );
          batch.set(doc(db, 'menu_items', sanitized.id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'menu_items', itemId), {
          price: safePrice,
          updatedAt: serverTimestamp(),
        });
      }
      showToast('Цена обновлена');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleItemAvailability = async (itemId: string, available: boolean) => {
    const path = `menu_items/${itemId}`;
    try {
      if (!isCatalogSeeded) {
        const batch = writeBatch(db);
        MENU_ITEMS.forEach((item, idx) => {
          const sanitized = sanitizeMenuItemPayload(
            { ...item, available: item.id === itemId ? available : true },
            idx + 1
          );
          batch.set(doc(db, 'menu_items', sanitized.id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'menu_items', itemId), {
          available,
          updatedAt: serverTimestamp(),
        });
      }
      showToast(available ? 'Блюдо возвращено в меню' : 'Блюдо скрыто из меню');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    const path = `menu_items/${itemId}`;
    try {
      if (!isCatalogSeeded) {
        const batch = writeBatch(db);
        ensureMenuItemsSeededBatch(batch, itemId);
        await batch.commit();
      } else {
        await deleteDoc(doc(db, 'menu_items', itemId));
      }
      showToast('Блюдо удалено');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Category CRUD (auto-seeds default categories on first mutation if needed)
  const ensureCategoriesSeededBatch = (
    batch: ReturnType<typeof writeBatch>,
    skipId?: string
  ) => {
    if (isCategoriesSeeded) return;
    CATEGORIES.forEach((cat, idx) => {
      if (skipId && cat.id === skipId) return;
      const sanitized = sanitizeCategoryPayload(cat, idx + 1);
      batch.set(doc(db, 'categories', sanitized.id), {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  };

  const saveCategory = async (category: Category, isNew: boolean) => {
    const sanitized = sanitizeCategoryPayload(category, allCategories.length + 1);
    const path = `categories/${sanitized.id}`;
    const docRef = doc(db, 'categories', sanitized.id);

    try {
      if (!isCategoriesSeeded) {
        const batch = writeBatch(db);
        ensureCategoriesSeededBatch(batch, isNew ? undefined : sanitized.id);
        batch.set(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        showToast(isNew ? `Категория добавлена: ${sanitized.name}` : `Сохранено: ${sanitized.name}`);
        return;
      }

      if (isNew) {
        await setDoc(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast(`Категория добавлена: ${sanitized.name}`);
      } else {
        await updateDoc(docRef, {
          name: sanitized.name,
          emoji: sanitized.emoji,
          subtitle: sanitized.subtitle,
          image: sanitized.image,
          available: sanitized.available,
          sortOrder: sanitized.sortOrder,
          updatedAt: serverTimestamp(),
        });
        showToast(`Категория сохранена: ${sanitized.name}`);
      }
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const toggleCategoryAvailability = async (categoryId: string, available: boolean) => {
    const path = `categories/${categoryId}`;
    try {
      if (!isCategoriesSeeded) {
        const batch = writeBatch(db);
        CATEGORIES.forEach((cat, idx) => {
          const sanitized = sanitizeCategoryPayload(
            { ...cat, available: cat.id === categoryId ? available : true },
            idx + 1
          );
          batch.set(doc(db, 'categories', sanitized.id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'categories', categoryId), {
          available,
          updatedAt: serverTimestamp(),
        });
      }
      showToast(available ? 'Категория показана на сайте' : 'Категория скрыта');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const path = `categories/${categoryId}`;
    try {
      if (!isCategoriesSeeded) {
        const batch = writeBatch(db);
        ensureCategoriesSeededBatch(batch, categoryId);
        await batch.commit();
      } else {
        await deleteDoc(doc(db, 'categories', categoryId));
      }
      showToast('Категория удалена');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Hero Slide CRUD (auto-seeds default slides on first mutation if needed)
  const ensureHeroSlidesSeededBatch = (
    batch: ReturnType<typeof writeBatch>,
    skipId?: string
  ) => {
    if (isSlidesSeeded) return;
    HERO_SLIDES.forEach((slide, idx) => {
      if (skipId && slide.id === skipId) return;
      const sanitized = sanitizeHeroSlidePayload(slide, idx + 1);
      batch.set(doc(db, 'hero_slides', sanitized.id), {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  };

  const saveHeroSlide = async (slide: HeroSlide, isNew: boolean) => {
    const sanitized = sanitizeHeroSlidePayload(slide, allHeroSlides.length + 1);
    const path = `hero_slides/${sanitized.id}`;
    const docRef = doc(db, 'hero_slides', sanitized.id);

    try {
      if (!isSlidesSeeded) {
        const batch = writeBatch(db);
        ensureHeroSlidesSeededBatch(batch, isNew ? undefined : sanitized.id);
        batch.set(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        showToast(isNew ? 'Слайд добавлен на главную' : 'Слайд обновлён');
        return;
      }

      if (isNew) {
        await setDoc(docRef, {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Слайд добавлен на главную');
      } else {
        await updateDoc(docRef, {
          categoryId: sanitized.categoryId,
          kicker: sanitized.kicker,
          title: sanitized.title,
          description: sanitized.description,
          ctaLabel: sanitized.ctaLabel,
          image: sanitized.image,
          available: sanitized.available,
          sortOrder: sanitized.sortOrder,
          updatedAt: serverTimestamp(),
        });
        showToast('Слайд обновлён');
      }
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const toggleSlideAvailability = async (slideId: string, available: boolean) => {
    const path = `hero_slides/${slideId}`;
    try {
      if (!isSlidesSeeded) {
        const batch = writeBatch(db);
        HERO_SLIDES.forEach((slide, idx) => {
          const sanitized = sanitizeHeroSlidePayload(
            { ...slide, available: slide.id === slideId ? available : true },
            idx + 1
          );
          batch.set(doc(db, 'hero_slides', sanitized.id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'hero_slides', slideId), {
          available,
          updatedAt: serverTimestamp(),
        });
      }
      showToast(available ? 'Слайд включён в карусель' : 'Слайд скрыт');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteHeroSlide = async (slideId: string) => {
    const path = `hero_slides/${slideId}`;
    try {
      if (!isSlidesSeeded) {
        const batch = writeBatch(db);
        ensureHeroSlidesSeededBatch(batch, slideId);
        await batch.commit();
      } else {
        await deleteDoc(doc(db, 'hero_slides', slideId));
      }
      showToast('Слайд удалён');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        orders,
        menuItems,
        allMenuItems,
        categories,
        allCategories,
        heroSlides,
        allHeroSlides,
        isCatalogSeeded,
        isCategoriesSeeded,
        isSlidesSeeded,
        isCatalogLoading,
        authUser,
        isAuthReady,
        isAdmin,
        activeCategory,
        searchQuery,
        isCartOpen,
        isSearchOpen,
        isPromotionsOpen,
        isAddressMapOpen,
        isAdminOpen,
        activeLegalPage,
        cartTab,
        lastCreatedOrder,
        saucePromptItem,
        sizePromptItem,
        savedAddress,
        toast,
        totalItemsCount,
        cartSubtotal,
        setActiveCategory,
        setSearchQuery,
        openCart,
        closeCart,
        openSearch,
        closeSearch,
        openPromotions,
        closePromotions,
        openAddressMap,
        closeAddressMap,
        openAdmin,
        closeAdmin,
        openLegalPage,
        closeLegalPage,
        confirmAddressSelection,
        setSavedDeliveryMethod,
        setCartTab,
        addToCart,
        addSizedItemToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getSizedItemTotalQuantity,
        submitOrder,
        repeatOrder,
        selectCategoryAndScroll,
        dismissSaucePrompt,
        openSizePrompt,
        dismissSizePrompt,
        signInAsAdmin,
        signOutAdmin,
        seedMenuToFirestore,
        saveMenuItem,
        quickUpdatePrice,
        toggleItemAvailability,
        deleteMenuItem,
        saveCategory,
        toggleCategoryAvailability,
        deleteCategory,
        saveHeroSlide,
        toggleSlideAvailability,
        deleteHeroSlide,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
