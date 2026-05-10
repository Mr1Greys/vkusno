import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().max(120).optional(),
  email: z.union([z.string().email().max(320), z.literal("")]).optional(),
  phone: z.string().min(10).max(32).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      phone: true,
      name: true,
      email: true,
      role: true,
      bonusPoints: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные" },
        { status: 400 }
      );
    }

    const { name, email, phone } = parsed.data;

    if (phone !== undefined && phone !== session.phone) {
      const taken = await prisma.user.findUnique({
        where: { phone },
      });
      if (taken && taken.id !== session.id) {
        return NextResponse.json(
          { error: "Этот телефон уже занят" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name !== undefined && {
          name: name.trim() === "" ? null : name.trim(),
        }),
        ...(email !== undefined && {
          email: email === "" ? null : email,
        }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        bonusPoints: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить профиль" },
      { status: 500 }
    );
  }
}
