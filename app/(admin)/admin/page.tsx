import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  resolveRangeFromSearchParams,
  previousPeriodSameLength,
} from "@/lib/admin/date-range";
import {
  getActiveOrders,
  getPeriodOverviewCompare,
  getClientSummary,
  getOutsiderProducts,
  getRangeStats,
  getRevenueByDayCatalog,
  getTopProducts,
} from "@/lib/admin/dashboard-stats";
import { bonusTypeLabel } from "@/lib/bonus-type-labels";
import { DashboardRevenueChart } from "@/components/admin/dashboard/DashboardRevenueChart";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  ShoppingBag,
  Truck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

function pctBadge(pct: number) {
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        up ? "bg-emerald-500/15 text-emerald-800" : "bg-red-500/15 text-red-800"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (typeof v === "string") sp.set(k, v);
  });
  const { from, to, preset } = resolveRangeFromSearchParams(sp);
  const prev = previousPeriodSameLength(from, to);

  const [
    rangeStats,
    periodCompare,
    chartSeries,
    activeOrders,
    tops,
    outsiders,
    clientSum,
    recentOrders,
  ] = await Promise.all([
    getRangeStats(prisma, from, to),
    getPeriodOverviewCompare(prisma, from, to, prev.from, prev.to),
    getRevenueByDayCatalog(prisma),
    getActiveOrders(prisma, 18),
    getTopProducts(prisma, from, to, 10),
    getOutsiderProducts(prisma, from, to, 8),
    getClientSummary(prisma),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true },
    }),
  ]);

  const maxQty = Math.max(1, ...tops.topByQty.map((r) => r.quantity));
  const maxRev = Math.max(1, ...tops.topByRevenue.map((r) => r.revenue));

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500",
    CONFIRMED: "bg-blue-500",
    PREPARING: "bg-orange-500",
    READY: "bg-emerald-600",
    DELIVERING: "bg-teal-600",
    COMPLETED: "bg-success",
    CANCELLED: "bg-error",
  };

  const presetLink = (p: string) => {
    const q = p === "custom" ? `?from=${from}&to=${to}` : `?preset=${p}`;
    return `/admin${q}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text md:text-3xl">
            Дашборд
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Период: {from} — {to}
            {preset !== "custom" ? ` · пресет «${preset}»` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["today", "Сегодня"],
              ["week", "7 дней"],
              ["month", "Месяц"],
            ] as const
          ).map(([p, label]) => (
            <Link
              key={p}
              href={presetLink(p)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                preset === p
                  ? "border-brand bg-brand text-white shadow-sm"
                  : "border-border bg-surface-1 text-text hover:bg-surface-2"
              )}
            >
              {label}
            </Link>
          ))}
          <form className="flex flex-wrap items-center gap-2 text-sm" action="/admin" method="get">
            <label className="sr-only" htmlFor="dash-from">
              С даты
            </label>
            <input
              id="dash-from"
              name="from"
              type="date"
              defaultValue={from}
              className="rounded-lg border border-border bg-surface-1 px-2 py-1.5"
            />
            <span className="text-text-2">—</span>
            <label className="sr-only" htmlFor="dash-to">
              По дату
            </label>
            <input
              id="dash-to"
              name="to"
              type="date"
              defaultValue={to}
              className="rounded-lg border border-border bg-surface-1 px-2 py-1.5"
            />
            <button
              type="submit"
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 font-medium hover:bg-border"
            >
              OK
            </button>
          </form>
        </div>
      </div>

      {/* KPI за период + балансы бонусов — один ряд на xl, компактнее */}
      <section className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-border/90 bg-surface-1 p-3 shadow-sm sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium leading-tight text-text-2 sm:text-xs">
              Выручка
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-9 sm:w-9">
              <Wallet className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </span>
          </div>
          <p className="mt-2 flex min-h-[1.75rem] flex-wrap items-baseline text-base font-bold tabular-nums tracking-tight text-text sm:text-lg xl:text-[1.15rem] 2xl:text-xl">
            {formatPrice(rangeStats.revenue)}
            {pctBadge(periodCompare.revenuePct)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-text-2 sm:text-[11px]">
            за выбранный период · к прошлому такому же
          </p>
        </div>
        <div className="rounded-xl border border-border/90 bg-surface-1 p-3 shadow-sm sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium leading-tight text-text-2 sm:text-xs">
              Заказов
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-9 sm:w-9">
              <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </span>
          </div>
          <p className="mt-2 flex min-h-[1.75rem] flex-wrap items-baseline text-base font-bold tabular-nums tracking-tight text-text sm:text-lg xl:text-[1.15rem] 2xl:text-xl">
            {rangeStats.orderCount.toLocaleString("ru-RU")}
            {pctBadge(periodCompare.ordersPct)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-text-2 sm:text-[11px]">
            без отмен · к прошлому периоду
          </p>
        </div>
        <div className="rounded-xl border border-border/90 bg-surface-1 p-3 shadow-sm sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium leading-tight text-text-2 sm:text-xs">
              Средний чек
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-9 sm:w-9">
              <CircleDollarSign className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </span>
          </div>
          <p className="mt-2 flex min-h-[1.75rem] flex-wrap items-baseline text-base font-bold tabular-nums tracking-tight text-text sm:text-lg xl:text-[1.15rem] 2xl:text-xl">
            {formatPrice(Math.round(rangeStats.avgCheck))}
            {Number.isFinite(periodCompare.avgDeltaPct) && periodCompare.avgDeltaPct !== 0
              ? pctBadge(Math.round(periodCompare.avgDeltaPct))
              : null}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-text-2 sm:text-[11px]">
            к прошлому такому же интервалу
          </p>
        </div>
        <div className="rounded-xl border border-border/90 bg-surface-1 p-3 shadow-sm sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium leading-tight text-text-2 sm:text-xs">
              Новых клиентов
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-9 sm:w-9">
              <UserPlus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </span>
          </div>
          <p className="mt-2 flex min-h-[1.75rem] flex-wrap items-baseline text-base font-bold tabular-nums tracking-tight text-text sm:text-lg xl:text-[1.15rem] 2xl:text-xl">
            {periodCompare.newUsersInRange.toLocaleString("ru-RU")}
            {pctBadge(periodCompare.newUsersPct)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-text-2 sm:text-[11px]">
            регистрации за период · к прошлому
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-border/90 bg-surface-1 p-3 shadow-sm sm:p-3.5 md:col-span-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium leading-tight text-text-2 sm:text-xs">
              Балансы бонусов
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-9 sm:w-9">
              <Users className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </span>
          </div>
          <p className="mt-2 min-h-[1.75rem] text-base font-bold tabular-nums tracking-tight text-text sm:text-lg xl:text-[1.15rem] 2xl:text-xl">
            {rangeStats.bonusPointsLiability.toLocaleString("ru-RU")}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-text-2 sm:text-[11px]">
            Σ bonusPoints по клиентам
          </p>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Блок 2 — график */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:col-span-2 lg:p-5">
          <h2 className="font-display text-lg font-bold text-text">
            Выручка по дням (30 дней)
          </h2>
          <DashboardRevenueChart data={chartSeries} />
        </div>

        {/* Блок 3 — активные */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-text">Активные заказы</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-brand hover:underline"
            >
              Все
            </Link>
          </div>
          <ul className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1 text-sm">
            {activeOrders.length === 0 ? (
              <li className="text-text-2">Нет активных заказов</li>
            ) : (
              activeOrders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-border/80 bg-surface-2/50 px-3 py-2"
                >
                  <div className="flex justify-between gap-2 font-medium">
                    <span>{o.orderNumber}</span>
                    <span className="tabular-nums text-text-2">
                      {o.waitMinutes < 60
                        ? `${o.waitMinutes} мин`
                        : `${Math.floor(o.waitMinutes / 60)} ч`}
                    </span>
                  </div>
                  <p className="text-xs text-text-2">
                    {o.userName || o.guestName || o.guestPhone || "Гость"} ·{" "}
                    {o.deliveryType === "DELIVERY" ? "Доставка" : "Самовывоз"}
                  </p>
                  <p className="text-xs font-medium text-brand">{o.stageLabel}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Блок 4 — топы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
          <h2 className="font-display text-lg font-bold text-text">Топ-10 по штукам</h2>
          <ul className="mt-3 space-y-3">
            {tops.topByQty.map((r, i) => (
              <li key={r.productId} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-text-2">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="shrink-0 tabular-nums text-text-2">{r.quantity} шт.</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-brand/80"
                      style={{ width: `${(r.quantity / maxQty) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs tabular-nums text-text-2">
                    {formatPrice(r.revenue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
          <h2 className="font-display text-lg font-bold text-text">Топ-10 по выручке</h2>
          <ul className="mt-3 space-y-3">
            {tops.topByRevenue.map((r, i) => (
              <li key={r.productId} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-text-2">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatPrice(r.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent/90"
                      style={{ width: `${(r.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs text-text-2">{r.quantity} шт.</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
        <h2 className="font-display text-lg font-bold text-text">
          Не продавались в период (витрина)
        </h2>
        <p className="mt-1 text-xs text-text-2">
          Активные в каталоге, без строк в неотменённых заказах за выбранные даты.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {outsiders.length === 0 ? (
            <li className="text-sm text-text-2">Все позиции имели продажи или список пуст</li>
          ) : (
            outsiders.map((p) => (
              <li
                key={p.id}
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs"
              >
                {p.name}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Блок 5–6 клиенты + бонусы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
          <h2 className="font-display text-lg font-bold text-text">Клиенты</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2 border-b border-border/60 py-2">
              <dt className="text-text-2">Всего в базе</dt>
              <dd className="font-semibold tabular-nums">{clientSum.totalUsers}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border/60 py-2">
              <dt className="text-text-2">LTV (средняя выручка с покупателя)</dt>
              <dd className="font-semibold tabular-nums">
                {formatPrice(Math.round(clientSum.ltvAmongBuyers))}
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border/60 py-2">
              <dt className="text-text-2">Повторные покупатели</dt>
              <dd className="font-semibold tabular-nums">{clientSum.repeatOrderPct}%</dd>
            </div>
            <div className="flex justify-between gap-2 py-2">
              <dt className="text-text-2">«Спят» (&gt;30 дней без заказа)</dt>
              <dd className="font-semibold tabular-nums">{clientSum.sleepingBuyers}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-text-2">
            LTV считается только по пользователям с хотя бы одним неотменённым заказом.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
          <h2 className="font-display text-lg font-bold text-text">Бонусы за период</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {rangeStats.bonusByType.map((b) => (
              <li key={b.type} className="flex justify-between gap-2 border-b border-border/60 py-1">
                <span>{bonusTypeLabel(b.type)}</span>
                <span className="tabular-nums font-medium">
                  {(b._sum.amount ?? 0) >= 0 ? "+" : ""}
                  {(b._sum.amount ?? 0).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            Заказов с оплатой бонусами:{" "}
            <span className="font-bold">{rangeStats.bonusOrdersPct}%</span>
          </p>
        </div>
      </div>

      {/* Оплаты */}
      <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm lg:p-5">
        <h2 className="font-display text-lg font-bold text-text">Способы оплаты (период)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {rangeStats.paymentRows.map((p) => (
            <span
              key={p.paymentMethod ?? "null"}
              className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs"
            >
              {p.paymentMethod || "Не указано"} — {p._count}
            </span>
          ))}
        </div>
      </div>

      {/* Блок 7 + внешняя доставка */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border bg-surface-2/40 p-4">
          <h3 className="font-semibold text-text">Брошенные корзины</h3>
          <p className="mt-2 text-sm text-text-2">
            На сервере нет сохранённой корзины — метрика появится после внедрения учёта
            (корзина в БД или события аналитики).
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface-2/40 p-4">
          <h3 className="font-semibold text-text">Внешняя доставка</h3>
          <p className="mt-2 text-sm text-text-2">
            Интеграция не подключена. В схеме есть поля iiko; для Яндекса можно добавить
            отдельное поле заказа позже.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-2/30 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-2">
          <Truck className="h-4 w-4" aria-hidden />
          <span>
            Доставка за период: {formatPrice(rangeStats.delivery.deliverySum)} · Самовывоз:{" "}
            {formatPrice(rangeStats.delivery.pickupSum)}
          </span>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-text md:text-xl">
          Последние заказы
        </h2>
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-surface-2">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Заказ</th>
                  <th className="p-3 text-left text-sm font-medium">Клиент</th>
                  <th className="p-3 text-left text-sm font-medium">Сумма</th>
                  <th className="p-3 text-left text-sm font-medium">Статус</th>
                  <th className="p-3 text-left text-sm font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="p-3 text-sm">{order.orderNumber}</td>
                    <td className="p-3 text-sm">
                      {order.user?.name || order.guestName || order.guestPhone || "Гость"}
                    </td>
                    <td className="p-3 text-sm font-medium">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-3">
                      <Badge className={`${statusColors[order.status]} text-white`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-text-2">
                      {new Date(order.createdAt).toLocaleDateString("ru")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
