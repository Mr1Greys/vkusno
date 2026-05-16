import type { GeoCoordinates } from "@/lib/yandex/suggest-types";

export type { GeoCoordinates };

export type GeocodeClientResult = {
  coordinates: GeoCoordinates | null;
  notice?: string;
};

export async function geocodeAddress(input: {
  address: string;
  uri?: string;
}): Promise<GeocodeClientResult> {
  const address = input.address.trim();
  if (!address && !input.uri?.trim()) {
    return { coordinates: null };
  }

  try {
    const params = new URLSearchParams({ address });
    if (input.uri?.trim()) params.set("uri", input.uri.trim());

    const res = await fetch(`/api/yandex/geocode?${params}`);
    const data = (await res.json().catch(() => ({}))) as GeocodeClientResult;

    if (!res.ok) {
      return {
        coordinates: null,
        notice: data.notice ?? "Адрес сохранён. Координаты временно недоступны.",
      };
    }

    return {
      coordinates: data.coordinates ?? null,
      notice: data.notice,
    };
  } catch {
    return {
      coordinates: null,
      notice: "Адрес сохранён. Не удалось получить координаты.",
    };
  }
}

/** @deprecated */
export async function geocodeByUri(
  uri: string,
  address?: string
): Promise<GeocodeClientResult> {
  return geocodeAddress({ uri, address: address ?? "" });
}
