import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) => {
        if (!productId) return;
        set((state) => {
          if (state.ids.includes(productId)) {
            return { ids: state.ids.filter((id) => id !== productId) };
          }
          return { ids: [...state.ids, productId] };
        });
      },
    }),
    {
      name: "bakery-favorites",
      partialize: (state) => ({ ids: state.ids }),
    }
  )
);
