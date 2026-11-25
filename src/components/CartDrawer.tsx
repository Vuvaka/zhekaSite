import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { DeliveryMethod, PaymentMethod } from '../types/menu';
import {
  AddressSuggestion,
  useKandalakshaAutocomplete,
} from '../hooks/useKandalakshaAutocomplete';
import { FoodImage } from './FoodImage';

function CheckoutAddressAutocompleteInput({
  value,
  onChange,
  onSelectAddress,
}: {
  value: string;
  onChange: (next: string) => void;
  onSelectAddress: (next: string) => void;
}) {
  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    resolveSuggestion,
  } = useKandalakshaAutocomplete({
    query: value,
    enabled: true,
  });

  const handlePick = async (suggestion: AddressSuggestion) => {
    const resolved = await resolveSuggestion(suggestion);
    if (resolved) {
      onSelectAddress(resolved.address);
    }
  };

  return (
    <div className="relative">
      <input
        id="order-address"
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setShowSuggestions(false), 180);
        }}
        placeholder="Улица, дом (г. Кандалакша)"
        autoComplete="off"
        className="w-full px-3.5 py-2.5 pr-9 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400]"
      />
      {isSearching && (
        <Loader2 className="w-4 h-4 text-[#FFD400] animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Подсказки улиц г. Кандалакша"
          className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl bg-[#1D1D23] border border-white/15 shadow-2xl divide-y divide-white/[0.06]"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void handlePick(suggestion)}
                className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 hover:bg-white/[0.06] hover:text-[#FFD400] transition-colors flex items-start gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFD400] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{suggestion.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CartDrawer() {
  const {
    cart,
    orders,
    isCartOpen,
    cartTab,
    lastCreatedOrder,
    savedAddress,
    totalItemsCount,
    cartSubtotal,
    closeCart,
    setCartTab,
    openAddressMap,
    openLegalPage,
    setSavedDeliveryMethod,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    repeatOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [comment, setComment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync address & delivery method when user confirms on the map modal
  useEffect(() => {
    setDeliveryMethod(savedAddress.deliveryMethod);
    if (savedAddress.deliveryMethod === 'delivery' && savedAddress.streetAddress) {
      setAddress(savedAddress.streetAddress);
      setApartment(savedAddress.apartmentDetails);
      setFormError('');
    }
  }, [savedAddress]);

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const isPickup = deliveryMethod === 'pickup';
  const pickupDiscount = isPickup
    ? Math.round(cartSubtotal * RESTAURANT_INFO.pickupDiscountRate)
    : 0;
  const deliveryFee =
    cart.length === 0 || isPickup || cartSubtotal >= RESTAURANT_INFO.freeDeliveryThreshold
      ? 0
      : RESTAURANT_INFO.deliveryFee;
  const finalTotal = Math.max(0, cartSubtotal - pickupDiscount + deliveryFee);
  const amountToFreeDelivery = Math.max(0, RESTAURANT_INFO.freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((cartSubtotal / RESTAURANT_INFO.freeDeliveryThreshold) * 100)
  );

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Пожалуйста, укажите ваше имя.');
      return;
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setFormError('Введите корректный номер телефона (минимум 10 цифр).');
      return;
    }
    if (!isPickup && !address.trim()) {
      setFormError('Укажите адрес доставки по г. Кандалакша.');
      return;
    }
    if (!consentAccepted) {
      setFormError('Необходимо дать согласие на обработку персональных данных.');
      return;
    }

    setFormError('');

    if (paymentMethod === 'card') {
      setCartTab('payment');
      return;
    }

    const fullDeliveryAddress = apartment.trim()
      ? `${address.trim()}, ${apartment.trim()}`
      : address.trim();

    setOrderSubmitting(true);
    try {
      await submitOrder({
        customerName,
        phone,
        address: fullDeliveryAddress,
        comment,
        deliveryMethod,
        paymentMethod,
        consentAccepted,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось оформить заказ. Попробуйте снова.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleConfirmCardPayment = () => {
    const fullDeliveryAddress = apartment.trim()
      ? `${address.trim()}, ${apartment.trim()}`
      : address.trim();

    setPaymentProcessing(true);
    window.setTimeout(async () => {
      try {
        await submitOrder({
          customerName,
          phone,
          address: fullDeliveryAddress,
          comment,
          deliveryMethod,
          paymentMethod: 'card',
          consentAccepted,
        });
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Ошибка при оформлении заказа.');
        setCartTab('checkout');
      } finally {
        setPaymentProcessing(false);
      }
    }, 650);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Корзина и оформление заказа">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#141417] border-l border-white/10 h-full flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="px-4 sm:px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {(cartTab === 'checkout' || cartTab === 'payment') && (
                  <button
                    type="button"
                    onClick={() => setCartTab(cartTab === 'payment' ? 'checkout' : 'cart')}
                    aria-label={cartTab === 'payment' ? 'Назад к оформлению' : 'Вернуться в корзину'}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-200 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="font-display text-lg sm:text-xl font-bold text-white truncate">
                  {cartTab === 'cart' && `Корзина${totalItemsCount > 0 ? ` (${totalItemsCount})` : ''}`}
                  {cartTab === 'checkout' && 'Оформление заказа'}
                  {cartTab === 'payment' && 'Оплата картой онлайн'}
                  {cartTab === 'success' && 'Заказ подтверждён'}
                  {cartTab === 'history' && 'Мои заказы'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {cartTab !== 'history' && (
                  <button
                    type="button"
                    onClick={() => setCartTab('history')}
                    aria-label="История заказов"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FFD400]/10 border border-[#FFD400]/35 hover:bg-[#FFD400]/20 hover:border-[#FFD400] text-xs font-semibold text-zinc-100 hover:text-[#FFD400] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <History className="w-3.5 h-3.5 text-[#FFD400]" aria-hidden="true" />
                    <span>История{orders.length > 0 ? ` (${orders.length})` : ''}</span>
                  </button>
                )}
                {cartTab === 'history' && (
                  <button
                    type="button"
                    onClick={() => setCartTab('cart')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Корзина</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCart}
                  aria-label="Закрыть панель"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* TAB 1: CART */}
              {cartTab === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-[#1C1C21] border border-white/[0.08] flex items-center justify-center text-[#FFD400] mb-4">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-white mb-2">
                        Ваша корзина пуста
                      </h3>
                      <p className="text-sm text-zinc-400 max-w-xs mb-6">
                        Добавьте горячие пельмени, бургеры или закуски из меню. Бесплатная доставка от{' '}
                        {RESTAURANT_INFO.freeDeliveryThreshold} ₽!
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={closeCart}
                          className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
                        >
                          Перейти в меню
                        </button>
                        {orders.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCartTab('history')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1C1C21] border border-[#FFD400]/30 text-sm font-medium text-zinc-100 hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
                            <span>История заказов ({orders.length})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Free Delivery Progress */}
                      <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/[0.08]">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-zinc-300">
                            {amountToFreeDelivery === 0
                              ? 'Вам доступна бесплатная доставка!'
                              : `До бесплатной доставки: ${amountToFreeDelivery} ₽`}
                          </span>
                          <span className="font-mono tabular-nums text-[#FFD400]">
                            {freeDeliveryProgress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#FFD400] transition-all duration-300"
                            style={{ width: `${freeDeliveryProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Clear Cart Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">
                          Позиций в заказе: {totalItemsCount}
                        </span>
                        <button
                          type="button"
                          onClick={clearCart}
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Очистить корзину</span>
                        </button>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-white/[0.08]">
                        {cart.map(({ item, quantity }) => (
                          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                            <FoodImage
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-16 rounded-lg shrink-0 border border-white/[0.06]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                                  {item.name}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  aria-label={`Удалить ${item.name}`}
                                  className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-zinc-500 mb-2.5">{item.weight}</p>

                              <div className="flex items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#1E1E24] border border-white/10">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, quantity - 1)}
                                    aria-label="Уменьшить"
                                    className="w-7 h-7 rounded flex items-center justify-center text-zinc-200 hover:bg-white/10 cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-6 text-center font-mono tabular-nums text-xs font-semibold text-white">
                                    {quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, quantity + 1)}
                                    aria-label="Увеличить"
                                    className="w-7 h-7 rounded flex items-center justify-center text-zinc-200 hover:bg-white/10 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="font-mono tabular-nums text-sm font-bold text-[#FFD400]">
                                  {item.price * quantity} ₽
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: CHECKOUT FORM */}
              {cartTab === 'checkout' && (
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5">
                  {/* Delivery Method */}
                  <div>
                    <span className="block text-xs font-medium text-zinc-400 mb-2">
                      Способ получения
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 rounded-xl bg-[#18181B] border border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMethod('delivery');
                          setSavedDeliveryMethod('delivery');
                        }}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          deliveryMethod === 'delivery'
                            ? 'bg-[#FFD400] text-[#111111] font-semibold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Доставка</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMethod('pickup');
                          setSavedDeliveryMethod('pickup');
                        }}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          deliveryMethod === 'pickup'
                            ? 'bg-[#FFD400] text-[#111111] font-semibold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Самовывоз −10%</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label htmlFor="order-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Имя *
                    </label>
                    <input
                      id="order-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Например, Алексей"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="order-phone" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Телефон *
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (921) 000-00-00"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400]"
                    />
                  </div>

                  {/* Delivery Address or Pickup Point */}
                  {deliveryMethod === 'delivery' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="order-address" className="text-xs font-medium text-zinc-300">
                          Адрес доставки (г. Кандалакша) *
                        </label>
                        <button
                          type="button"
                          onClick={() => openAddressMap(true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFD400] hover:text-white transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{address.trim() ? 'Изменить на карте' : 'Указать на карте'}</span>
                        </button>
                      </div>
                      <CheckoutAddressAutocompleteInput
                        value={address}
                        onChange={(next) => {
                          setAddress(next);
                          setFormError('');
                        }}
                        onSelectAddress={(next) => {
                          setAddress(next);
                          setFormError('');
                        }}
                      />
                      <input
                        id="order-apartment"
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Подъезд, этаж, квартира"
                        aria-label="Подъезд, этаж, квартира"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400]"
                      />
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#FFD400]/30 text-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-[#FFD400] font-medium">
                          Пункт самовывоза (скидка 10% применена)
                        </p>
                        <button
                          type="button"
                          onClick={() => openAddressMap(true)}
                          className="text-xs text-zinc-300 hover:text-[#FFD400] underline underline-offset-2 cursor-pointer"
                        >
                          На карте
                        </button>
                      </div>
                      <p className="text-white font-medium">{RESTAURANT_INFO.fullAddress}</p>
                      <p className="text-xs text-zinc-400">
                        Будет готово через 15–20 минут · {RESTAURANT_INFO.hours}
                      </p>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <span className="block text-xs font-medium text-zinc-400 mb-2">
                      Способ оплаты
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-[#FFD400]/15 border-[#FFD400] text-[#FFD400]'
                            : 'bg-[#18181B] border-white/10 text-zinc-300 hover:border-white/25'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" aria-hidden="true" />
                        <span>Картой</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                          paymentMethod === 'cash'
                            ? 'bg-[#FFD400]/15 border-[#FFD400] text-[#FFD400]'
                            : 'bg-[#18181B] border-white/10 text-zinc-300 hover:border-white/25'
                        }`}
                      >
                        <Wallet className="w-4 h-4" aria-hidden="true" />
                        <span>Наличными</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="order-comment" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Комментарий к заказу
                    </label>
                    <textarea
                      id="order-comment"
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Домофон, количество приборов, пожелания..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] resize-none"
                    />
                  </div>

                  {/* Personal Data Consent Checkbox (with exclusive hyperlink to Consent page) */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      id="order-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => {
                        setConsentAccepted(e.target.checked);
                        if (e.target.checked) setFormError('');
                      }}
                      className="mt-0.5 w-5 h-5 rounded border border-white/25 bg-[#18181B] accent-[#FFD400] cursor-pointer shrink-0"
                    />
                    <div className="text-sm text-zinc-300 leading-snug">
                      <label htmlFor="order-consent" className="cursor-pointer">
                        Даю согласие на{' '}
                      </label>
                      <button
                        type="button"
                        onClick={() => openLegalPage('consent')}
                        className="text-left text-[#FFD400] hover:underline underline-offset-4 font-medium cursor-pointer"
                      >
                        обработку персональных данных »»
                      </button>
                    </div>
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      {formError}
                    </p>
                  )}
                </form>
              )}

              {/* TAB 2.5: ON-SITE CARD PAYMENT STEP */}
              {cartTab === 'payment' && (
                <div className="space-y-5">
                  <div className="p-5 rounded-xl bg-[#18181B] border border-[#FFD400]/35 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-400">Сумма к оплате</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#FFD400]">
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Защищённая оплата</span>
                      </span>
                    </div>
                    <p className="font-mono tabular-nums text-3xl font-bold text-white">
                      {finalTotal} ₽
                    </p>
                    <p className="text-xs text-zinc-400">
                      {deliveryMethod === 'pickup'
                        ? `Самовывоз (${RESTAURANT_INFO.fullAddress}) · скидка 10% применена`
                        : `Доставка: ${address}`}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181B] border border-white/[0.08] space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <CreditCard className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
                      <span>Банковская карта (МИР / Visa / Mastercard)</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Демонстрационная форма онлайн-оплаты на сайте. После нажатия кнопки оплаты заказ мгновенно перейдёт в статус оплаченного (для реальных списаний при запуске подключается эквайринг ЮKassa / Т-Банк).
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-xs text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-[#FFD400] shrink-0" aria-hidden="true" />
                      <span>Данные карты не сохраняются в браузере</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUCCESS CONFIRMATION */}
              {cartTab === 'success' && lastCreatedOrder && (
                <div className="space-y-5 py-2">
                  <div className="p-5 rounded-xl bg-[#18181B] border border-[#FFD400]/40 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[#FFD400] mx-auto mb-3" />
                    <p className="text-xs text-zinc-400 mb-1">Заказ успешно оформлен</p>
                    <h3 className="font-display text-3xl font-bold text-white font-mono tabular-nums mb-2">
                      #{lastCreatedOrder.orderNumber}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 text-sm text-[#FFD400] font-medium">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>Ожидаемое время: {lastCreatedOrder.estimatedMinutes}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181B] border border-white/[0.08] space-y-2.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Получатель:</span>
                      <span className="text-white font-medium text-right">{lastCreatedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Телефон:</span>
                      <span className="text-white font-mono tabular-nums text-right">{lastCreatedOrder.phone}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Получение:</span>
                      <span className="text-white text-right">
                        {lastCreatedOrder.deliveryMethod === 'pickup' ? 'Самовывоз (−10%)' : 'Доставка'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Адрес:</span>
                      <span className="text-white text-right">{lastCreatedOrder.address}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-400">Оплата:</span>
                      <span className="text-white text-right">
                        {lastCreatedOrder.paymentMethod === 'card'
                          ? 'Оплачено картой онлайн'
                          : 'Наличными при получении'}
                      </span>
                    </div>
                    {lastCreatedOrder.comment && (
                      <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-400">
                        Комментарий: {lastCreatedOrder.comment}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181B] border border-white/[0.08] space-y-2">
                    <p className="text-xs font-medium text-zinc-400 mb-2">Состав заказа</p>
                    {lastCreatedOrder.items.map(({ item, quantity }) => (
                      <div key={item.id} className="flex justify-between text-sm gap-2">
                        <span className="text-zinc-200 truncate">
                          {item.name} × {quantity}
                        </span>
                        <span className="font-mono tabular-nums text-white shrink-0">
                          {item.price * quantity} ₽
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 mt-2 border-t border-white/[0.08] flex justify-between font-bold text-base">
                      <span className="text-white">Итого</span>
                      <span className="font-mono tabular-nums text-[#FFD400]">
                        {lastCreatedOrder.total} ₽
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDER HISTORY */}
              {cartTab === 'history' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                      <p className="text-base font-semibold text-white mb-1">История заказов пуста</p>
                      <p className="text-sm text-zinc-400">
                        Оформите первый заказ, и он сохранится здесь для быстрого повтора.
                      </p>
                    </div>
                  ) : (
                    orders.map((order, idx) => (
                      <div
                        key={order.id}
                        className={`p-4 rounded-xl space-y-3 border ${
                          idx === 0
                            ? 'bg-[#19191E] border-[#FFD400]/30'
                            : 'bg-[#18181B] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-sm font-bold text-[#FFD400]">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
                              {order.paymentStatus === 'paid_online' ? 'Оплачен картой' : 'При получении'}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {new Date(order.createdAt).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400">
                          {order.deliveryMethod === 'pickup' ? 'Самовывоз (−10%)' : `Доставка: ${order.address}`}
                        </div>

                        <div className="space-y-1 text-xs text-zinc-300">
                          {order.items.map(({ item, quantity }) => (
                            <div key={item.id} className="flex justify-between gap-2">
                              <span className="truncate">
                                {item.name} × {quantity}
                              </span>
                              <span className="font-mono tabular-nums shrink-0">
                                {item.price * quantity} ₽
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          <span className="font-mono tabular-nums text-sm font-bold text-white">
                            Итого: {order.total} ₽
                          </span>
                          <button
                            type="button"
                            onClick={() => repeatOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD400] text-[#111111] text-xs font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Повторить</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer Totals & Actions */}
            {cartTab === 'cart' && cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#18181B] space-y-2.5">
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Сумма заказа</span>
                  <span className="font-mono tabular-nums">{cartSubtotal} ₽</span>
                </div>
                {pickupDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#FFD400]">
                    <span>Скидка за самовывоз (10%)</span>
                    <span className="font-mono tabular-nums">−{pickupDiscount} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>{isPickup ? 'Получение' : 'Доставка'}</span>
                  <span className="font-mono tabular-nums">
                    {isPickup
                      ? 'Самовывоз (0 ₽)'
                      : deliveryFee === 0
                        ? 'Бесплатно'
                        : `${deliveryFee} ₽`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.08]">
                  <span className="text-base font-semibold text-white">Итого</span>
                  <span className="font-mono tabular-nums text-xl font-bold text-[#FFD400]">
                    {finalTotal} ₽
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!savedAddress.confirmed) {
                      openAddressMap(true);
                    } else {
                      setCartTab('checkout');
                    }
                  }}
                  className="w-full py-3 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-sm hover:bg-[#ffe033] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Перейти к оформлению
                </button>
              </div>
            )}

            {cartTab === 'checkout' && (
              <div className="p-5 border-t border-white/[0.08] bg-[#18181B] space-y-2.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Товары</span>
                  <span className="font-mono tabular-nums">{cartSubtotal} ₽</span>
                </div>
                {pickupDiscount > 0 && (
                  <div className="flex justify-between text-xs text-[#FFD400]">
                    <span>Скидка за самовывоз (10%)</span>
                    <span className="font-mono tabular-nums">−{pickupDiscount} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Доставка</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.08]">
                  <span className="text-base font-semibold text-white">К оплате</span>
                  <span className="font-mono tabular-nums text-xl font-bold text-[#FFD400]">
                    {finalTotal} ₽
                  </span>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={orderSubmitting}
                  className="w-full py-3 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-sm hover:bg-[#ffe033] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer mt-2"
                >
                  {orderSubmitting
                    ? 'Отправляем заказ...'
                    : paymentMethod === 'card'
                      ? `Перейти к оплате · ${finalTotal} ₽`
                      : `Подтвердить заказ · ${finalTotal} ₽`}
                </button>
              </div>
            )}

            {cartTab === 'payment' && (
              <div className="p-5 border-t border-white/[0.08] bg-[#18181B] space-y-3">
                <button
                  type="button"
                  disabled={paymentProcessing}
                  onClick={handleConfirmCardPayment}
                  className="w-full py-3 rounded-lg bg-[#FFD400] text-[#111111] font-semibold text-sm hover:bg-[#ffe033] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {paymentProcessing ? 'Проводим оплату...' : `Оплатить картой · ${finalTotal} ₽`}
                </button>
                <button
                  type="button"
                  disabled={paymentProcessing}
                  onClick={() => setCartTab('checkout')}
                  className="w-full py-2.5 rounded-lg border border-white/15 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                >
                  Изменить способ оплаты
                </button>
              </div>
            )}

            {cartTab === 'success' && (
              <div className="p-5 border-t border-white/[0.08] bg-[#18181B] flex gap-3">
                <button
                  type="button"
                  onClick={() => setCartTab('history')}
                  className="flex-1 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-white hover:border-[#FFD400] hover:text-[#FFD400] transition-colors cursor-pointer"
                >
                  Мои заказы
                </button>
                <button
                  type="button"
                  onClick={closeCart}
                  className="flex-1 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
                >
                  На главную
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
