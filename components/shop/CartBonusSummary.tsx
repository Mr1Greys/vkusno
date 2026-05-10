"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useAuthStore } from "@/store/authStore";
import { cn, formatPrice } from "@/lib/utils";
import {
  type ShopSettingsMap,
  getDeliveryCost,
  computeBonusEarned,
  KOPEKS_PER_RUBLE,
  maxBonusSpendForSubtotal,
} from "@/lib/shop-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultSettings: ShopSettingsMap = {
  delivery_price: "100",
  delivery_free_from: "1000",
  bonus_percent: "5",
  bonus_min_amount: "200",
  min_order_amount: "0",
};

type Variant = "drawer" | "page";

interface CartBonusSummaryProps {
  variant?: Variant;
  className?: string;
}

export function CartBonusSummary({
  variant = "drawer",
  className,
}: CartBonusSummaryProps) {
  const bonusFieldId = useId();
  const { getTotal, bonusToUse, setBonusToUse } = useCartStore();
  const { type } = useDeliveryStore();
  const { user } = useAuthStore();
  const [shopSettings, setShopSettings] =
    useState<ShopSettingsMap>(defaultSettings);

  useEffect(() => {
    fetch("/api/shop/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ShopSettingsMap | null) => {
        if (data) setShopSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user && bonusToUse > 0) setBonusToUse(0);
  }, [user, bonusToUse, setBonusToUse]);

  const subtotal = getTotal();
  const deliveryCost =
    type === "DELIVERY"
      ? getDeliveryCost(subtotal, "DELIVERY", shopSettings)
      : 0;
  const maxBonus = user
    ? Math.min(user.bonusPoints, maxBonusSpendForSubtotal(subtotal))
    : 0;

  useEffect(() => {
    if (bonusToUse > maxBonus) setBonusToUse(maxBonus);
  }, [bonusToUse, maxBonus, setBonusToUse]);

  const finalPayable = Math.max(0, subtotal + deliveryCost - bonusToUse);
  const estimatedEarnLoggedIn =
    user != null ? computeBonusEarned(finalPayable, shopSettings) : 0;
  const teaserEarnGuest = computeBonusEarned(
    subtotal + deliveryCost,
    shopSettings
  );

  const minForBonusRub = parseInt(
    shopSettings.bonus_min_amount || "200",
    10
  );
  const minForBonusKop = minForBonusRub * KOPEKS_PER_RUBLE;
  const bonusPercent = parseInt(shopSettings.bonus_percent || "5", 10);
  const freeFromRub = parseInt(
    shopSettings.delivery_free_from || "1000",
    10
  );
  const freeFromKop = freeFromRub * KOPEKS_PER_RUBLE;

  const cardClass =
    variant === "page"
      ? "space-y-3 rounded-[24px] border border-border/60 bg-surface-1 p-5 shadow-[0_32px_80px_-40px_rgba(74,60,47,0.45)]"
      : "space-y-3 rounded-2xl border border-border/60 bg-surface-1 p-4";

  return (
    <div className={cn(cardClass, className)}>
      <div className="flex items-center justify-between text-[15px]">
        <span className="text-text-2">Товары</span>
        <span className="font-semibold tabular-nums text-text">
          {formatPrice(subtotal)}
        </span>
      </div>
      {deliveryCost > 0 && (
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-text-2">Доставка</span>
          <span className="font-semibold tabular-nums text-text">
            {formatPrice(deliveryCost)}
          </span>
        </div>
      )}
      {type === "DELIVERY" && subtotal > 0 && subtotal < freeFromKop && (
        <p className="rounded-2xl bg-accent/15 px-3 py-2 text-[13px] font-medium leading-relaxed text-brand">
          До бесплатной доставки осталось{" "}
          <span className="font-semibold tabular-nums">
            {formatPrice(freeFromKop - subtotal)}
          </span>
        </p>
      )}
      {user && bonusToUse > 0 && (
        <div className="flex items-center justify-between text-[15px] text-success">
          <span>Списание бонусами</span>
          <span className="font-semibold tabular-nums">
            −{formatPrice(bonusToUse)}
          </span>
        </div>
      )}

      <div
        className={cn(
          "my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent",
          variant === "drawer" && "my-3"
        )}
      />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-text-3">
          К оплате
        </span>
        <span
          className={cn(
            "font-bold tabular-nums tracking-tighter text-brand",
            variant === "page" ? "text-3xl" : "text-2xl"
          )}
        >
          {formatPrice(finalPayable)}
        </span>
      </div>

      {/* Начисление */}
      <div className="rounded-2xl bg-brand/[0.06] px-3 py-2.5">
        <div className="flex gap-2">
          <Gift
            className="mt-0.5 h-4 w-4 shrink-0 text-brand"
            strokeWidth={2}
            aria-hidden
          />
          <div className="min-w-0 space-y-1 text-[13px] leading-snug text-text-2">
            {user ? (
              <>
                {finalPayable >= minForBonusKop ? (
                  <p>
                    <span className="font-semibold text-text">
                      +{estimatedEarnLoggedIn} бонусов
                    </span>{" "}
                    начислим на карту после заказа ({bonusPercent}% от суммы
                    оплаты).
                  </p>
                ) : (
                  <p>
                    Начисление от {minForBonusRub} ₽: добавьте позиций ещё на{" "}
                    <span className="font-semibold tabular-nums text-text">
                      {formatPrice(minForBonusKop - finalPayable)}
                    </span>
                    .
                  </p>
                )}
              </>
            ) : teaserEarnGuest > 0 ? (
              <p>
                <Link
                  href="/profile"
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Войдите в профиль
                </Link>
                {" "}
                — после оплаты начислим до{" "}
                <span className="font-semibold text-text">
                  {teaserEarnGuest}
                </span>{" "}
                бонусов с этого заказа.
              </p>
            ) : (
              <p>
                <Link
                  href="/profile"
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Войдите в профиль
                </Link>
                , чтобы копить и списывать бонусы. Начисление — от{" "}
                {minForBonusRub} ₽ суммы оплаты.
              </p>
            )}
          </div>
        </div>
      </div>

      {user && user.bonusPoints > 0 && (
        <div className="space-y-2 pt-1">
          <Label
            htmlFor={`${bonusFieldId}-input`}
            className="text-[13px] text-text-2"
          >
            Списать бонусы (макс. {maxBonus} из {user.bonusPoints})
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id={`${bonusFieldId}-range`}
              type="range"
              min={0}
              max={maxBonus}
              value={Math.min(bonusToUse, maxBonus)}
              onChange={(e) =>
                setBonusToUse(parseInt(e.target.value, 10) || 0)
              }
              className="h-2 w-full cursor-pointer accent-brand"
              aria-valuemin={0}
              aria-valuemax={maxBonus}
              aria-valuenow={Math.min(bonusToUse, maxBonus)}
            />
            <Input
              id={`${bonusFieldId}-input`}
              type="number"
              inputMode="numeric"
              min={0}
              max={maxBonus}
              value={bonusToUse}
              onChange={(e) =>
                setBonusToUse(
                  Math.max(
                    0,
                    Math.min(maxBonus, parseInt(e.target.value, 10) || 0)
                  )
                )
              }
              className="h-10 w-full shrink-0 tabular-nums sm:w-[5.5rem]"
            />
          </div>
          <p className="text-[11px] leading-relaxed text-text-3">
            До {maxBonusSpendForSubtotal(subtotal)} ₽ можно оплатить бонусами
            (30% от суммы товаров).
          </p>
        </div>
      )}
    </div>
  );
}
