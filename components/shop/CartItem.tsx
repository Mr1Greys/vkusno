"use client";

import { Plus, Minus } from "lucide-react";
import { CartItem as CartItemType } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { remainingAfterCart, isAtStockCeiling } from "@/lib/cart-stock";
import { Button } from "@/components/ui/button";
import { ProductCardImage } from "@/components/shop/ProductCardImage";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity } = useCartStore();
  const remaining = remainingAfterCart(item.stockQuantity, item.quantity);
  const atCeiling = isAtStockCeiling(item.stockQuantity, item.quantity);

  return (
    <div className="flex gap-3 py-3 border-b border-border">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        <ProductCardImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.name}</h4>
        <p className="text-text-2 text-sm">{formatPrice(item.price)}</p>
        {remaining !== null ? (
          <p
            className={
              remaining === 0
                ? "mt-0.5 text-xs font-medium text-error"
                : "mt-0.5 text-xs text-text-3"
            }
          >
            {remaining === 0 ? "Нет в наличии" : `Осталось: ${remaining}`}
          </p>
        ) : null}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 bg-surface-2 rounded-full">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full"
              disabled={atCeiling}
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <span className="font-medium">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}