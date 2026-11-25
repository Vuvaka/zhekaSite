export const KANDALAKSHA_CENTER = { lat: 67.1572, lng: 32.4119 };
export const PICKUP_COORDS = { lat: 67.1541, lng: 32.4106 };

// Bounding box covering Kandalaksha and immediate surroundings: [[south, west], [north, east]]
export const KANDALAKSHA_YMAPS_BOUNDS: [[number, number], [number, number]] = [
  [67.08, 32.25],
  [67.23, 32.58],
];

export const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
export const YANDEX_SUGGEST_API_KEY = import.meta.env.VITE_YANDEX_SUGGEST_API_KEY || '';

export interface YMapsGeoObject {
  geometry: {
    getCoordinates: () => [number, number];
  };
  getAddressLine: () => string;
  getThoroughfare?: () => string | null;
  getPremiseNumber?: () => string | null;
  getLocalities?: () => string[];
}

export interface YMapsGeoCollection {
  getLength: () => number;
  get: (index: number) => YMapsGeoObject | undefined;
}

export interface YMapsPlacemark {
  geometry: {
    setCoordinates: (coords: [number, number]) => void;
    getCoordinates: () => [number, number];
  };
  options: {
    set: (key: string, value: unknown) => void;
  };
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
}

export interface YMapsMapInstance {
  setCenter: (
    coords: [number, number],
    zoom?: number,
    options?: { duration?: number }
  ) => void;
  setZoom: (zoom: number) => void;
  destroy: () => void;
  geoObjects: {
    add: (obj: YMapsPlacemark) => void;
  };
  events: {
    add: (eventName: string, handler: (event: { get: (key: string) => [number, number] }) => void) => void;
  };
}

export interface YMapsSuggestItem {
  displayName: string;
  value: string;
}

export interface YMapsApi {
  ready: (callback: () => void) => void;
  Map: new (
    container: HTMLElement | string,
    state: {
      center: [number, number];
      zoom: number;
      controls?: string[];
    },
    options?: Record<string, unknown>
  ) => YMapsMapInstance;
  Placemark: new (
    coords: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => YMapsPlacemark;
  geocode: (
    request: string | [number, number],
    options?: {
      boundedBy?: [[number, number], [number, number]];
      strictBounds?: boolean;
      kind?: string;
      results?: number;
    }
  ) => Promise<{ geoObjects: YMapsGeoCollection }>;
  suggest?: (
    request: string,
    options?: {
      boundedBy?: [[number, number], [number, number]];
      results?: number;
    }
  ) => Promise<YMapsSuggestItem[]>;
}

declare global {
  interface Window {
    ymaps?: YMapsApi;
  }
}

let ymapsLoaderPromise: Promise<YMapsApi | null> | null = null;

export function loadYandexMapsApi(): Promise<YMapsApi | null> {
  if (!YANDEX_MAPS_API_KEY) {
    return Promise.resolve(null);
  }
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps!.ready(() => resolve(window.ymaps ?? null));
    });
  }
  if (ymapsLoaderPromise) {
    return ymapsLoaderPromise;
  }

  ymapsLoaderPromise = new Promise((resolve) => {
    const scriptId = 'yandex-maps-js-api';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleReady = () => {
      if (!window.ymaps) {
        resolve(null);
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps ?? null));
    };

    if (existing) {
      existing.addEventListener('load', handleReady, { once: true });
      existing.addEventListener('error', () => resolve(null), { once: true });
      return;
    }

    const params = new URLSearchParams({
      apikey: YANDEX_MAPS_API_KEY,
      lang: 'ru_RU',
    });
    if (YANDEX_SUGGEST_API_KEY) {
      params.set('suggest_apikey', YANDEX_SUGGEST_API_KEY);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      resolve(null);
    }, 8000);

    script.addEventListener('load', () => {
      window.clearTimeout(timeoutId);
      handleReady();
    });

    script.addEventListener('error', () => {
      window.clearTimeout(timeoutId);
      resolve(null);
    });

    document.head.appendChild(script);
  });

  return ymapsLoaderPromise;
}

export function buildYandexMapWidgetUrl(
  coords: { lat: number; lng: number },
  zoom = 16
): string {
  const lat = coords.lat.toFixed(6);
  const lng = coords.lng.toFixed(6);
  return `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=${zoom}&pt=${lng}%2C${lat},pm2ylm`;
}
