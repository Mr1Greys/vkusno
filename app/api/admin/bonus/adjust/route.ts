import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function buildDescription(
  source: string,
  reason: string,
  adminPhone: string
): string {
  const parts = [
    source === "QR" ? "Начисление по QR" : "Ручная операция",
    reason ? `— ${reason}` : "",
    `(админ ${adminPhone})`,
  ];
  return parts.filter(Boolean).join(" ");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const delta = Math.trunc(Number(body.delta));
  if (!Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "Укажите ненулевое целое число баллов" }, { status: 400 });
  }

  let userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!userId && phoneRaw) {
    const byPhone = await prisma.user.findUnique({
      where: { phone: phoneRaw },
      select: { id: true },
    });
    userId = byPhone?.id ?? "";
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Укажите пользователя (id или телефон)" },
      { status: 400 }
    );
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  const source = body.source === "QR" ? "QR" : "MANUAL";

  try {
    await prisma.$transaction(async (tx) => {
      if (delta > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { bonusPoints: { increment: delta } },
        });
        await tx.bonusHistory.create({
          data: {
            userId,
            type: "MANUAL",
            amount: delta,
            description: buildDescription(source, reason, session.phone),
            createdByUserId: session.id,
          },
        });
        return;
      }

      const abs = -delta;
      const cur = await tx.user.findUnique({
        where: { id: userId },
        select: { bonusPoints: true },
      });
      if (!cur || cur.bonusPoints < abs) {
        throw new Error("INSUFFICIENT_BONUS");
      }

      await tx.user.update({
        where: { id: userId },
        data: { bonusPoints: { decrement: abs } },
      });

      await tx.bonusHistory.create({
        data: {
          userId,
          type: "SPENT",
          amount: abs,
          orderId: null,
          description: buildDescription(source, reason, session.phone),
          createdByUserId: session.id,
        },
      });
    });

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, bonusPoints: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BONUS") {
      return NextResponse.json(
        { error: "Недостаточно бонусов на счёте клиента" },
        { status: 400 }
      );
    }
    console.error("bonus adjust:", e);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}
