"use client";

import { cn } from "@/lib/utils";
import {
  formatBonusHistoryDate,
  getBonusOperationDisplay,
  type BonusHistoryRow,
} from "@/lib/bonus-history-display";

function formatBonusPoints(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

type BonusHistoryListProps = {
  rows: BonusHistoryRow[];
  bonusPercent?: number;
  className?: string;
};

export function BonusHistoryList({
  rows,
  bonusPercent = 5,
  className,
}: BonusHistoryListProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/60 bg-surface-1 shadow-card ring-1 ring-black/[0.03]",
        className
      )}
    >
      <div className="relative p-5 sm:p-6">
        <h3 className="mb-4 font-display text-base font-bold text-text">История операций</h3>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-white/50 px-4 py-10 text-center">
            <p className="text-[15px] font-medium text-text">Пока без движений</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-2">
              После заказов здесь появятся начисления и списания бонусов.
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(480px,58vh)] space-y-3 overflow-y-auto pr-0.5">
            {rows.map((row) => {
              const { title, subtitle, isDebit } = getBonusOperationDisplay(
                row,
                bonusPercent
              );
              return (
                <li
                  key={row.id}
                  className="rounded-[20px] border border-border/50 bg-white p-4 shadow-[0_4px_20px_-12px_rgba(74,60,47,0.18)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-1">
                      <p className="font-semibold leading-snug text-text">{title}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-text-2">{subtitle}</p>
                      <p className="mt-3 text-[12px] text-text-3">
                        <time dateTime={row.createdAt}>
                          {formatBonusHistoryDate(row.createdAt)}
                        </time>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-[1.35rem] font-bold leading-none tabular-nums tracking-tight",
                          isDebit ? "text-error" : "text-success"
                        )}
                      >
                        {isDebit ? "−" : "+"}
                        {formatBonusPoints(row.amount)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-text-3">бонусов</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
