import { GEOSUGGEST_URL, getGeosuggestApiKey } from "@/lib/yandex/config";
import { MOSCOW_BBOX, MOSCOW_DEFAULT_CITY } from "@/lib/yandex/moscow";
import type { YandexSuggestItem } from "@/lib/yandex/suggest-types";

type AddressComponent = {
  name: string;
  kind?: string[];
};

type SuggestResult = {
  title?: { text?: string };
  subtitle?: { text?: string };
  uri?: string;
  address?: {
    formatted_address?: string;
    component?: AddressComponent[];
  };
};

type SuggestResponse = {
  results?: SuggestResult[];
};

function componentName(
  components: AddressComponent[] | undefined,
  ...kinds: string[]
): string {
  if (!components?.length) return "";
  const normalized = kinds.map((k) => k.toLowerCase());
  for (const kind of normalized) {
    const hit = components.find((c) =>
      c.kind?.some((k) => k.toLowerCase() === kind)
    );
    if (hit?.name?.trim()) return hit.name.trim();
  }
  return "";
}

function parseItem(result: SuggestResult, index: number): YandexSuggestItem {
  const components = result.address?.component;
  const city =
    componentName(components, "locality", "area") ||
    result.subtitle?.text?.trim() ||
    MOSCOW_DEFAULT_CITY;
  const street = componentName(components, "street");
  const house = componentName(components, "house");
  const title = result.title?.text?.trim() || "";
  const label =
    result.address?.formatted_address?.trim() || title || street;

  return {
    id: result.uri || `${index}-${label}`,
    label,
    city,
    street: street || title,
    house,
    uri: result.uri,
  };
}

export function buildSuggestQuery(city: string | undefined, text: string): string {
  const trimmed = text.trim();
  const cityPart = (city?.trim() || MOSCOW_DEFAULT_CITY).replace(/,+$/, "");
  if (!trimmed) return cityPart;
  if (trimmed.toLowerCase().startsWith(cityPart.toLowerCase())) return trimmed;
  return `${cityPart}, ${trimmed}`;
}

/** Запрос к Яндексу с сервера (ключ не светится в браузере) */
export async function yandexSuggestRequest(
  text: string,
  options?: { city?: string; results?: number }
): Promise<YandexSuggestItem[]> {
  const apikey = getGeosuggestApiKey();
  if (!apikey) {
    throw new Error(
      "Нет ключа API Геосаджеста. В .env добавьте YANDEX_GEOSUGGEST_KEY (ключ «API Геосаджеста» в кабинете). YANDEX_GEOCODER_KEY — это другой ключ, только для координат."
    );
  }

  const query = buildSuggestQuery(options?.city, text);
  if (query.trim().length < 3) return [];

  const params = new URLSearchParams({
    apikey,
    text: query,
    types: "street,house",
    attrs: "uri",
    lang: "ru_RU",
    results: String(options?.results ?? 5),
    print_address: "1",
    bbox: MOSCOW_BBOX,
    strict_bounds: "0",
  });

  const referer =
    process.env.YANDEX_GEOSUGGEST_REFERER?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "";

  const res = await fetch(`${GEOSUGGEST_URL}?${params}`, {
    next: { revalidate: 0 },
    headers: referer ? { Referer: referer } : undefined,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const hint =
      res.status === 403
        ? " Проверьте, что ключ выдан для API Геосаджеста."
        : "";
    throw new Error(
      (body ? `Геосаджест ${res.status}: ${body.slice(0, 160)}` : `Геосаджест ${res.status}`) +
        hint
    );
  }

  const data = (await res.json()) as SuggestResponse;
  return (data.results ?? []).map(parseItem);
}
