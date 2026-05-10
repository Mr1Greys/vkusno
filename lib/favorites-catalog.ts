import type { Product } from "@/types";
import {
  restaurantMenu,
  type RestaurantProduct,
} from "@/data/restaurant-menu";

function restaurantProductToProduct(p: RestaurantProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: null,
    price: p.price,
    weight: p.weight ?? null,
    imageUrl: p.imageUrl ?? null,
    isAvailable: true,
    isHalal: !!p.isHalal,
    sortOrder: 0,
    categoryId: "restaurant",
  };
}

/** Пекарня из API + статичное меню ресторана (для избранного с обеих витрин). */
export function buildFavoritesLookup(
  bakeryCategories: { products: Product[] }[]
): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const cat of bakeryCategories) {
    for (const p of cat.products) {
      map.set(p.id, p);
    }
  }
  for (const cat of restaurantMenu) {
    for (const p of cat.products) {
      if (!map.has(p.id)) {
        map.set(p.id, restaurantProductToProduct(p));
      }
    }
  }
  return map;
}
