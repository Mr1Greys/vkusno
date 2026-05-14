import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BonusType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 100;

const BONUS_TYPES: BonusType[] = ["EARNED", "SPENT", "MANUAL", "REFERRAL"];

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
  const typeRaw = searchParams.get("type")?.trim();
  const type: BonusType | undefined =
    typeRaw && BONUS_TYPES.includes(typeRaw as BonusType)
      ? (typeRaw as BonusType)
      : undefined;

  const where: Prisma.BonusHistoryWhereInput = {
    ...(userId ? { userId } : {}),
    ...(type ? { type } : {}),
  };

  const [total, rows] = await prisma.$transaction([
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
  ]);

  return NextResponse.json({
    page,
    pageSize: take,
    total,
    rows,
  });
}
