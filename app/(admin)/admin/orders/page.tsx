"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Заказы</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-surface-1 p-4 rounded-lg border border-border"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-text-2 text-sm">
                  {order.user?.name || order.guestName || order.guestPhone || "Гость"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="bg-surface-2 border border-border rounded px-2 py-1 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-text-2 mb-2">
              {order.items.map((item) => (
                <span key={item.id}>
                  {item.product?.name || "Товар"} x{item.quantity},{" "}
                </span>
              ))}
            </div>

            {order.deliveryType === "DELIVERY" && order.address && (
              <p className="text-sm text-text-2">Адрес: {order.address}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}