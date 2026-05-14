"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ShopPageHero } from "@/components/shop/ShopPageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductModal } from "@/components/shop/ProductModal";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Product } from "@/types";
import { filterBakeryCategories } from "@/lib/menu-search";
import { BAKERY_MENU_PROMO_BANNER } from "@/lib/promo";

interface Category {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json() as Promise<Category[]>)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = useMemo(
    () => filterBakeryCategories(categories, searchQuery),
    [categories, searchQuery]
  );

  /** Категории с хотя бы одним товаром (из БД могут прийти пустые блоки). */
  const visibleCategories = useMemo(
    () => filteredCategories.filter((c) => c.products.length > 0),
    [filteredCategories]
  );

  const navCategories = useMemo(
    () =>
      visibleCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    [visibleCategories]
  );

  const catalogEmpty =
    !loading &&
    searchQuery.trim().length === 0 &&
    visibleCategories.length === 0;

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-10">
          <div className="h-48 rounded-[28px] bg-surface-2 md:h-56" />
          <div className="h-14 rounded-full bg-surface-2" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-[32px] bg-surface-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmptySearch =
    searchQuery.trim().length > 0 && filteredCategories.length === 0;

  return (
    <div>
      <ShopPageHero
        title="Меню пекарни"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск: блины, пироги, десерты…"
        promoLayout="full"
        promoImageSrc={BAKERY_MENU_PROMO_BANNER}
        promoImageAlt="Акции и специальные предложения — свежая выпечка"
      />

      {navCategories.length > 0 ? <CategoryNav categories={navCategories} /> : null}

      <div className="container mx-auto max-w-6xl space-y-14 px-4 py-10">
        {catalogEmpty && (
          <div className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-10 text-center shadow-card">
            <p className="text-[15px] font-medium text-text">
              В меню пока нет позиций
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-2">
              Страница берёт товары из базы данных. Если вы недавно подключили пустую
              БД или не запускали сид, выполните в корне проекта:{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[13px]">
                npx prisma db seed
              </code>
              . Либо добавьте категории и товары в{" "}
              <span className="font-medium text-text">админке → Товары</span>.
            </p>
          </div>
        )}

        {isEmptySearch && (
          <p className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-8 text-center text-[15px] leading-relaxed text-text-2 shadow-card">
            По запросу «{searchQuery.trim()}» ничего не нашлось. Попробуйте
            другое слово или сбросьте поиск.
          </p>
        )}

        {visibleCategories.map((category) => (
          <section
            key={category.id}
            id={category.slug}
            ref={(el) => {
              sectionRefs.current.set(category.slug, el);
            }}
            className="scroll-mt-[calc(var(--shop-header-height)+var(--shop-category-nav-height))]"
          >
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-border/70 pb-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-text md:text-[1.65rem]">
                {category.name}
              </h2>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-text-3 sm:inline">
                {category.products.length}{" "}
                {category.products.length === 1 ? "позиция" : "позиций"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 md:grid-cols-3 md:gap-5 lg:gap-6 xl:grid-cols-4">
              {category.products.map((product) => (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
}
