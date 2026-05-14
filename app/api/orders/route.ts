import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import {
  computeBonusEarned,
  getDeliveryCost,
  KOPEKS_PER_RUBLE,
  maxBonusPointsForSubtotal,
  settingsRowsToMap,
} from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

type LineInput = { productId: string; quantity: number; price: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      deliveryType,
      address,
      guestName,
      guestPhone,
      comment,
      bonusUsed: bonusUsedRaw,
      paymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }

    if (deliveryType !== "DELIVERY" && deliveryType !== "PICKUP") {
      return NextResponse.json({ error: "Некорректный тип доставки" }, { status: 400 });
    }

    if (deliveryType === "DELIVERY" && (!address || String(address).trim() === "")) {
      return NextResponse.json(
        { error: "Укажите адрес доставки" },
        { status: 400 }
      );
    }

    const session = await getSession();

    const settingsRows = await prisma.settings.findMany({});
    const settingsMap = settingsRowsToMap(settingsRows);
    const minOrderRub = parseInt(settingsMap.min_order_amount || "0", 10);

    const productIds = Array.from(
      new Set(items.map((i: LineInput) => i.productId))
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const resolvedLines: { productId: string; quantity: number; price: number }[] = [];

    for (const raw of items as LineInput[]) {
      const qty = Number(raw.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        return NextResponse.json(
          { error: "Некорректное количество товара" },
          { status: 400 }
        );
      }
      const p = productById.get(raw.productId);
      if (!p) {
        return NextResponse.json(
          { error: "Товар не найден" },
          { status: 400 }
        );
      }
      if (!p.isAvailable) {
        return NextResponse.json(
          { error: `Товар «${p.name}» недоступен` },
          { status: 400 }
        );
      }
      if (p.stockQuantity != null && p.stockQuantity < qty) {
        return NextResponse.json(
          { error: `Недостаточно «${p.name}» на складе` },
          { status: 400 }
        );
      }
      const lineTotal = p.price * qty;
      subtotal += lineTotal;
      resolvedLines.push({
        productId: p.id,
        quantity: qty,
        price: p.price,
      });
    }

    if (minOrderRub > 0 && subtotal < minOrderRub * KOPEKS_PER_RUBLE) {
      return NextResponse.json(
        { error: `Минимальная сумма заказа ${minOrderRub}` },
        { status: 400 }
      );
    }

    const deliveryCost = getDeliveryCost(subtotal, deliveryType, settingsMap);

    /** Баллы: 1 б. = 1 ₽ скидки (не копейки). */
    const bonusUsed = Math.max(0, Math.floor(Number(bonusUsedRaw) || 0));
    const bonusUsedKop = bonusUsed * KOPEKS_PER_RUBLE;

    if (!session) {
      if (bonusUsed !== 0) {
        return NextResponse.json(
          { error: "Бонусы доступны после входа в профиль" },
          { status: 400 }
        );
      }
      if (!guestPhone || String(guestPhone).trim().length < 10) {
        return NextResponse.json(
          { error: "Укажите телефон" },
          { status: 400 }
        );
      }
      if (!guestName || String(guestName).trim().length < 2) {
        return NextResponse.json(
          { error: "Укажите имя" },
          { status: 400 }
        );
      }
    } else {
      const cap = Math.min(
        session.bonusPoints,
        maxBonusPointsForSubtotal(subtotal)
      );
      if (bonusUsed > cap) {
        return NextResponse.json(
          { error: "Превышен лимит списания бонусов" },
          { status: 400 }
        );
      }
    }

    const finalAmount = subtotal + deliveryCost - bonusUsedKop;
    if (finalAmount < 0) {
      return NextResponse.json(
        { error: "Сумма к оплате не может быть отрицательной" },
        { status: 400 }
      );
    }

    const bonusEarned = session
      ? computeBonusEarned(finalAmount, settingsMap)
      : 0;

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const line of resolvedLines) {
        const p = productById.get(line.productId);
        if (p && p.stockQuantity != null) {
          const stockUpd = await tx.product.updateMany({
            where: {
              id: line.productId,
              stockQuantity: { gte: line.quantity },
            },
            data: { stockQuantity: { decrement: line.quantity } },
          });
          if (stockUpd.count !== 1) {
            throw new Error("INSUFFICIENT_STOCK");
          }
        }
      }

      if (session?.id && bonusUsed > 0) {
        const fresh = await tx.user.findUnique({
          where: { id: session.id },
          select: { bonusPoints: true },
        });
        if (!fresh || fresh.bonusPoints < bonusUsed) {
          throw new Error("INSUFFICIENT_BONUS");
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.id ?? null,
          guestName: session ? null : String(guestName).trim(),
          guestPhone: session ? null : String(guestPhone).trim(),
          deliveryType,
          address: deliveryType === "DELIVERY" ? String(address).trim() : null,
          totalAmount: finalAmount,
          bonusUsed,
          bonusEarned,
          comment: comment ? String(comment) : null,
          paymentMethod,
          items: {
            create: resolvedLines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              price: line.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      if (session?.id) {
        const netBonus = bonusEarned - bonusUsed;
        await tx.user.update({
          where: { id: session.id },
          data: {
            bonusPoints: { increment: netBonus },
          },
        });

        if (bonusUsed > 0) {
          await tx.bonusHistory.create({
            data: {
              userId: session.id,
              type: "SPENT",
              amount: bonusUsed,
              description: `Списание за заказ ${created.orderNumber}`,
              orderId: created.id,
            },
          });
        }

        if (bonusEarned > 0) {
          await tx.bonusHistory.create({
            data: {
              userId: session.id,
              type: "EARNED",
              amount: bonusEarned,
              description: `Заказ ${created.orderNumber}`,
              orderId: created.id,
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BONUS") {
      return NextResponse.json(
        { error: "Недостаточно бонусов" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Изменилось наличие товара, обновите корзину" },
        { status: 400 }
      );
    }
    console.error("Order create error:", error);
    return NextResponse.json(
      { error: "Ошибка создания заказа" },
      { status: 500 }
    );
  }
}
