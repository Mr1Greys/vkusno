/**
 * API Геосаджеста (подсказки).
 * geosuggest.maps.yandex.net с многих сетей не резолвится — используем v1.
 */
export const GEOSUGGEST_URL = "https://suggest-maps.yandex.ru/v1/suggest";

/** HTTP Геокодер v1 — https://yandex.com/dev/geocode/doc/en/request */
export const GEOCODER_URL = "https://geocode-maps.yandex.ru/v1/";

export function getGeosuggestApiKey(): string | undefined {
  return (
    process.env.YANDEX_GEOSUGGEST_KEY?.trim() ||
    process.env.NEXT_PUBLIC_YANDEX_GEOSUGGEST_KEY?.trim() ||
    process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY?.trim() ||
    undefined
  );
}

export function getGeocoderApiKey(): string | undefined {
  return (
    process.env.YANDEX_GEOCODER_KEY?.trim() ||
    process.env.NEXT_PUBLIC_YANDEX_GEOCODER_KEY?.trim() ||
    undefined
  );
}
