import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bike, Loader2, MapPin, Navigation, Utensils, X } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { DeliveryMethod } from '../types/menu';
import {
  buildYandexMapWidgetUrl,
  KANDALAKSHA_CENTER,
  loadYandexMapsApi,
  PICKUP_COORDS,
  YANDEX_MAPS_API_KEY,
  YMapsMapInstance,
  YMapsPlacemark,
} from '../lib/yandexMaps';
import {
  AddressSuggestion,
  cleanKandalakshaAddressLabel,
  useKandalakshaAutocomplete,
} from '../hooks/useKandalakshaAutocomplete';

function AddressMapContent() {
  const { savedAddress, closeAddressMap, confirmAddressSelection } = useStore();

  const [mode, setMode] = useState<DeliveryMethod>(savedAddress.deliveryMethod);
  const [streetInput, setStreetInput] = useState(savedAddress.streetAddress);
  const [apartmentInput, setApartmentInput] = useState(savedAddress.apartmentDetails);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>(
    savedAddress.deliveryMethod === 'pickup'
      ? PICKUP_COORDS
      : { lat: savedAddress.lat, lng: savedAddress.lng }
  );
  const [cameraZoom, setCameraZoom] = useState(
    savedAddress.deliveryMethod === 'pickup' ? 16 : 15
  );

  const [ymapsStatus, setYmapsStatus] = useState<'loading' | 'ready' | 'widget'>(
    YANDEX_MAPS_API_KEY ? 'loading' : 'widget'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoHint, setGeoHint] = useState('');
  const [formError, setFormError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YMapsMapInstance | null>(null);
  const placemarkRef = useRef<YMapsPlacemark | null>(null);
  const modeRef = useRef<DeliveryMethod>(mode);
  const skipNextMapSyncRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    skipNextFetch,
    resolveSuggestion,
  } = useKandalakshaAutocomplete({
    query: streetInput,
    enabled: mode === 'delivery',
  });

  const reverseGeocodeCoords = useCallback(
    async (coords: { lat: number; lng: number }) => {
      setIsGeocoding(true);
      setGeoHint('');
      try {
        // 1. Try Yandex Maps Geocoder when JS API is active
        if (YANDEX_MAPS_API_KEY) {
          const ymaps = await loadYandexMapsApi();
          if (ymaps) {
            try {
              const res = await ymaps.geocode([coords.lat, coords.lng], {
                kind: 'house',
                results: 1,
              });
              const first = res.geoObjects.get(0);
              if (first) {
                const formatted = cleanKandalakshaAddressLabel(first.getAddressLine());
                if (formatted) {
                  skipNextFetch();
                  setStreetInput(formatted);
                  setFormError('');
                  return;
                }
              }
              const fallbackRes = await ymaps.geocode([coords.lat, coords.lng], {
                results: 1,
              });
              const fallbackObj = fallbackRes.geoObjects.get(0);
              if (fallbackObj) {
                const formatted = cleanKandalakshaAddressLabel(fallbackObj.getAddressLine());
                if (formatted) {
                  skipNextFetch();
                  setStreetInput(formatted);
                  setFormError('');
                  return;
                }
              }
            } catch {
              // Fall back to /api/geocode/reverse
            }
          }
        }

        // 2. Server-side reverse geocode fallback
        const response = await fetch(
          `/api/geocode/reverse?lat=${encodeURIComponent(coords.lat)}&lng=${encodeURIComponent(coords.lng)}`
        );
        if (response.ok) {
          const data = (await response.json()) as { address?: string };
          if (data.address) {
            skipNextFetch();
            setStreetInput(cleanKandalakshaAddressLabel(data.address));
            setFormError('');
          }
        }
      } finally {
        setIsGeocoding(false);
      }
    },
    [skipNextFetch]
  );

  // Initialize interactive Yandex Map (JS API 2.1) when key is configured
  useEffect(() => {
    if (!YANDEX_MAPS_API_KEY) {
      setYmapsStatus('widget');
      return;
    }

    let cancelled = false;

    void loadYandexMapsApi().then((ymaps) => {
      if (cancelled) return;
      if (!ymaps || !mapContainerRef.current) {
        setYmapsStatus('widget');
        return;
      }

      const startCoords: [number, number] = [pinCoords.lat, pinCoords.lng];
      const map = new ymaps.Map(
        mapContainerRef.current,
        {
          center: startCoords,
          zoom: cameraZoom,
          controls: ['zoomControl'],
        },
        {
          suppressMapOpenBlock: true,
        }
      );

      const placemark = new ymaps.Placemark(
        startCoords,
        {
          hintContent:
            modeRef.current === 'pickup' ? RESTAURANT_INFO.fullAddress : 'Точка доставки',
        },
        {
          preset: 'islands#yellowDotIcon',
          draggable: modeRef.current === 'delivery',
        }
      );

      map.geoObjects.add(placemark);

      map.events.add('click', (event) => {
        if (modeRef.current !== 'delivery') return;
        const coords = event.get('coords');
        if (!coords || coords.length < 2) return;
        const nextCoords = { lat: coords[0], lng: coords[1] };
        placemark.geometry.setCoordinates([nextCoords.lat, nextCoords.lng]);
        skipNextMapSyncRef.current = true;
        setPinCoords(nextCoords);
        void reverseGeocodeCoords(nextCoords);
      });

      placemark.events.add('dragend', () => {
        if (modeRef.current !== 'delivery') return;
        const coords = placemark.geometry.getCoordinates();
        if (!coords || coords.length < 2) return;
        const nextCoords = { lat: coords[0], lng: coords[1] };
        skipNextMapSyncRef.current = true;
        setPinCoords(nextCoords);
        map.setCenter([nextCoords.lat, nextCoords.lng]);
        void reverseGeocodeCoords(nextCoords);
      });

      mapInstanceRef.current = map;
      placemarkRef.current = placemark;
      setYmapsStatus('ready');
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        placemarkRef.current = null;
      }
    };
    // Run only once on modal open; dynamic updates happen in the sync effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Yandex JS API map pin & camera synchronized when mode/suggestion/geolocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const placemark = placemarkRef.current;
    if (!map || !placemark) return;

    placemark.options.set('draggable', mode === 'delivery');

    if (skipNextMapSyncRef.current) {
      skipNextMapSyncRef.current = false;
      return;
    }

    const nextTuple: [number, number] = [pinCoords.lat, pinCoords.lng];
    placemark.geometry.setCoordinates(nextTuple);
    map.setCenter(nextTuple, cameraZoom, { duration: 250 });
  }, [pinCoords, cameraZoom, mode]);

  const handleModeSwitch = (nextMode: DeliveryMethod) => {
    setMode(nextMode);
    setFormError('');
    setGeoHint('');
    if (nextMode === 'pickup') {
      setShowSuggestions(false);
      setPinCoords(PICKUP_COORDS);
      setCameraZoom(16);
    } else {
      const target =
        savedAddress.confirmed && savedAddress.streetAddress
          ? { lat: savedAddress.lat, lng: savedAddress.lng }
          : KANDALAKSHA_CENTER;
      setPinCoords(target);
      setCameraZoom(15);
    }
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    const resolved = await resolveSuggestion(suggestion);
    if (!resolved) return;

    if (resolved.coords) {
      setPinCoords(resolved.coords);
      setCameraZoom(16);
    }
    setStreetInput(resolved.address);
    setFormError('');
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoHint('Геолокация не поддерживается вашим браузером');
      return;
    }
    setIsLocating(true);
    setGeoHint('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const nextCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMode('delivery');
        setPinCoords(nextCoords);
        setCameraZoom(16);
        void reverseGeocodeCoords(nextCoords);
      },
      () => {
        setIsLocating(false);
        setGeoHint('Не удалось определить геолокацию — введите улицу или выберите точку на карте');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'pickup') {
      confirmAddressSelection({
        deliveryMethod: 'pickup',
        streetAddress: RESTAURANT_INFO.fullAddress,
        apartmentDetails: '',
        lat: PICKUP_COORDS.lat,
        lng: PICKUP_COORDS.lng,
        confirmed: true,
      });
      return;
    }

    if (!streetInput.trim()) {
      setFormError('Укажите улицу и дом или выберите точку на карте.');
      return;
    }

    confirmAddressSelection({
      deliveryMethod: 'delivery',
      streetAddress: streetInput.trim(),
      apartmentDetails: apartmentInput.trim(),
      lat: pinCoords.lat,
      lng: pinCoords.lng,
      confirmed: true,
    });
  };

  const widgetUrl = buildYandexMapWidgetUrl(pinCoords, cameraZoom);

  return (
    <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#141417] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
      {/* Upper Interactive Yandex Map Area */}
      <div className="relative h-[220px] sm:h-[300px] md:h-[340px] w-full bg-[#1B1B20] shrink-0">
        {/* Top Floating Switcher & Close Button */}
        <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div
            role="tablist"
            aria-label="Способ получения заказа"
            className="pointer-events-auto inline-flex items-center p-1 rounded-full bg-[#1C1C20]/95 backdrop-blur-md border border-white/15 shadow-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'delivery'}
              onClick={() => handleModeSwitch('delivery')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                mode === 'delivery'
                  ? 'bg-[#FFD400] text-[#111111]'
                  : 'text-zinc-200 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" aria-hidden="true" />
              <span>Доставка</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'pickup'}
              onClick={() => handleModeSwitch('pickup')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                mode === 'pickup'
                  ? 'bg-[#FFD400] text-[#111111]'
                  : 'text-zinc-200 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Самовывоз</span>
            </button>
          </div>

          <button
            type="button"
            onClick={closeAddressMap}
            aria-label="Закрыть карту выбора адреса"
            className="pointer-events-auto w-10 h-10 rounded-full bg-[#1C1C20]/95 backdrop-blur-md border border-white/15 text-white hover:text-[#FFD400] hover:border-[#FFD400] flex items-center justify-center shadow-xl transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Yandex JS API 2.1 Map Container (when VITE_YANDEX_MAPS_API_KEY is active) */}
        {YANDEX_MAPS_API_KEY && ymapsStatus !== 'widget' && (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Loading overlay for JS API */}
        {ymapsStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#18181D] z-10">
            <Loader2 className="w-6 h-6 text-[#FFD400] animate-spin" />
          </div>
        )}

        {/* Live Yandex Map Embed Widget (works with zero API key) */}
        {ymapsStatus === 'widget' && (
          <iframe
            key={widgetUrl}
            src={widgetUrl}
            title="Яндекс Карта г. Кандалакша"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}

        {/* Geolocation Floating Button */}
        {mode === 'delivery' && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            aria-label="Определить моё местоположение"
            className="absolute right-3.5 bottom-7 z-20 w-11 h-11 rounded-full bg-[#1C1C20]/95 backdrop-blur-md border border-white/15 text-white hover:text-[#FFD400] hover:border-[#FFD400] flex items-center justify-center shadow-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#FFD400]" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Bottom Sheet Form */}
      <form
        onSubmit={handleConfirm}
        className="relative z-10 -mt-4 rounded-t-2xl bg-[#141417] border-t border-white/10 p-5 space-y-4 overflow-y-auto"
      >
        {/* Header Row: Новый адрес + Кандалакша */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-white leading-tight">
            {mode === 'delivery' ? 'Новый адрес' : 'Самовывоз · −10%'}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white shrink-0">
            <MapPin className="w-4 h-4 text-[#FFD400]" aria-hidden="true" />
            <span>Кандалакша</span>
          </span>
        </div>

        {geoHint && (
          <p className="text-xs text-[#FFD400] bg-[#FFD400]/10 border border-[#FFD400]/25 rounded-lg px-3 py-2">
            {geoHint}
          </p>
        )}

        {mode === 'delivery' ? (
          <div className="space-y-3">
            {/* Input 1: Улица, дом + Autocomplete */}
            <div className="relative">
              <input
                type="text"
                value={streetInput}
                onChange={(e) => {
                  setStreetInput(e.target.value);
                  setFormError('');
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 180);
                }}
                placeholder="Улица, дом (г. Кандалакша)"
                aria-label="Улица, дом (г. Кандалакша)"
                autoComplete="off"
                className="w-full px-4 py-3.5 rounded-xl bg-[#1E1E22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] transition-colors pr-10"
              />
              {(isSearching || isGeocoding) && (
                <Loader2 className="w-4 h-4 text-[#FFD400] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}

              {showSuggestions && suggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Подсказки адресов г. Кандалакша"
                  className="absolute left-0 right-0 bottom-full mb-1.5 z-30 max-h-48 overflow-y-auto rounded-xl bg-[#1D1D23] border border-white/15 shadow-2xl divide-y divide-white/[0.06]"
                >
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 hover:bg-white/[0.06] hover:text-[#FFD400] transition-colors flex items-start gap-2 cursor-pointer"
                      >
                        <MapPin
                          className="w-3.5 h-3.5 text-[#FFD400] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{suggestion.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Input 2: Подъезд, этаж, квартира */}
            <input
              type="text"
              value={apartmentInput}
              onChange={(e) => setApartmentInput(e.target.value)}
              placeholder="Подъезд, этаж, квартира"
              aria-label="Подъезд, этаж, квартира"
              className="w-full px-4 py-3.5 rounded-xl bg-[#1E1E22] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] transition-colors"
            />

            {formError && (
              <p role="alert" className="text-xs text-red-400">
                {formError}
              </p>
            )}

            <p className="text-[11px] text-zinc-400">
              {ymapsStatus === 'ready'
                ? 'Нажмите на Яндекс Карту или перетащите маркер для выбора адреса.'
                : 'Начните вводить улицу — подсказки и метка на Яндекс Карте обновятся автоматически.'}{' '}
              Бесплатная доставка от {RESTAURANT_INFO.freeDeliveryThreshold} ₽.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#FFD400]/30 space-y-1.5">
            <p className="text-sm font-semibold text-white">{RESTAURANT_INFO.fullAddress}</p>
            <p className="text-xs text-zinc-400">
              Режим работы: {RESTAURANT_INFO.hours} · Готовность 15–20 минут
            </p>
            <p className="text-xs font-medium text-[#FFD400]">
              Скидка 10% применится автоматически при оформлении заказа
            </p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            mode === 'pickup' || streetInput.trim().length > 0
              ? 'bg-[#FFD400] text-[#111111] hover:bg-[#ffe033] active:scale-[0.99]'
              : 'bg-[#FFD400]/65 text-[#111111] hover:bg-[#FFD400]'
          }`}
        >
          {mode === 'delivery' ? 'Добавить' : 'Выбрать самовывоз (−10%)'}
        </button>
      </form>
    </div>
  );
}

export function AddressMapModal() {
  const { isAddressMapOpen, closeAddressMap } = useStore();

  useEffect(() => {
    if (!isAddressMapOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddressMap();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAddressMapOpen, closeAddressMap]);

  return (
    <AnimatePresence>
      {isAddressMapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Выбор адреса доставки или самовывоза на Яндекс Картах"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeAddressMap}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full sm:max-w-lg"
          >
            <AddressMapContent />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
