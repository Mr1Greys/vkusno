import { GEOCODER_URL, getGeocoderApiKey } from "@/lib/yandex/config";
import type { GeoCoordinates } from "@/lib/yandex/suggest-types";

type GeocodeResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: Array<{
        GeoObject?: { Point?: { pos?: string } };
      }>;
    };
  };
};

export type GeocodeResult = {
  coordinates: GeoCoordinates | null;
  notice?: string;
};

function parseYandexPoint(data: GeocodeResponse): GeoCoordinates | null {
  const pos =
    data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;
  if (!pos) return null;
  const [lon, lat] = pos.split(/\s+/).map(Number);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

async function yandexGeocode(
  search: { geocode?: string; uri?: string }
): Promise<GeoCoordinates | null> {
  const apikey = getGeocoderApiKey();
  if (!apikey) return null;
  if (!search.geocode?.trim() && !search.uri?.trim()) return null;

  const params = new URLSearchParams({
    apikey,
    format: "json",
    lang: "ru_RU",
    results: "1",
  });

  if (search.geocode?.trim()) {
    params.set("geocode", search.geocode.trim());
  } else if (search.uri?.trim()) {
    params.set("uri", search.uri.trim());
  }

  const referer =
    process.env.YANDEX_GEOCODER_REFERER?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "";

  const res = await fetch(`${GEOCODER_URL}?${params}`, {
    next: { revalidate: 0 },
    headers: referer ? { Referer: referer } : undefined,
  });
  if (!res.ok) return null;

  const data = (await res.json()) as GeocodeResponse;
  return parseYandexPoint(data);
}

/** Резерв: OpenStreetMap Nominatim (WGS84), если ключ Яндекс-геокодера не принят */
async function nominatimGeocode(address: string): Promise<GeoCoordinates | null> {
  const q = address.trim();
  if (!q) return null;

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    countrycodes: "ru",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": "vypechka-bakery/1.0 (delivery address; contact: support@vypechka.local)",
      "Accept-Language": "ru",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lon?: string; lat?: string }>;
  const hit = data[0];
  if (!hit?.lon || !hit?.lat) return null;

  const lon = Number(hit.lon);
  const lat = Number(hit.lat);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

export async function resolveDeliveryCoordinates(input: {
  address: string;
  uri?: string;
}): Promise<GeocodeResult> {
  const address = input.address.trim();
  if (!address && !input.uri?.trim()) {
    return { coordinates: null };
  }

  if (getGeocoderApiKey()) {
    const byText = address ? await yandexGeocode({ geocode: address }) : null;
    if (byText) return { coordinates: byText };

    if (input.uri?.trim()) {
      const byUri = await yandexGeocode({ uri: input.uri });
      if (byUri) return { coordinates: byUri };
    }
  }

  if (address) {
    const osm = await nominatimGeocode(address);
    if (osm) return { coordinates: osm };
  }

  if (!getGeocoderApiKey()) {
    return {
      coordinates: null,
      notice:
        "Адрес сохранён. Добавьте YANDEX_GEOCODER_KEY (HTTP Геокодер) для точных координат.",
    };
  }

  return {
    coordinates: null,
    notice:
      "Адрес сохранён. Ключ HTTP Геокодера не принят Яндексом — создайте ключ продукта «HTTP Геокодер» в кабинете (активация до 15 мин).",
  };
}

/** @deprecated используйте resolveDeliveryCoordinates */
export async function yandexGeocodeByUri(
  uri: string,
  address?: string
): Promise<GeocodeResult> {
  return resolveDeliveryCoordinates({ uri, address: address ?? "" });
}
