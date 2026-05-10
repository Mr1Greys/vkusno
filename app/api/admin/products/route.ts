import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { mergeProductImageUrl } from "@/lib/bakery-product-images";

export const dynamic = "force-dynamic";


export async function GET() {
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
    imageUrl: mergeProductImageUrl(p.imageUrl, p.name),
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const data = await request.json();

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      weight: data.weight,
      imageUrl: data.imageUrl,
      isHalal: data.isHalal || false,
      isAvailable: data.isAvailable ?? true,
      categoryId: data.categoryId,
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

  const product = await prisma.product.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      weight: data.weight,
      imageUrl: data.imageUrl,
      isHalal: data.isHalal,
      isAvailable: data.isAvailable,
      categoryId: data.categoryId,
    },
  });

  return NextResponse.json(product);
}