import type { Product } from "@/types";

function restaurantApiProductToProduct(p: {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  weight?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isHalal?: boolean;
  sortOrder?: number;
  categoryId: string;
  stockQuantity?: number | null;
}): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    weight: p.weight ?? null,
    imageUrl: p.imageUrl ?? null,
    isAvailable: p.isAvailable ?? true,
    isHalal: p.isHalal ?? false,
    sortOrder: p.sortOrder ?? 0,
    categoryId: p.categoryId,
    stockQuantity: p.stockQuantity,
  };
}

/** Пекарня + ресторан (для избранного с обеих витрин). */
export function buildFavoritesLookup(
  bakeryCategories: { products: Product[] }[],
  restaurantCategories: { products: Product[] }[] = []
): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const cat of bakeryCategories) {
    for (const p of cat.products) {
      map.set(p.id, p);
    }
  }
  for (const cat of restaurantCategories) {
    for (const raw of cat.products) {
      const p = restaurantApiProductToProduct(raw);
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    }
  }
  return map;
}
