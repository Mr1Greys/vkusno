"use client";

import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { CartItem } from "./CartItem";
import { CartBonusSummary } from "./CartBonusSummary";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, clearCart } = useCartStore();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-1 shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Корзина
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-text-3 mb-4" />
                <p className="text-text-2">Корзина пуста</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-4 border-t border-border bg-surface-2 p-4">
              <CartBonusSummary variant="drawer" className="bg-cream/50" />
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={() => onOpenChange(false)}>
                    Оформить заказ
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Очистить корзину
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}