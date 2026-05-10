"use client";

import { Plus, Minus } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCardImage } from "@/components/shop/ProductCardImage";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { items, addItem, updateQuantity } = useCartStore();

  if (!product) return null;

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2">
          <ProductCardImage
            key={product.id}
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>

        {product.description && (
          <p className="text-text-2">{product.description}</p>
        )}

        <div className="flex items-center gap-2">
          {product.weight && <span className="text-text-3">Вес: {product.weight}</span>}
          {product.isHalal && <Badge variant="halal">Халяль</Badge>}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-2xl font-bold">{formatPrice(product.price)}</span>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-surface-2 rounded-full">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="w-8 text-center font-bold text-lg">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={handleAdd}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleAdd} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              В корзину
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}