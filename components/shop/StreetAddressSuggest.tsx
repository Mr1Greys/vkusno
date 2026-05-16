"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { geocodeAddress } from "@/lib/yandex/geocode";
import {
  fetchStreetSuggestions,
  type YandexSuggestItem,
} from "@/lib/yandex/suggest";
import { MapPin, Loader2 } from "lucide-react";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 3;

type StreetAddressSuggestProps = {
  city: string;
  street: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onHouseChange: (value: string) => void;
  onCoordinatesChange: (coords: [number, number] | null) => void;
  hasCoordinates: boolean;
};

export function StreetAddressSuggest({
  city,
  street,
  onStreetChange,
  onCityChange,
  onHouseChange,
  onCoordinatesChange,
  hasCoordinates,
}: StreetAddressSuggestProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<YandexSuggestItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const clearSuggestions = useCallback(() => {
    setItems([]);
    setActiveIndex(-1);
    setOpen(false);
  }, []);

  const runSearch = useCallback(
    async (query: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (query.trim().length < MIN_QUERY_LEN) {
        clearSuggestions();
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await fetchStreetSuggestions(query, {
          city,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setItems(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Не удалось загрузить подсказки");
        clearSuggestions();
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [city, clearSuggestions]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleInputChange = (value: string) => {
    onStreetChange(value);
    onCoordinatesChange(null);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(value);
    }, DEBOUNCE_MS);
  };

  const applySuggestion = async (item: YandexSuggestItem) => {
    onCityChange(item.city);
    onStreetChange(item.street);
    if (item.house) onHouseChange(item.house);
    clearSuggestions();
    setLoading(true);
    setError(null);

    try {
      const { coordinates, notice } = await geocodeAddress({
        address: item.label,
        uri: item.uri,
      });
      onCoordinatesChange(coordinates);
      setError(notice ?? null);
    } catch {
      onCoordinatesChange(null);
      setError("Не удалось уточнить координаты. Поля адреса заполнены.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      void applySuggestion(items[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative space-y-2">
      <Label htmlFor="street" className="text-text">
        Улица
      </Label>
      <div className="relative">
        <Input
          id="street"
          value={street}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-11 rounded-xl border-border/80 bg-white pr-10"
          placeholder="Начните вводить улицу и дом"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {(loading || hasCoordinates) && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <MapPin className="h-4 w-4 text-emerald-600" aria-hidden />
            )}
          </span>
        )}

        {open && items.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-auto rounded-xl border border-border/80 bg-white py-1 shadow-lg"
          >
            {items.map((item, index) => (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-[14px] leading-snug transition-colors",
                    index === activeIndex
                      ? "bg-brand/10 text-text"
                      : "text-text hover:bg-surface-2"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void applySuggestion(item)}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasCoordinates && (
        <p className="text-[12px] text-emerald-700">
          Координаты сохранены — можно рассчитать доставку
        </p>
      )}

      {error && (
        <p className="text-[12px] text-amber-800/90" role="status">
          {error}
        </p>
      )}
    </div>
  );
}

