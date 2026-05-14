import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { mergeProductImageUrl } from "@/lib/bakery-product-images";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    });

    const enriched = products.map((p) => ({
      ...p,
      imageUrl:
        p.category?.catalog === "BAKERY"
          ? mergeProductImageUrl(p.imageUrl, p.name)
          : (p.imageUrl ?? null),
    }));

    return NextResponse.json(enriched);
  } catch (e) {
    console.error("[admin/products GET]", e);
    const details =
      process.env.NODE_ENV === "development"
        ? e instanceof Error
          ? e.message
          : String(e)
        : undefined;
    return NextResponse.json(
      {
        error: "Ошибка при загрузке товаров",
        ...(details ? { details } : {}),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const data = await request.json();

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Категория не найдена" }, { status: 400 });
  }

  const stockQuantity =
    data.stockQuantity === undefined || data.stockQuantity === ""
      ? null
      : Math.max(0, Math.floor(Number(data.stockQuantity)));

  const price = Math.max(0, Math.floor(Number(data.price)));
  if (!Number.isFinite(price)) {
    return NextResponse.json({ error: "Некорректная цена" }, { status: 400 });
  }

  const description =
    typeof data.description === "string" && data.description.trim()
      ? data.description.trim()
      : null;

  const weight =
    typeof data.weight === "string" && data.weight.trim()
      ? data.weight.trim()
      : null;

  const product = await prisma.product.create({
    data: {
      name: String(data.name ?? "").trim() || "Без названия",
      description,
      price,
      weight,
      imageUrl: data.imageUrl ?? null,
      isHalal: data.isHalal || false,
      isAvailable: data.isAvailable ?? true,
      categoryId: data.categoryId,
      stockQuantity,
    },
  });

  return NextResponse.json(product);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const data = await request.json();

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Категория не найдена" }, { status: 400 });
  }

  const stockQuantity =
    data.stockQuantity === undefined || data.stockQuantity === ""
      ? null
      : Math.max(0, Math.floor(Number(data.stockQuantity)));

  const price = Math.max(0, Math.floor(Number(data.price)));
  if (!Number.isFinite(price)) {
    return NextResponse.json({ error: "Некорректная цена" }, { status: 400 });
  }

  const description =
    typeof data.description === "string" && data.description.trim()
      ? data.description.trim()
      : null;

  const weight =
    typeof data.weight === "string" && data.weight.trim()
      ? data.weight.trim()
      : null;

  const product = await prisma.product.update({
    where: { id: data.id },
    data: {
      name: String(data.name ?? "").trim() || "Без названия",
      description,
      price,
      weight,
      imageUrl: data.imageUrl ?? null,
      isHalal: data.isHalal,
      isAvailable: data.isAvailable,
      categoryId: data.categoryId,
      stockQuantity,
    },
  });

  return NextResponse.json(product);
}