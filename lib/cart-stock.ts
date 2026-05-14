/** Лимит количества в корзине, если остаток не ведём (согласовано с API заказа max 999). */
export const CART_QUANTITY_CAP = 999;

export function maxSelectableQuantity(
  stockQuantity: number | null | undefined
): number {
  if (stockQuantity == null) return CART_QUANTITY_CAP;
  return Math.min(CART_QUANTITY_CAP, Math.max(0, stockQuantity));
}

/**
 * Сколько ещё свободно на витрине при уже добавленном в корзину количестве
 * (остаток в БД минус штуки в корзине по этой позиции).
 */
export function remainingAfterCart(
  stockTotal: number | null | undefined,
  quantityInCart: number
): number | null {
  if (stockTotal == null) return null;
  return Math.max(0, stockTotal - quantityInCart);
}

/** Нельзя добавить ещё одну штуку: учёт остатка и текущее количество в корзине. */
export function isAtStockCeiling(
  stockTotal: number | null | undefined,
  quantityInCart: number
): boolean {
  if (stockTotal == null) return false;
  return quantityInCart >= stockTotal;
}
