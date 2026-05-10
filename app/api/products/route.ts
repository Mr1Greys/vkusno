import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mergeProductImageUrl } from "@/lib/bakery-product-images";

export const dynamic = "force-dynamic";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(category && { category: { slug: category } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const enriched = products.map((p) => ({
    ...p,
    imageUrl: mergeProductImageUrl(p.imageUrl, p.name),
  }));

  return NextResponse.json(enriched);
}