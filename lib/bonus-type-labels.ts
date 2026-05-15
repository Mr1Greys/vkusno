import type { BonusType } from "@prisma/client";

const LABELS: Record<BonusType, string> = {
  EARNED: "Начисление",
  SPENT: "Списание",
  MANUAL: "Вручную",
};

export function bonusTypeLabel(type: string): string {
  if (type in LABELS) return LABELS[type as BonusType];
  return type;
}
