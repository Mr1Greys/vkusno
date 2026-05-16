export type GeoCoordinates = [longitude: number, latitude: number];

export type YandexSuggestItem = {
  id: string;
  label: string;
  street: string;
  house: string;
  city: string;
  uri?: string;
};
