"use client";

import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeliveryToggle } from "@/components/shop/DeliveryToggle";
import { CartBonusSummary } from "@/components/shop/CartBonusSummary";
import { ProductCardImage } from "@/components/shop/ProductCardImage";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/[0.12] blur-3xl"
        />
        <div className="relative mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-1 shadow-card ring-1 ring-border/60">
            <ShoppingBag className="h-9 w-9 text-coffee" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-text md:text-[2rem]">
            Корзина пуста
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-text-2">
            Добавьте что‑нибудь из меню — мы бережно соберём заказ и доставим горячим.
          </p>
          <Button
            size="lg"
            className="mt-10 h-12 min-w-[200px] rounded-full px-8 text-[15px] font-semibold"
            asChild
          >
            <Link href="/menu">Выбрать блюда</Link>
          </Button>
          <Link
            href="/"
            className="mt-4 block text-sm font-semibold text-coffee underline-offset-4 hover:text-brand hover:underline"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee shadow-sm">
            <Sparkles className="h-3 w-3 text-accent" aria-hidden />
            Ваш заказ
          </div>
          <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-text md:text-[2rem] md:tracking-tighter">
            Корзина
          </h1>
          <p className="mt-2 max-w-lg text-[15px] text-text-2">
            Проверьте состав и способ получения — промежуточные суммы совпадают с
            оплатой на шаге оформления.
          </p>
        </div>
        <p className="text-sm font-semibold text-text-3">{items.length}{" "}наим.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="group flex gap-4 rounded-[24px] border border-border/60 bg-surface-1 p-4 shadow-card transition-shadow duration-300 hover:border-border hover:shadow-card-hover md:p-5"
            >
              <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[20px] bg-surface-2 ring-1 ring-border/40">
                <ProductCardImage
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="92px"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-[17px] font-semibold leading-snug text-text md:text-[1.05rem]">
                      {item.name}
                    </h3>
                    <p className="text-[13px] font-medium text-text-2 md:text-sm">
                      {formatPrice(item.price)}{" "}
                      <span className="text-text-3">· за шт.</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-[-4px] h-10 w-10 shrink-0 text-text-3 hover:bg-error/10 hover:text-error md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
                    aria-label={`Удалить ${item.name}`}
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-surface-2/80 p-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Меньше"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4 text-text-2" />
                    </Button>
                    <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-text">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Больше"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4 text-text-2" />
                    </Button>
                  </div>
                  <p className="text-lg font-bold tabular-nums tracking-tight text-text">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </article>
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-full border-error/35 text-error hover:bg-error/10 hover:text-error md:w-auto"
            onClick={clearCart}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
            Очистить корзину
          </Button>
        </div>

        <aside className="lg:sticky lg:top-[5.75rem] space-y-4 self-start">
          <DeliveryToggle />

          <CartBonusSummary variant="page" />

          <Button
            asChild
            size="lg"
            className="h-[52px] w-full rounded-full text-[15px] font-semibold shadow-[0_16px_40px_-14px_rgba(74,60,47,0.55)]"
          >
            <Link href="/checkout">Оформить заказ</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
