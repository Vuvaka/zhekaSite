import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KANDALAKSHA_YMAPS_BOUNDS,
  loadYandexMapsApi,
  YANDEX_MAPS_API_KEY,
  YANDEX_SUGGEST_API_KEY,
} from '../lib/yandexMaps';

export { KANDALAKSHA_CENTER } from '../lib/yandexMaps';

export interface AddressSuggestion {
  id: string;
  label: string;
  subtitle?: string;
  coords: { lat: number; lng: number } | null;
  rawValue?: string;
}

export function cleanKandalakshaAddressLabel(rawLabel: string): string {
  return rawLabel
    .replace(/^Россия,\s*/i, '')
    .replace(/,?\s*Мурманская\s+область,?/gi, '')
    .replace(/,?\s*Мурманская\s+обл\.?,?/gi, '')
    .replace(/,?\s*Северо-Западный\s+федеральный\s+округ,?/gi, '')
    .replace(/,?\s*Россия.*$/i, '')
    .replace(/,\s*\d{6}$/, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^,\s*|,\s*$/g, '')
    .replace(/,\s*,+/g, ',')
    .trim();
}

interface UseKandalakshaAutocompleteOptions {
  query: string;
  enabled: boolean;
}

export function useKandalakshaAutocomplete({
  query,
  enabled,
}: UseKandalakshaAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const skipNextAutocompleteRef = useRef(false);

  const skipNextFetch = useCallback(() => {
    skipNextAutocompleteRef.current = true;
  }, []);

  const resetSession = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (skipNextAutocompleteRef.current) {
      skipNextAutocompleteRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const searchText = trimmed.toLowerCase().includes('кандалакш')
          ? trimmed
          : `Кандалакша, ${trimmed}`;

        // 1. Try Yandex Maps JS API 2.1 (suggest + geocode) if API key is configured
        if (YANDEX_MAPS_API_KEY) {
          const ymaps = await loadYandexMapsApi();
          if (controller.signal.aborted) return;

          if (ymaps) {
            if (YANDEX_SUGGEST_API_KEY && typeof ymaps.suggest === 'function') {
              try {
                const items = await ymaps.suggest(searchText, {
                  boundedBy: KANDALAKSHA_YMAPS_BOUNDS,
                  results: 6,
                });
                if (controller.signal.aborted) return;

                const filtered = (items || [])
                  .filter((it) => {
                    const text = `${it.displayName} ${it.value}`.toLowerCase();
                    return text.includes('кандалакш');
                  })
                  .slice(0, 6)
                  .map((it, idx) => ({
                    id: `ymaps-suggest-${idx}-${it.value}`,
                    label: cleanKandalakshaAddressLabel(it.displayName || it.value),
                    subtitle: 'г. Кандалакша',
                    coords: null,
                    rawValue: it.value || it.displayName,
                  }));

                if (filtered.length > 0) {
                  setSuggestions(filtered);
                  setShowSuggestions(true);
                  return;
                }
              } catch {
                // Fall through to Yandex geocode / proxy
              }
            }

            try {
              const geoRes = await ymaps.geocode(searchText, {
                boundedBy: KANDALAKSHA_YMAPS_BOUNDS,
                strictBounds: true,
                results: 6,
              });
              if (controller.signal.aborted) return;

              const count = geoRes.geoObjects.getLength();
              const geoList: AddressSuggestion[] = [];
              const seen = new Set<string>();

              for (let i = 0; i < count; i++) {
                const obj = geoRes.geoObjects.get(i);
                if (!obj) continue;
                const coordsArr = obj.geometry.getCoordinates();
                const rawLine = obj.getAddressLine();
                const clean = cleanKandalakshaAddressLabel(rawLine);
                if (!clean || seen.has(clean.toLowerCase())) continue;
                seen.add(clean.toLowerCase());
                geoList.push({
                  id: `ymaps-geo-${i}-${clean}`,
                  label: clean,
                  subtitle: 'Яндекс Карты · г. Кандалакша',
                  coords: { lat: coordsArr[0], lng: coordsArr[1] },
                  rawValue: rawLine,
                });
              }

              if (geoList.length > 0) {
                setSuggestions(geoList);
                setShowSuggestions(true);
                return;
              }
            } catch {
              // Fall through to bounded server geocoder
            }
          }
        }

        // 2. Bounded server-side Kandalaksha street/address lookup (works out of the box)
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = (await res.json()) as {
          results?: Array<{
            id: string;
            label: string;
            subtitle?: string;
            lat: number;
            lng: number;
          }>;
        };
        const mapped: AddressSuggestion[] = (data.results || []).map((entry) => ({
          id: entry.id,
          label: cleanKandalakshaAddressLabel(entry.label),
          subtitle: entry.subtitle || 'г. Кандалакша',
          coords:
            Number.isFinite(entry.lat) && Number.isFinite(entry.lng)
              ? { lat: entry.lat, lng: entry.lng }
              : null,
          rawValue: entry.label,
        }));

        setSuggestions(mapped);
        setShowSuggestions(mapped.length > 0);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, enabled]);

  const resolveSuggestion = useCallback(
    async (
      suggestion: AddressSuggestion
    ): Promise<{ address: string; coords: { lat: number; lng: number } | null } | null> => {
      let resolvedCoords = suggestion.coords;
      let resolvedAddress = cleanKandalakshaAddressLabel(suggestion.label);

      if (!resolvedCoords && YANDEX_MAPS_API_KEY) {
        const ymaps = await loadYandexMapsApi();
        if (ymaps) {
          try {
            const targetQuery = suggestion.rawValue || suggestion.label;
            const res = await ymaps.geocode(
              targetQuery.toLowerCase().includes('кандалакш')
                ? targetQuery
                : `Кандалакша, ${targetQuery}`,
              {
                boundedBy: KANDALAKSHA_YMAPS_BOUNDS,
                strictBounds: true,
                results: 1,
              }
            );
            const first = res.geoObjects.get(0);
            if (first) {
              const [lat, lng] = first.geometry.getCoordinates();
              resolvedCoords = { lat, lng };
              resolvedAddress = cleanKandalakshaAddressLabel(first.getAddressLine()) || resolvedAddress;
            }
          } catch {
            // Keep label even if coordinate resolution fails
          }
        }
      }

      skipNextAutocompleteRef.current = true;
      resetSession();

      return { address: resolvedAddress, coords: resolvedCoords };
    },
    [resetSession]
  );

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    skipNextFetch,
    resetSession,
    resolveSuggestion,
  };
}
