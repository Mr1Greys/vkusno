import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Все категории для админки (в т.ч. пустые и неактивные — для привязки товара). */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        isActive: true,
        catalog: true,
        description: true,
      },
    });

    return NextResponse.json(categories);
  } catch (e) {
    console.error("[admin/categories]", e);
    const details =
      process.env.NODE_ENV === "development"
        ? e instanceof Error
          ? e.message
          : String(e)
        : undefined;
    return NextResponse.json(
      {
        error: "Ошибка при загрузке категорий",
        ...(details ? { details } : {}),
      },
      { status: 500 }
    );
  }
}
