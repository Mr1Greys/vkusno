import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const phone = new URL(request.url).searchParams.get("phone")?.trim();
  if (!phone) {
    return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true, phone: true, name: true, bonusPoints: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Не найден" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
