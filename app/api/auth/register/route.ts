import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  try {
    const { phone, name, email, password } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Телефон обязателен" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 }
      );
    }

    let emailNorm: string | null = null;
    if (typeof email === "string" && email.trim() !== "") {
      const e = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return NextResponse.json(
          { error: "Некорректный email" },
          { status: 400 }
        );
      }
      emailNorm = e;
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        email: emailNorm,
        passwordHash,
      },
    });

    const token = await createToken(user.id, user.role);

    const response = NextResponse.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      bonusPoints: user.bonusPoints,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 500 }
    );
  }
}