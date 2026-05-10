"use client";

import { Heart, Plus, Minus } from "lucide-react";
import { RestaurantProduct } from "@/data/restaurant-menu";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCardImage } from "@/components/shop/ProductCardImage";

interface RestaurantProductCardProps {
  product: RestaurantProduct;
  onClick?: () => void;
}

export function RestaurantProductCard({ product, onClick }: RestaurantProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.ids.includes(product.id));
  const cartItem = items.find((i) => i.productId === product.id);
  const inCart = !!cartItem;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface-1 shadow-card transition-transform duration-300 sm:rounded-[28px] md:rounded-[32px] hover:-translate-y-0.5 hover:shadow-card-hover md:hover:-translate-y-1">
      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-surface-2 sm:aspect-[4/3] md:aspect-auto md:h-48 lg:h-52">
        <ProductCardImage
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 33vw, 25vw"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          className={cn(
            "absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface-1/95 shadow-sm ring-1 ring-border transition-colors",
            "hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            isFavorite ? "text-accent" : "text-text-3"
          )}
        >
          <Heart
            className="h-[18px] w-[18px]"
            strokeWidth={2}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 md:p-5">
        <div className="min-h-0 flex-1 space-y-2 sm:space-y-3">
          <div>
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-text sm:text-[18px] sm:leading-tight md:text-[20px] md:leading-7">
              {product.name}
            </h3>
            {product.weight ? (
              <p className="mt-1.5 text-[11px] text-text-3 sm:mt-2 sm:text-sm">{product.weight}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-text-3">
            {product.isHalal && <Badge variant="halal">Халяль</Badge>}
          </div>
        </div>

        <div className="mt-3 border-t border-border/40 pt-3 sm:mt-4 sm:pt-4 md:border-0 md:pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span className="text-[15px] font-semibold tabular-nums leading-none text-text sm:text-lg md:text-xl">
                  {formatPrice(Math.max(0, product.price))}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-coffee sm:text-[10px] sm:tracking-[0.16em]">
                  1 шт
                </span>
              </div>
            </div>
            {inCart ? (
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full sm:h-9 sm:w-9 md:h-10 md:w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(product.id, cartItem.quantity - 1);
                  }}
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <span className="min-w-[1.25rem] text-center text-xs font-semibold tabular-nums text-text sm:text-sm">
                  {cartItem.quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full sm:h-9 sm:w-9 md:h-10 md:w-10"
                  onClick={handleAdd}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 gap-1 rounded-full bg-brand px-2.5 text-[11px] font-semibold text-white shadow-sm hover:bg-brand-hover sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                onClick={(e) => handleAdd(e)}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Добавить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
