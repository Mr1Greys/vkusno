export type BonusHistoryRow = {
  id: string;
  type: string;
  amount: number;
  description?: string | null;
  orderId?: string | null;
  createdAt: string;
};

/** Подписи для клиента — без QR, админа и внутренних reason. */
export function getBonusOperationDisplay(
  row: BonusHistoryRow,
  bonusPercent: number
): { title: string; subtitle: string; isDebit: boolean } {
  const isDebit = row.type === "SPENT";

  switch (row.type) {
    case "SPENT":
      return {
        title: "Оплата бонусами",
        subtitle: "Списание бонусов при оплате",
        isDebit: true,
      };
    case "EARNED":
      return {
        title: "Бонусы за заказ",
        subtitle: `Начислено ${bonusPercent}% от суммы заказа`,
        isDebit: false,
      };
    case "MANUAL":
      return isDebit
        ? {
            title: "Списание бонусов",
            subtitle: "Списание с карты лояльности",
            isDebit: true,
          }
        : {
            title: "Начисление бонусов",
            subtitle: "Зачисление на карту лояльности",
            isDebit: false,
          };
    default:
      return {
        title: isDebit ? "Списание бонусов" : "Начисление бонусов",
        subtitle: isDebit
          ? "Списание с карты лояльности"
          : "Зачисление на карту лояльности",
        isDebit,
      };
  }
}

export function formatBonusHistoryDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} • ${time}`;
}
