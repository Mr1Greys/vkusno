import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Удаление карточки товара (только если позиция ни разу не попадала в заказы). */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const id = params.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "Не указан товар" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const inOrders = await prisma.orderItem.count({ where: { productId: id } });
    if (inOrders > 0) {
      return NextResponse.json(
        {
          error:
            "Этот товар уже есть в заказах и не может быть удалён. Снимите «Доступен», чтобы скрыть с витрины, или замените позицию в меню.",
        },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/products DELETE]", e);
    return NextResponse.json(
      { error: "Не удалось удалить товар" },
      { status: 500 }
    );
  }
}
