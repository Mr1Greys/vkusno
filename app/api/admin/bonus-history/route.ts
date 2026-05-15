import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BonusType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { dayEndMoscow, dayStartMoscow } from "@/lib/admin/date-range";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 100;

const BONUS_TYPES: BonusType[] = ["EARNED", "SPENT", "MANUAL"];

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const take = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Math.floor(Number(searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT))
  );
  const skip = (page - 1) * take;
  const userId = searchParams.get("userId")?.trim() || undefined;
  const orderId = searchParams.get("orderId")?.trim() || undefined;
  const typeRaw = searchParams.get("type")?.trim();
  const type: BonusType | undefined =
    typeRaw && BONUS_TYPES.includes(typeRaw as BonusType)
      ? (typeRaw as BonusType)
      : undefined;

  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  let dateFilter: Prisma.DateTimeFilter | undefined;
  if (dateFrom && dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom) && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    dateFilter = {
      gte: dayStartMoscow(dateFrom),
      lte: dayEndMoscow(dateTo),
    };
  }

  const where: Prisma.BonusHistoryWhereInput = {
    ...(userId ? { userId } : {}),
    ...(orderId ? { orderId } : {}),
    ...(type ? { type } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  const [total, rows, summaryByType] = await prisma.$transaction([
    prisma.bonusHistory.count({ where }),
    prisma.bonusHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        user: { select: { id: true, phone: true, name: true } },
        order: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, phone: true, name: true } },
      },
    }),
    prisma.bonusHistory.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
      orderBy: { type: "asc" },
    }),
  ]);

  return NextResponse.json({
    page,
    pageSize: take,
    total,
    rows,
    summaryByType,
  });
}
