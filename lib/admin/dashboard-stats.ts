import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import {
  addDaysIsoMoscow,
  dayEndMoscow,
  dayStartMoscow,
  todayIsoMoscow,
} from "@/lib/admin/date-range";

export const ORDER_NOT_CANCELLED = {
  status: { not: "CANCELLED" as const },
};

export type RevenueChartPoint = {
  date: string;
  bakery: number;
  restaurant: number;
  total: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type ActiveOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  deliveryType: string;
  createdAt: Date;
  totalAmount: number;
  guestName: string | null;
  guestPhone: string | null;
  userName: string | null;
  userPhone: string | null;
  waitMinutes: number;
  stageLabel: string;
};

function activeStageLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Новый";
    case "CONFIRMED":
    case "PREPARING":
      return "Готовится";
    case "READY":
    case "DELIVERING":
      return "Готов / в пути";
    default:
      return status;
  }
}

/** KPI: выручка за календарные окна (МСК-границы). */
export async function getRevenueKpiTriplet(prisma: PrismaClient) {
  const today = todayIsoMoscow();
  const weekFrom = addDaysIsoMoscow(today, -6);
  const monthFrom = `${today.slice(0, 7)}-01`;

  const [todaySum, weekSum, monthSum] = await Promise.all([
    prisma.order.aggregate({
      where: {
        ...ORDER_NOT_CANCELLED,
        createdAt: { gte: dayStartMoscow(today), lte: dayEndMoscow(today) },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        ...ORDER_NOT_CANCELLED,
        createdAt: { gte: dayStartMoscow(weekFrom), lte: dayEndMoscow(today) },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        ...ORDER_NOT_CANCELLED,
        createdAt: { gte: dayStartMoscow(monthFrom), lte: dayEndMoscow(today) },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
  ]);

  return {
    todayRevenue: todaySum._sum.totalAmount ?? 0,
    todayOrders: todaySum._count,
    week7Revenue: weekSum._sum.totalAmount ?? 0,
    week7Orders: weekSum._count,
    monthRevenue: monthSum._sum.totalAmount ?? 0,
    monthOrders: monthSum._count,
  };
}

/** Глобальная выручка (всё время), без отмен. */
export async function getLifetimeRevenue(prisma: PrismaClient) {
  const a = await prisma.order.aggregate({
    where: ORDER_NOT_CANCELLED,
    _sum: { totalAmount: true },
    _count: true,
  });
  return { revenue: a._sum.totalAmount ?? 0, orders: a._count };
}

export async function getRangeStats(
  prisma: PrismaClient,
  fromIso: string,
  toIso: string
) {
  const start = dayStartMoscow(fromIso);
  const end = dayEndMoscow(toIso);

  const baseWhere = {
    ...ORDER_NOT_CANCELLED,
    createdAt: { gte: start, lte: end },
  };

  const [
    agg,
    deliverySplit,
    bonusByType,
    ordersWithBonus,
    totalOrdersInRange,
    newUsersToday,
    bonusPointsSum,
    paymentRows,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: baseWhere,
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["deliveryType"],
      where: baseWhere,
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.bonusHistory.groupBy({
      by: ["type"],
      where: { createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.order.count({
      where: { ...baseWhere, bonusUsed: { gt: 0 } },
    }),
    prisma.order.count({ where: baseWhere }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: dayStartMoscow(todayIsoMoscow()),
          lte: dayEndMoscow(todayIsoMoscow()),
        },
      },
    }),
    prisma.user.aggregate({ _sum: { bonusPoints: true } }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: baseWhere,
      _count: true,
    }),
  ]);

  const revenue = agg._sum.totalAmount ?? 0;
  const orderCount = agg._count;
  const avgCheck =
    orderCount > 0 ? Math.round((revenue / orderCount) * 100) / 100 : 0;

  const delivery = {
    deliveryCount: 0,
    deliverySum: 0,
    pickupCount: 0,
    pickupSum: 0,
  };
  for (const row of deliverySplit) {
    if (row.deliveryType === "DELIVERY") {
      delivery.deliveryCount = row._count;
      delivery.deliverySum = row._sum.totalAmount ?? 0;
    } else {
      delivery.pickupCount = row._count;
      delivery.pickupSum = row._sum.totalAmount ?? 0;
    }
  }

  return {
    revenue,
    orderCount,
    avgCheck,
    delivery,
    bonusByType,
    ordersWithBonus,
    totalOrdersInRange,
    bonusOrdersPct:
      totalOrdersInRange > 0
        ? Math.round((1000 * ordersWithBonus) / totalOrdersInRange) / 10
        : 0,
    newUsersToday,
    bonusPointsLiability: bonusPointsSum._sum.bonusPoints ?? 0,
    paymentRows,
  };
}

/** Сравнение текущего диапазона дат с предыдущим таким же по длине: KPI и % к прошлому периоду. */
export async function getPeriodOverviewCompare(
  prisma: PrismaClient,
  fromIso: string,
  toIso: string,
  prevFromIso: string,
  prevToIso: string
) {
  const curStart = dayStartMoscow(fromIso);
  const curEnd = dayEndMoscow(toIso);
  const prevStart = dayStartMoscow(prevFromIso);
  const prevEnd = dayEndMoscow(prevToIso);

  const [cur, prev, newCur, newPrev] = await Promise.all([
    prisma.order.aggregate({
      where: {
        ...ORDER_NOT_CANCELLED,
        createdAt: { gte: curStart, lte: curEnd },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        ...ORDER_NOT_CANCELLED,
        createdAt: { gte: prevStart, lte: prevEnd },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.user.count({
      where: { createdAt: { gte: curStart, lte: curEnd } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: prevStart, lte: prevEnd } },
    }),
  ]);

  const revC = cur._sum.totalAmount ?? 0;
  const revP = prev._sum.totalAmount ?? 0;
  const cntC = cur._count;
  const cntP = prev._count;

  const curAvg = cntC > 0 ? revC / cntC : 0;
  const prevAvg = cntP > 0 ? revP / cntP : 0;
  let avgDeltaPct = 0;
  if (prevAvg === 0) avgDeltaPct = curAvg > 0 ? 100 : 0;
  else {
    const raw = ((curAvg - prevAvg) / prevAvg) * 100;
    avgDeltaPct = Number.isFinite(raw) ? Math.round(raw * 10) / 10 : 0;
  }

  const pct = (a: number, b: number) => {
    if (b === 0) return a > 0 ? 100 : 0;
    return Math.round((100 * (a - b)) / b);
  };

  return {
    avgDeltaPct,
    revenuePct: pct(revC, revP),
    ordersPct: pct(cntC, cntP),
    newUsersPct: pct(newCur, newPrev),
    newUsersInRange: newCur,
  };
}

/** Последние 30 календарных дней по Москве: выручка строк по каталогу. */
export async function getRevenueByDayCatalog(
  prisma: PrismaClient
): Promise<RevenueChartPoint[]> {
  const today = todayIsoMoscow();
  const from = addDaysIsoMoscow(today, -29);
  const start = dayStartMoscow(from);
  const end = dayEndMoscow(today);

  const rows = await prisma.$queryRaw<
    Array<{ d: Date; catalog: string; revenue: bigint }>
  >(Prisma.sql`
    SELECT
      ((o."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Moscow')::date AS d,
      c.catalog::text AS catalog,
      SUM(oi.quantity * oi.price)::bigint AS revenue
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o.id
    INNER JOIN "Product" p ON oi."productId" = p.id
    INNER JOIN "Category" c ON p."categoryId" = c.id
    WHERE o.status <> 'CANCELLED'::"OrderStatus"
      AND o."createdAt" >= ${start}
      AND o."createdAt" <= ${end}
    GROUP BY 1, 2
    ORDER BY 1 ASC
  `);

  const byDay = new Map<string, { bakery: number; restaurant: number }>();
  for (let i = 0; i < 30; i++) {
    const iso = addDaysIsoMoscow(from, i);
    byDay.set(iso, { bakery: 0, restaurant: 0 });
  }
  for (const r of rows) {
    const iso = r.d.toISOString().slice(0, 10);
    const cur = byDay.get(iso) ?? { bakery: 0, restaurant: 0 };
    const v = Number(r.revenue);
    if (r.catalog === "BAKERY") cur.bakery += v;
    else if (r.catalog === "RESTAURANT") cur.restaurant += v;
    byDay.set(iso, cur);
  }

  const points: RevenueChartPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const iso = addDaysIsoMoscow(from, i);
    const { bakery, restaurant } = byDay.get(iso) ?? {
      bakery: 0,
      restaurant: 0,
    };
    points.push({
      date: iso,
      bakery,
      restaurant,
      total: bakery + restaurant,
    });
  }
  return points;
}

/** Активные заказы (не завершены и не отменены). */
export async function getActiveOrders(prisma: PrismaClient, take = 18) {
  const now = Date.now();
  const list = await prisma.order.findMany({
    where: {
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    orderBy: { createdAt: "asc" },
    take,
    include: { user: { select: { name: true, phone: true } } },
  });

  return list.map((o): ActiveOrderRow => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    deliveryType: o.deliveryType,
    createdAt: o.createdAt,
    totalAmount: o.totalAmount,
    guestName: o.guestName,
    guestPhone: o.guestPhone,
    userName: o.user?.name ?? null,
    userPhone: o.user?.phone ?? null,
    waitMinutes: Math.max(0, Math.floor((now - o.createdAt.getTime()) / 60000)),
    stageLabel: activeStageLabel(o.status),
  }));
}

async function attachProductNames(
  prisma: PrismaClient,
  rows: Array<{ productId: string; quantity: bigint | number; revenue: bigint | number }>
): Promise<TopProductRow[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));
  return rows.map((r) => ({
    productId: r.productId,
    name: nameById.get(r.productId) || "—",
    quantity: Number(r.quantity),
    revenue: Number(r.revenue),
  }));
}

export async function getTopProducts(
  prisma: PrismaClient,
  fromIso: string,
  toIso: string,
  take = 10
) {
  const start = dayStartMoscow(fromIso);
  const end = dayEndMoscow(toIso);

  const [byQty, byRev] = await Promise.all([
    prisma.$queryRaw<
      Array<{ productId: string; quantity: bigint; revenue: bigint }>
    >(Prisma.sql`
      SELECT oi."productId",
        SUM(oi.quantity)::bigint AS quantity,
        SUM(oi.quantity * oi.price)::bigint AS revenue
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status <> 'CANCELLED'::"OrderStatus"
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
      GROUP BY oi."productId"
      ORDER BY quantity DESC
      LIMIT ${take}
    `),
    prisma.$queryRaw<
      Array<{ productId: string; quantity: bigint; revenue: bigint }>
    >(Prisma.sql`
      SELECT oi."productId",
        SUM(oi.quantity)::bigint AS quantity,
        SUM(oi.quantity * oi.price)::bigint AS revenue
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status <> 'CANCELLED'::"OrderStatus"
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
      GROUP BY oi."productId"
      ORDER BY revenue DESC
      LIMIT ${take}
    `),
  ]);

  const [topByQty, topByRevenue] = await Promise.all([
    attachProductNames(prisma, byQty),
    attachProductNames(prisma, byRev),
  ]);

  return { topByQty, topByRevenue };
}

/** Товары в меню без продаж в периоде (кандидаты на снятие). */
export async function getOutsiderProducts(
  prisma: PrismaClient,
  fromIso: string,
  toIso: string,
  take = 10
) {
  const start = dayStartMoscow(fromIso);
  const end = dayEndMoscow(toIso);

  const sold = await prisma.$queryRaw<Array<{ productId: string }>>(
    Prisma.sql`
    SELECT DISTINCT oi."productId"
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o.id
    WHERE o.status <> 'CANCELLED'::"OrderStatus"
      AND o."createdAt" >= ${start}
      AND o."createdAt" <= ${end}
  `
  );
  const soldIds = sold.map((s) => s.productId);

  return prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(soldIds.length > 0 ? { id: { notIn: soldIds } } : {}),
    },
    take,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export type ClientSummary = {
  totalUsers: number;
  ltvAmongBuyers: number;
  repeatOrderPct: number;
  sleepingBuyers: number;
};

export async function getClientSummary(prisma: PrismaClient): Promise<ClientSummary> {
  const totalUsers = await prisma.user.count();

  const buyerStats = await prisma.$queryRaw<
    Array<{ userId: string; order_count: bigint; revenue: bigint }>
  >(Prisma.sql`
    SELECT o."userId" AS "userId",
      COUNT(*)::bigint AS order_count,
      SUM(o."totalAmount")::bigint AS revenue
    FROM "Order" o
    WHERE o."userId" IS NOT NULL
      AND o.status <> 'CANCELLED'::"OrderStatus"
    GROUP BY o."userId"
  `);

  const buyers = buyerStats.length;
  const totalRev = buyerStats.reduce((s, r) => s + Number(r.revenue), 0);
  const ltvAmongBuyers =
    buyers > 0 ? Math.round((totalRev / buyers) * 100) / 100 : 0;

  const repeatBuyers = buyerStats.filter((r) => Number(r.order_count) > 1).length;
  const repeatOrderPct =
    buyers > 0 ? Math.round((1000 * repeatBuyers) / buyers) / 10 : 0;

  const lastOrderRows = await prisma.$queryRaw<
    Array<{ userId: string; last_at: Date }>
  >(Prisma.sql`
    SELECT o."userId" AS "userId", MAX(o."createdAt") AS last_at
    FROM "Order" o
    WHERE o."userId" IS NOT NULL
      AND o.status <> 'CANCELLED'::"OrderStatus"
    GROUP BY o."userId"
  `);

  const sleepThreshold = new Date(Date.now() - 30 * 86400000);
  const sleepingBuyersCount = lastOrderRows.filter(
    (r) => r.last_at < sleepThreshold
  ).length;

  return {
    totalUsers,
    ltvAmongBuyers,
    repeatOrderPct,
    sleepingBuyers: sleepingBuyersCount,
  };
}
