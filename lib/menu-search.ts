import type { Product } from "@/types";

export type RestaurantMenuCategoryLike = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  products: { id: string; name: string }[];
};

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
  menu: RestaurantMenuCategoryLike[],
  query: string
): RestaurantMenuCategoryLike[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu
    .map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.name.toLowerCase().includes(q)),
    }))
    .filter((c) => c.products.length > 0);
}
