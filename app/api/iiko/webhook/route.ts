import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { iikoStatusToOrderStatus } from "@/lib/iiko/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.eventType === "DeliveryOrderStatusChanged") {
      const iikoStatus = body.orderInfo?.deliveryStatus;
      const iikoOrderId = body.orderInfo?.id;

      if (!iikoOrderId) {
        return NextResponse.json({ error: "No order ID" }, { status: 400 });
      }

      const ourStatus = iikoStatus ? iikoStatusToOrderStatus[iikoStatus] : null;

      if (ourStatus) {
        await prisma.order.updateMany({
          where: { iikoOrderId },
          data: {
            status: ourStatus as any,
            iikoOrderStatus: iikoStatus,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[iiko webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}