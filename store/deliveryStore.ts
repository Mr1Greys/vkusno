import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GeoCoordinates } from "@/lib/yandex/suggest-types";

/** [longitude, latitude] — для Яндекс.Доставки */
export type DeliveryCoordinates = GeoCoordinates;

interface DeliveryState {
  type: "DELIVERY" | "PICKUP";
  address: string;
  city: string;
  street: string;
  house: string;
  /** [lon, lat] после выбора подсказки */
  coordinates: DeliveryCoordinates | null;
  privateHouse: boolean;
  entrance: string;
  doorCode: string;
  floor: string;
  apartment: string;
  addressComment: string;
  setType: (type: "DELIVERY" | "PICKUP") => void;
  setAddress: (address: string) => void;
  setCity: (city: string) => void;
  setStreet: (street: string) => void;
  setCoordinates: (coordinates: DeliveryCoordinates | null) => void;
  setHouse: (house: string) => void;
  setPrivateHouse: (value: boolean) => void;
  setEntrance: (entrance: string) => void;
  setDoorCode: (code: string) => void;
  setFloor: (floor: string) => void;
  setApartment: (apartment: string) => void;
  setAddressComment: (comment: string) => void;
}

export const formatDeliveryAddress = (fields: {
  city?: string;
  street?: string;
  house?: string;
  privateHouse?: boolean;
  entrance?: string;
  doorCode?: string;
  floor?: string;
  apartment?: string;
  addressComment?: string;
}) => {
  const parts: string[] = [];

  if (fields.city?.trim()) parts.push(`Город: ${fields.city.trim()}`);
  if (fields.street?.trim()) parts.push(`Улица: ${fields.street.trim()}`);
  if (fields.house?.trim()) parts.push(`Дом: ${fields.house.trim()}`);
  if (fields.privateHouse) parts.push("Частный дом");
  if (fields.entrance?.trim()) parts.push(`Подъезд: ${fields.entrance.trim()}`);
  if (fields.doorCode?.trim()) parts.push(`Код двери: ${fields.doorCode.trim()}`);
  if (fields.floor?.trim()) parts.push(`Этаж: ${fields.floor.trim()}`);
  if (fields.apartment?.trim()) parts.push(`Квартира: ${fields.apartment.trim()}`);
  if (fields.addressComment?.trim()) parts.push(`Комментарий: ${fields.addressComment.trim()}`);

  return parts.join(", ");
};

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      type: "PICKUP",
      address: "",
      city: "",
      street: "",
      house: "",
      coordinates: null,
      privateHouse: false,
      entrance: "",
      doorCode: "",
      floor: "",
      apartment: "",
      addressComment: "",
      setType: (type) => set({ type }),
      setAddress: (address) => set({ address }),
      setCity: (city) =>
        set((state) => ({
          city,
          address: formatDeliveryAddress({ ...state, city }),
        })),
      setStreet: (street) =>
        set((state) => ({
          street,
          address: formatDeliveryAddress({ ...state, street }),
        })),
      setCoordinates: (coordinates) => set({ coordinates }),
      setHouse: (house) =>
        set((state) => ({
          house,
          address: formatDeliveryAddress({ ...state, house }),
        })),
      setPrivateHouse: (privateHouse) =>
        set((state) => ({
          privateHouse,
          address: formatDeliveryAddress({ ...state, privateHouse }),
        })),
      setEntrance: (entrance) =>
        set((state) => ({
          entrance,
          address: formatDeliveryAddress({ ...state, entrance }),
        })),
      setDoorCode: (doorCode) =>
        set((state) => ({
          doorCode,
          address: formatDeliveryAddress({ ...state, doorCode }),
        })),
      setFloor: (floor) =>
        set((state) => ({
          floor,
          address: formatDeliveryAddress({ ...state, floor }),
        })),
      setApartment: (apartment) =>
        set((state) => ({
          apartment,
          address: formatDeliveryAddress({ ...state, apartment }),
        })),
      setAddressComment: (addressComment) =>
        set((state) => ({
          addressComment,
          address: formatDeliveryAddress({ ...state, addressComment }),
        })),
    }),
    { name: "bakery-delivery" }
  )
);
