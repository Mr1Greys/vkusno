import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyLoyaltyQrToken } from "@/lib/loyalty-qr";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Нет данных QR" }, { status: 400 });
  }

  const parsed = await verifyLoyaltyQrToken(token);
  if (!parsed) {
    return NextResponse.json({ error: "Неверный или просроченный QR" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, phone: true, name: true, bonusPoints: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
