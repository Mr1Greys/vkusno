"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Pencil } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useAuthStore } from "@/store/authStore";
import { cn, formatPrice } from "@/lib/utils";
import { remainingAfterCart } from "@/lib/cart-stock";
import { maxBonusPointsForSubtotal } from "@/lib/shop-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryToggle } from "@/components/shop/DeliveryToggle";
import { CartBonusSummary } from "@/components/shop/CartBonusSummary";
import { ProductCardImage } from "@/components/shop/ProductCardImage";

const PAYMENT_OPTIONS = [
  {
    value: "cash" as const,
    title: "Наличные",
    hint: "Оплата курьеру при получении",
  },
  {
    value: "card_on_delivery" as const,
    title: "Картой при получении",
    hint: "Терминал или перевод курьеру",
  },
  {
    value: "card_online" as const,
    title: "Картой онлайн",
    hint: "Ссылка на оплату отправим в SMS или мессенджер",
  },
];

const checkoutSchema = z.object({
  name: z.string().min(2, "Имя обязательно"),
  phone: z.string().min(10, "Телефон обязателен"),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "card_on_delivery", "card_online"]),
  cashChangeFrom: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const FORM_ID = "checkout-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, bonusToUse, setBonusToUse } =
    useCartStore();
  const { type, address: deliveryAddress, coordinates: deliveryCoordinates } =
    useDeliveryStore();
  const { user, setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      paymentMethod: "cash",
      cashChangeFrom: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const total = getTotal();
  const maxBonus = Math.min(
    user?.bonusPoints || 0,
    maxBonusPointsForSubtotal(total)
  );

  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items.length, router]);

  useEffect(() => {
    if (bonusToUse > maxBonus) setBonusToUse(maxBonus);
  }, [maxBonus, bonusToUse, setBonusToUse]);

  const onSubmit = async (data: CheckoutForm) => {
    if (type === "DELIVERY" && !deliveryAddress) {
      alert("Укажите адрес доставки в блоке справа");
      return;
    }

    let comment = data.comment?.trim() || "";
    if (data.paymentMethod === "cash" && data.cashChangeFrom?.trim()) {
      const line = `Сдача с купюры: ${data.cashChangeFrom.trim()} ₽`;
      comment = comment ? `${comment}\n${line}` : line;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
          deliveryType: type,
          address: deliveryAddress || undefined,
          coordinates: deliveryCoordinates ?? undefined,
          guestName: data.name,
          guestPhone: data.phone,
          comment: comment || undefined,
          bonusUsed: bonusToUse,
          paymentMethod: data.paymentMethod,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Order failed");
      }

      const order = await res.json();
      clearCart();
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) setUser(await meRes.json());
      router.push(`/order/${order.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка оформления заказа");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee shadow-sm">
            <Sparkles className="h-3 w-3 text-accent" aria-hidden />
            Оформление
          </div>
          <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-text md:text-[2rem] md:tracking-tighter">
            Оформление заказа
          </h1>
          <p className="mt-2 max-w-lg text-[15px] text-text-2">
            Проверьте контакты и способ оплаты. Адрес и самовывоз — в блоке справа,
            как в корзине.
          </p>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-coffee underline-offset-4 hover:text-brand hover:underline"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Изменить корзину
        </Link>
      </div>

      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-border/60 bg-surface-1 p-5 shadow-card md:p-6">
              <h2 className="mb-5 font-display text-lg font-semibold text-text">
                Контактные данные
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text">
                    Имя
                  </Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    className="h-11 rounded-xl border-border/80 bg-white"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-error">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-text">
                    Телефон
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    className="h-11 rounded-xl border-border/80 bg-white"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-error">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-border/60 bg-surface-1 p-5 shadow-card md:p-6">
              <h2 className="mb-1 font-display text-lg font-semibold text-text">
                Способ оплаты
              </h2>
              <p className="mb-5 text-[13px] leading-relaxed text-text-2">
                Выберите удобный вариант — для наличных можно указать с какой купюры
                нужна сдача.
              </p>

              <fieldset className="space-y-3">
                <legend className="sr-only">Способ оплаты</legend>
                {PAYMENT_OPTIONS.map((opt) => {
                  const selected = paymentMethod === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={cn(
                        "overflow-hidden rounded-2xl border transition-colors",
                        selected
                          ? "border-brand bg-brand/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-brand/25"
                          : "border-border/60 bg-white/80 hover:border-border"
                      )}
                    >
                      <label className="flex cursor-pointer p-4 md:p-4">
                        <input
                          type="radio"
                          className="sr-only"
                          value={opt.value}
                          {...register("paymentMethod")}
                        />
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected
                              ? "border-brand bg-brand"
                              : "border-border bg-white"
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 pl-3">
                          <span className="block text-[15px] font-semibold text-text">
                            {opt.title}
                          </span>
                          <span className="mt-0.5 block text-[13px] text-text-2">
                            {opt.hint}
                          </span>
                        </span>
                      </label>

                      {opt.value === "cash" && selected && (
                        <div className="border-t border-border/50 px-4 pb-4 pt-3">
                          <Label
                            htmlFor="cashChangeFrom"
                            className="text-[13px] text-text-2"
                          >
                            Сдача с купюры
                          </Label>
                          <Input
                            id="cashChangeFrom"
                            inputMode="numeric"
                            placeholder="Например, 1000"
                            className="mt-2 h-11 rounded-xl border-border/80 bg-white"
                            {...register("cashChangeFrom")}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </fieldset>
              {errors.paymentMethod && (
                <p className="mt-2 text-sm text-error">
                  {errors.paymentMethod.message}
                </p>
              )}
            </section>

            <section className="rounded-[24px] border border-border/60 bg-surface-1 p-5 shadow-card md:p-6">
              <h2 className="mb-5 font-display text-lg font-semibold text-text">
                Комментарий к заказу
              </h2>
              <Textarea
                id="comment"
                rows={4}
                placeholder="Дополнительные пожелания по заказу или доставке…"
                className="resize-none rounded-xl border-border/80 bg-white text-[15px] leading-relaxed"
                {...register("comment")}
              />
            </section>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-[5.75rem]">
            <div className="space-y-3 rounded-[24px] border border-border/60 bg-surface-1 p-5 shadow-[0_32px_80px_-40px_rgba(74,60,47,0.45)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-text-3">
                Ваш заказ
              </h3>
              <ul className="space-y-4">
                {items.map((item) => {
                  const remaining = remainingAfterCart(
                    item.stockQuantity,
                    item.quantity
                  );
                  return (
                  <li
                    key={item.productId}
                    className="flex gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-surface-2 ring-1 ring-border/40">
                      <ProductCardImage
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-snug text-text">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[13px] text-text-2">
                        {formatPrice(item.price)} · {item.quantity} шт.
                      </p>
                      {remaining !== null ? (
                        <p
                          className={cn(
                            "mt-0.5 text-[12px]",
                            remaining === 0
                              ? "font-medium text-error"
                              : "text-text-3"
                          )}
                        >
                          {remaining === 0
                            ? "Нет в наличии"
                            : `Осталось: ${remaining}`}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-[15px] font-bold tabular-nums text-text">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                  );
                })}
              </ul>
            </div>

            <DeliveryToggle />

            <CartBonusSummary variant="page" />

            <Button
              type="submit"
              form={FORM_ID}
              size="lg"
              disabled={submitting}
              className="h-[52px] w-full rounded-full text-[15px] font-semibold shadow-[0_16px_40px_-14px_rgba(74,60,47,0.55)]"
            >
              {submitting ? "Оформляем…" : "Оформить заказ"}
            </Button>
          </aside>
        </div>
      </form>
    </div>
  );
}
