import { create } from "zustand";
import { persist } from "zustand/middleware";
import { maxSelectableQuantity } from "@/lib/cart-stock";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  /** null — без лимита по складу */
  stockQuantity?: number | null;
}

interface CartState {
  items: CartItem[];
  /** Списание бонусами (1 б. = 1 ₽ к оплате), синхронно с чекаутом */
  bonusToUse: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setBonusToUse: (n: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemsCount: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      bonusToUse: 0,
      isOpen: false,
      setBonusToUse: (n) =>
        set({ bonusToUse: Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)) }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        set((state) => {
          const cap = maxSelectableQuantity(item.stockQuantity);
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const stock = item.stockQuantity ?? existing.stockQuantity;
            const maxQ = maxSelectableQuantity(stock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      stockQuantity: stock,
                      quantity: Math.min(maxQ, i.quantity + 1),
                    }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(cap, 1) }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId) return i;
            const maxQ = maxSelectableQuantity(i.stockQuantity);
            return { ...i, quantity: Math.min(maxQ, quantity) };
          }),
        }));
      },
      clearCart: () => set({ items: [], bonusToUse: 0 }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "bakery-cart",
      partialize: (state) => ({
        items: state.items,
        bonusToUse: state.bonusToUse,
      }),
    }
  )
);