"use client";

import { useEffect, useMemo, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import type { RestaurantCategory } from "@/data/restaurant-menu";
import { RestaurantProductCard } from "@/components/shop/RestaurantProductCard";
import { ShopPageHero } from "@/components/shop/ShopPageHero";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { filterRestaurantCategories } from "@/lib/menu-search";
import { RESTAURANT_MENU_PROMO_BANNER } from "@/lib/promo";

export default function RestaurantPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menu, setMenu] = useState<RestaurantCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/restaurant/categories")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<RestaurantCategory[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setMenu(Array.isArray(data) ? data : []);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMenu([]);
          setLoadError("Не удалось загрузить меню. Попробуйте обновить страницу.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMenu = useMemo(
    () => filterRestaurantCategories(menu, searchQuery) as RestaurantCategory[],
    [menu, searchQuery]
  );

  const navCategories = useMemo(
    () =>
      filteredMenu.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    [filteredMenu]
  );

  const isEmptySearch =
    searchQuery.trim().length > 0 && filteredMenu.length === 0;

  return (
    <div className="min-h-screen bg-cream">
      <ShopPageHero
        title="Меню ресторана"
        titleIcon={<UtensilsCrossed className="h-5 w-5" aria-hidden />}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск: салаты, супы, горячее, мангал…"
        promoLayout="full"
        promoImageSrc={RESTAURANT_MENU_PROMO_BANNER}
        promoImageAlt="Акции и специальные предложения"
      />

      <CategoryNav categories={navCategories} />

      <div className="container mx-auto max-w-6xl space-y-14 px-4 pb-16">
        {loadError && (
          <p className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-8 text-center text-[15px] leading-relaxed text-text-2 shadow-card">
            {loadError}
          </p>
        )}

        {!loadError && menu.length === 0 && (
          <p className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-8 text-center text-[15px] leading-relaxed text-text-2 shadow-card">
            Пока нет позиций в меню ресторана. Если вы администратор, выполните{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">
              npx prisma db seed
            </code>{" "}
            после миграций.
          </p>
        )}

        {isEmptySearch && (
          <p className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-8 text-center text-[15px] leading-relaxed text-text-2 shadow-card">
            По запросу «{searchQuery.trim()}» ничего не нашлось. Попробуйте
            другое слово или сбросьте поиск.
          </p>
        )}

        {filteredMenu.map((category) => (
          <section
            key={category.id}
            id={category.slug}
            className="scroll-mt-[calc(var(--shop-header-height)+var(--shop-category-nav-height))]"
          >
            <div className="mb-6 border-b border-border/70 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-text md:text-[1.65rem]">
                    {category.name}
                  </h2>
                  <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-text-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 md:grid-cols-3 md:gap-5 lg:gap-6 xl:grid-cols-4">
              {category.products.map((product) => (
                <RestaurantProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
