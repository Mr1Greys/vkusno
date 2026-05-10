"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusSteps: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Принят" },
  { status: "PREPARING", label: "Готовится" },
  { status: "READY", label: "Готов" },
  { status: "COMPLETED", label: "Выполнен" },
];

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-blue-500",
  PREPARING: "bg-orange-500",
  READY: "bg-green-500",
  DELIVERING: "bg-purple-500",
  COMPLETED: "bg-success",
  CANCELLED: "bg-error",
};

function paymentMethodLabel(method: string | null): string {
  if (!method) return "";
  switch (method) {
    case "cash":
      return "Наличными";
    case "card_on_delivery":
      return "Картой при получении";
    case "card_online":
      return "Картой онлайн";
    case "card":
    case "CARD":
      return "Картой";
    default:
      return method;
  }
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
        <Button onClick={() => router.push("/")}>В меню</Button>
      </div>
    );
  }

  const currentStep = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-display font-bold mb-2">
        Заказ {order.orderNumber}
      </h1>
      <div className="flex items-center gap-2 mb-6">
        <Badge
          variant={
            order.status === "COMPLETED"
              ? "success"
              : order.status === "CANCELLED"
              ? "error"
              : "default"
          }
        >
          {order.status === "PENDING" && "Ожидает"}
          {order.status === "CONFIRMED" && "Подтверждён"}
          {order.status === "PREPARING" && "Готовится"}
          {order.status === "READY" && "Готов"}
          {order.status === "DELIVERING" && "В доставке"}
          {order.status === "COMPLETED" && "Выполнен"}
          {order.status === "CANCELLED" && "Отменён"}
        </Badge>
        <span className="text-text-2 text-sm">
          {new Date(order.createdAt).toLocaleString("ru")}
        </span>
      </div>

      {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
        <div className="bg-surface-1 p-4 rounded-lg border border-border mb-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step.status} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    idx <= currentStep ? statusColors[order.status] : "bg-surface-2"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-1 ${
                      idx < currentStep ? statusColors[order.status] : "bg-surface-2"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-2">
            {statusSteps.map((step) => (
              <span key={step.status}>{step.label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-1 p-4 rounded-lg border border-border mb-4">
        <h2 className="font-semibold mb-3">Состав заказа</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-text-2">
                {item.product?.name || "Товар"} x{item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
          <span>Итого</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="bg-surface-1 p-4 rounded-lg border border-border mb-4">
        <h2 className="font-semibold mb-2">Доставка</h2>
        <p className="text-text-2">
          {order.deliveryType === "PICKUP"
            ? "Самовывоз"
            : `Доставка по адресу: ${order.address}`}
        </p>
        {order.paymentMethod && (
          <p className="text-text-2 mt-1">
            Оплата: {paymentMethodLabel(order.paymentMethod)}
          </p>
        )}
      </div>

      {order.bonusEarned > 0 && (
        <div className="bg-success/10 p-4 rounded-lg border border-success/20 text-center">
          <p className="text-success font-medium">
            Вы заработали {order.bonusEarned} бонусов!
          </p>
        </div>
      )}

      <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/")}>
        Вернуться в меню
      </Button>
    </div>
  );
}