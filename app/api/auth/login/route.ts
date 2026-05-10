import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const DEFAULT_ADMIN_PHONE = process.env.ADMIN_PHONE || "+79990000000";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.passwordHash) {
      if (phone === DEFAULT_ADMIN_PHONE && password === DEFAULT_ADMIN_PASSWORD) {
        const passwordHash = await bcrypt.hash(password, 10);
        user = user
          ? await prisma.user.update({
              where: { phone },
              data: {
                passwordHash,
                role: "ADMIN",
                name: user.name || "Администратор",
              },
            })
          : await prisma.user.create({
              data: {
                phone,
                name: "Администратор",
                role: "ADMIN",
                passwordHash,
              },
            });
      } else {
        return NextResponse.json(
          { error: "Неверный телефон или пароль" },
          { status: 401 }
        );
      }
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      return NextResponse.json(
        { error: "Неверный телефон или пароль" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Неверный телефон или пароль" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
