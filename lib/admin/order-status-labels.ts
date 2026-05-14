import type { OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Новый",
  CONFIRMED: "Подтверждён",
  PREPARING: "Готовится",
  READY: "Готов",
  DELIVERING: "В доставке",
  COMPLETED: "Выдан",
  CANCELLED: "Отменён",
};

export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status] ?? status;
}
