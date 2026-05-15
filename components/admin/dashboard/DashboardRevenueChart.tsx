"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueChartPoint } from "@/lib/admin/dashboard-stats";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CatalogFilter = "all" | "BAKERY" | "RESTAURANT";

function chartDayLabel(iso: string, dayCount: number): string {
  const dt = new Date(`${iso}T12:00:00+03:00`);
  if (dayCount === 1) {
    return dt.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Moscow",
    });
  }
  if (dayCount <= 14) {
    return dt.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Europe/Moscow",
    });
  }
  return dt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Moscow",
  });
}

function formatChartDate(iso: string): string {
  const dt = new Date(`${iso}T12:00:00+03:00`);
  return dt.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  });
}

function rublesTick(kopecks: number): string {
  const rub = kopecks / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}M`;
  if (rub >= 1_000) return `${Math.round(rub / 1_000)}k`;
  return `${Math.round(rub)}`;
}

function xAxisInterval(dayCount: number): number | "preserveStartEnd" {
  if (dayCount <= 10) return 0;
  if (dayCount <= 21) return 1;
  if (dayCount <= 45) return 2;
  return Math.max(3, Math.floor(dayCount / 12));
}

export function DashboardRevenueChart({
  data,
  from,
  to,
  dayCount,
}: {
  data: RevenueChartPoint[];
  from: string;
  to: string;
  dayCount: number;
}) {
  const [filter, setFilter] = useState<CatalogFilter>("all");

  const chartData = useMemo(() => {
    return data.map((row) => {
      const label = chartDayLabel(row.date, dayCount);
      if (filter === "BAKERY") {
        return { ...row, label, restaurant: 0, total: row.bakery };
      }
      if (filter === "RESTAURANT") {
        return { ...row, label, bakery: 0, total: row.restaurant };
      }
      return { ...row, label };
    });
  }, [data, filter, dayCount]);

  const maxTotal = useMemo(
    () => Math.max(0, ...chartData.map((r) => r.total)),
    [chartData]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Всё"],
            ["BAKERY", "Пекарня"],
            ["RESTAURANT", "Ресторан"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === key
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface-1 text-text-2 hover:bg-surface-2"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="h-[280px] w-full min-w-0">
        {maxTotal === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 px-4 text-center text-sm text-text-2">
            За выбранный период ({from === to ? from : `${from} — ${to}`}) нет выручки по
            заказам
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8B6F47" }}
                interval={xAxisInterval(dayCount)}
                angle={dayCount > 14 ? -35 : 0}
                textAnchor={dayCount > 14 ? "end" : "middle"}
                height={dayCount > 14 ? 56 : 32}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8B6F47" }}
                tickFormatter={rublesTick}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(_, payload) => {
                  const iso = payload?.[0]?.payload?.date as string | undefined;
                  return iso ? formatChartDate(iso) : "";
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #D4C5B0",
                  background: "#FFFFFF",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {(filter === "all" || filter === "BAKERY") && (
                <Bar
                  dataKey="bakery"
                  name="Пекарня"
                  stackId="a"
                  fill="#4A3C2F"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {(filter === "all" || filter === "RESTAURANT") && (
                <Bar
                  dataKey="restaurant"
                  name="Ресторан"
                  stackId="a"
                  fill="#A8927A"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="text-xs text-text-2">
        {dayCount === 1
          ? "Один день"
          : `${dayCount} ${dayCount < 5 ? "дня" : "дней"}`}
        , сумма строк заказа (кол-во × цена), без отменённых. Период совпадает с фильтром
        дашборда.
      </p>
    </div>
  );
}
