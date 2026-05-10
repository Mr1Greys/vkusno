import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const rows = await prisma.bonusHistory.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      orderId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(rows);
}
