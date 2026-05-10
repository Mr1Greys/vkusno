export type ShopSettingsMap = Record<string, string>;

/**
 * Цены товаров и суммы корзины/заказа — в копейках (как в БД).
 * Значения настроек (delivery_price, bonus_min_amount и т.д.) — в рублях.
 */
export const KOPEKS_PER_RUBLE = 100;

/** Max share of cart subtotal that can be paid with bonus points (server + client). */
export const BONUS_SPEND_MAX_FRACTION = 0.3;

export function settingsRowsToMap(
  rows: { key: string; value: string }[]
): ShopSettingsMap {
  return Object.fromEntries(rows.map((s) => [s.key, s.value]));
}

export function getDeliveryCost(
  subtotalKopeks: number,
  deliveryType: "DELIVERY" | "PICKUP",
  map: ShopSettingsMap
): number {
  if (deliveryType !== "DELIVERY") return 0;
  const deliveryRub = parseInt(map.delivery_price || "100", 10);
  const freeFromRub = parseInt(map.delivery_free_from || "1000", 10);
  const freeFromKop = freeFromRub * KOPEKS_PER_RUBLE;
  if (subtotalKopeks >= freeFromKop) return 0;
  return deliveryRub * KOPEKS_PER_RUBLE;
}

/** Начисление бонусов: 1 бонус = 1 ₽ «кэшбэка»; процент от суммы оплаты в рублях. */
export function computeBonusEarned(
  finalAmountPayableKopeks: number,
  map: ShopSettingsMap
): number {
  const bonusPercent = parseInt(map.bonus_percent || "5", 10);
  const minRub = parseInt(map.bonus_min_amount || "200", 10);
  const minKop = minRub * KOPEKS_PER_RUBLE;
  if (finalAmountPayableKopeks < minKop) return 0;
  return Math.floor(
    (finalAmountPayableKopeks * bonusPercent) /
      (100 * KOPEKS_PER_RUBLE)
  );
}

export function maxBonusSpendForSubtotal(subtotal: number): number {
  return Math.floor(subtotal * BONUS_SPEND_MAX_FRACTION);
}
