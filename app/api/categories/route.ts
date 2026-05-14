import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mergeProductImageUrl } from "@/lib/bakery-product-images";

export const dynamic = "force-dynamic";

/** Публичное меню: активные категории и доступные товары (как витрина). */
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, catalog: "BAKERY" },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const enriched = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    products: cat.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      weight: p.weight,
      imageUrl: mergeProductImageUrl(p.imageUrl, p.name),
      isAvailable: p.isAvailable,
      isHalal: p.isHalal,
      sortOrder: p.sortOrder,
      categoryId: p.categoryId,
      stockQuantity: p.stockQuantity,
    })),
  }));

  return NextResponse.json(enriched);
}
