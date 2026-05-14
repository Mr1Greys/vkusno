import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayEndMoscow, dayStartMoscow } from "@/lib/admin/date-range";
import { ORDER_NOT_CANCELLED } from "@/lib/admin/dashboard-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json(
      { error: "Укажите from и to в формате YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const start = dayStartMoscow(from);
  const end = dayEndMoscow(to);
  const orderWhere = {
    ...ORDER_NOT_CANCELLED,
    createdAt: { gte: start, lte: end },
  };

  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: orderWhere },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 15,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  const detailed = await Promise.all(
    rows.map(async (r) => {
      const lines = await prisma.orderItem.findMany({
        where: { productId: r.productId, order: orderWhere },
        select: { quantity: true, price: true },
      });
      const revenue = lines.reduce((s, l) => s + l.quantity * l.price, 0);
      return {
        productId: r.productId,
        name: nameById.get(r.productId) || "—",
        quantity: r._sum.quantity ?? 0,
        revenue,
      };
    })
  );

  detailed.sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({ from, to, rows: detailed });
}
