import type { Product } from "@/types";
import type { RestaurantCategory } from "@/data/restaurant-menu";

export type BakeryCategory = {
  id: string;
  name: string;
  slug: string;
  products: Product[];
};

export function filterBakeryCategories(
  categories: BakeryCategory[],
  query: string
): BakeryCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => {
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.description?.toLowerCase().includes(q)) return true;
        return false;
      }),
    }))
    .filter((c) => c.products.length > 0);
}

export function filterRestaurantCategories(
  menu: RestaurantCategory[],
  query: string
): RestaurantCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu
    .map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.name.toLowerCase().includes(q)),
    }))
    .filter((c) => c.products.length > 0);
}
