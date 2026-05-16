import type { YandexSuggestItem } from "@/lib/yandex/suggest-types";

export type { GeoCoordinates, YandexSuggestItem } from "@/lib/yandex/suggest-types";

/** Клиент: запрос через наш API (обход CORS) */
export async function fetchStreetSuggestions(
  text: string,
  options?: { city?: string; signal?: AbortSignal }
): Promise<YandexSuggestItem[]> {
  if (text.trim().length < 3) return [];

  const params = new URLSearchParams({ text: text.trim() });
  if (options?.city?.trim()) params.set("city", options.city.trim());

  const res = await fetch(`/api/yandex/suggest?${params}`, {
    signal: options?.signal,
  });

  const data = (await res.json().catch(() => ({}))) as {
    results?: YandexSuggestItem[];
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || `Ошибка подсказок (${res.status})`);
  }

  return data.results ?? [];
}
