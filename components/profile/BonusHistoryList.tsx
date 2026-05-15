"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatBonusHistoryDate,
  getBonusOperationDisplay,
  type BonusHistoryRow,
} from "@/lib/bonus-history-display";

const PAGE_SIZE = 5;

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
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage(0);
  }, [rows.length]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const visibleRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const rangeFrom = rows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeTo = Math.min((safePage + 1) * PAGE_SIZE, rows.length);
  const showPager = rows.length > PAGE_SIZE;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/60 bg-surface-1 shadow-card ring-1 ring-black/[0.03]",
        className
      )}
    >
      <div className="relative p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h3 className="font-display text-base font-bold text-text">История операций</h3>
          {showPager ? (
            <p className="shrink-0 text-[12px] font-medium tabular-nums text-text-3">
              {rangeFrom}–{rangeTo} из {rows.length}
            </p>
          ) : rows.length > 0 ? (
            <p className="shrink-0 text-[12px] font-medium text-text-3">
              {rows.length}{" "}
              {rows.length === 1 ? "операция" : rows.length < 5 ? "операции" : "операций"}
            </p>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-white/50 px-4 py-10 text-center">
            <p className="text-[15px] font-medium text-text">Пока без движений</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-2">
              После заказов здесь появятся начисления и списания бонусов.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-3" aria-live="polite" aria-relevant="additions text">
              {visibleRows.map((row) => {
                const { title, subtitle, isDebit } = getBonusOperationDisplay(
                  row,
                  bonusPercent
                );
                return (
                  <li
                    key={row.id}
                    className="rounded-[20px] border border-border/50 bg-white p-4 shadow-[0_4px_20px_-12px_rgba(74,60,47,0.18)]"
                  >
                    <div className="flex gap-3.5">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                          isDebit
                            ? "bg-error/[0.08] text-error"
                            : "bg-success/[0.1] text-success"
                        )}
                        aria-hidden
                      >
                        {isDebit ? (
                          <ArrowDownRight className="h-5 w-5" strokeWidth={2} />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 pr-1">
                            <p className="text-[15px] font-medium leading-snug text-text">
                              {title}
                            </p>
                            <p className="mt-0.5 text-[13px] font-normal leading-snug text-text-2/90">
                              {subtitle}
                            </p>
                            <p className="mt-3 text-[12px] font-normal text-text-3">
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
                            <p className="mt-1 text-[11px] font-normal text-text-3">бонусов</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {showPager ? (
              <nav
                className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4"
                aria-label="Навигация по истории операций"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                    safePage === 0
                      ? "cursor-not-allowed border-border/50 bg-surface-2/50 text-text-3"
                      : "border-border bg-white text-text hover:bg-surface-2 active:scale-[0.98]"
                  )}
                  aria-label="Предыдущие операции"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  <span className="sr-only sm:not-sr-only sm:inline">Назад</span>
                </button>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[13px] font-medium tabular-nums text-text">
                    {safePage + 1} / {totalPages}
                  </span>
                  {totalPages <= 8 ? (
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            i === safePage
                              ? "w-5 bg-brand"
                              : "w-1.5 bg-border hover:bg-coffee/50"
                          )}
                          aria-label={`Страница ${i + 1}`}
                          aria-current={i === safePage ? "page" : undefined}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                    safePage >= totalPages - 1
                      ? "cursor-not-allowed border-border/50 bg-surface-2/50 text-text-3"
                      : "border-border bg-white text-text hover:bg-surface-2 active:scale-[0.98]"
                  )}
                  aria-label="Следующие операции"
                >
                  <span className="sr-only sm:not-sr-only sm:inline">Далее</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
