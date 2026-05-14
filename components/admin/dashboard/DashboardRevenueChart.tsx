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

function shortDayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function DashboardRevenueChart({
  data,
}: {
  data: RevenueChartPoint[];
}) {
  const [filter, setFilter] = useState<CatalogFilter>("all");

  const chartData = useMemo(() => {
    return data.map((row) => {
      if (filter === "BAKERY") {
        return { ...row, label: shortDayLabel(row.date), restaurant: 0, total: row.bakery };
      }
      if (filter === "RESTAURANT") {
        return { ...row, label: shortDayLabel(row.date), bakery: 0, total: row.restaurant };
      }
      return { ...row, label: shortDayLabel(row.date) };
    });
  }, [data, filter]);

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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#8B6F47" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#8B6F47" }}
              tickFormatter={(v) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
              }
            />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.date) {
                  return String(payload[0].payload.date);
                }
                return "";
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
      </div>
      <p className="text-xs text-text-2">
        Последние 30 дней, сумма строк заказа (кол-во × цена), без отменённых заказов.
      </p>
    </div>
  );
}
