"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";
import { buildFavoritesLookup } from "@/lib/favorites-catalog";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

export default function FavoritesPage() {
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json() as Promise<Category[]>)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const lookup = useMemo(() => buildFavoritesLookup(categories), [categories]);

  const products = useMemo(() => {
    return favoriteIds
      .map((id) => lookup.get(id))
      .filter((p): p is Product => p != null);
  }, [favoriteIds, lookup]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-lg bg-surface-2" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-[28px] bg-surface-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 border-b border-border/70 pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text md:text-[1.65rem]">
          Избранное
        </h1>
        <p className="mt-2 text-[15px] text-text-2">
          Товары, которые вы отметили в пекарне или ресторане.
        </p>
      </header>

      {favoriteIds.length === 0 ? (
        <div
          className={cn(
            "rounded-[24px] border border-border/60 bg-surface-1 px-6 py-12 text-center shadow-card",
            "md:px-10"
          )}
        >
          <p className="text-[15px] leading-relaxed text-text-2">
            Пока ничего нет. Откройте меню и нажмите сердечко на карточке товара.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Меню пекарни
            </Link>
            <Link
              href="/restaurant"
              className="inline-flex rounded-full border border-border bg-surface-1 px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
            >
              Меню ресторана
            </Link>
          </div>
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-8 text-center text-[15px] leading-relaxed text-text-2 shadow-card">
          Сохранённые позиции больше не найдены в каталоге. Добавьте товары снова из{" "}
          <Link href="/menu" className="font-semibold text-brand underline-offset-4 hover:underline">
            меню
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 md:grid-cols-3 md:gap-5 lg:gap-6 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
