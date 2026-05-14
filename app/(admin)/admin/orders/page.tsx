"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabel } from "@/lib/admin/order-status-labels";
import { Gift, ChevronDown, ChevronUp } from "lucide-react";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

const statusBadgeClass: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  PREPARING: "bg-orange-500",
  READY: "bg-emerald-600",
  DELIVERING: "bg-teal-600",
  COMPLETED: "bg-success",
  CANCELLED: "bg-error",
};

function deliveryLabel(t: Order["deliveryType"]) {
  return t === "DELIVERY" ? "Доставка" : "Самовывоз";
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>(
    {}
  );
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight")?.trim() ?? "";
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!highlight || !highlightedRef.current) return;
    highlightedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlight, orders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  const isHighlighted = useMemo(() => {
    return (o: Order) =>
      Boolean(
        highlight &&
          (o.id === highlight ||
            o.orderNumber === highlight ||
            decodeURIComponent(highlight) === o.orderNumber)
      );
  }, [highlight]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-surface-2" />
        <div className="h-32 rounded-xl border border-border bg-surface-1" />
        <div className="h-32 rounded-xl border border-border bg-surface-1" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text md:text-3xl">
          Заказы
        </h1>
        <p className="mt-1 text-sm text-text-2">
          Полная информация по заказу, смена статуса, переход к бонусам по заказу.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const hl = isHighlighted(order);
          const comment = order.comment?.trim();
          const expanded = expandedComments[order.id];
          return (
            <div
              key={order.id}
              id={`order-${order.id}`}
              ref={hl ? highlightedRef : undefined}
              className={cn(
                "overflow-hidden rounded-xl border bg-surface-1 p-4 shadow-sm transition-shadow sm:p-5",
                hl
                  ? "border-brand ring-2 ring-brand/25 ring-offset-2 ring-offset-background"
                  : "border-border"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text">{order.orderNumber}</p>
                    <Badge
                      className={cn(
                        "text-xs text-white",
                        statusBadgeClass[order.status]
                      )}
                    >
                      {orderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-2">
                    {order.user?.name || order.guestName || order.guestPhone || "Гость"}
                    {order.user?.phone ? ` · ${order.user.phone}` : null}
                  </p>
                  <p className="text-xs text-text-2">
                    {new Date(order.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {deliveryLabel(order.deliveryType)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <span className="text-lg font-bold tabular-nums text-text">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value as OrderStatus)
                    }
                    className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm"
                    aria-label="Статус заказа"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-2">
                    Бонусы
                  </p>
                  <p className="mt-0.5 tabular-nums text-text">
                    Списано: {order.bonusUsed} · Начислено: {order.bonusEarned}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-2">
                    Оплата
                  </p>
                  <p className="mt-0.5 text-text">
                    {order.paymentMethod || "—"}
                    {order.paymentTypeName ? ` · ${order.paymentTypeName}` : ""}
                  </p>
                </div>
                {order.deliveryType === "DELIVERY" ? (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-2">
                      Адрес доставки
                    </p>
                    <p className="mt-0.5 text-text">{order.address || "—"}</p>
                  </div>
                ) : null}
              </div>

              {comment ? (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-2">
                    Комментарий
                  </p>
                  <p
                    className={cn(
                      "mt-1 whitespace-pre-wrap text-sm text-text",
                      !expanded && "line-clamp-2"
                    )}
                  >
                    {comment}
                  </p>
                  {comment.length > 120 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-8 gap-1 px-0 text-xs"
                      onClick={() =>
                        setExpandedComments((m) => ({
                          ...m,
                          [order.id]: !m[order.id],
                        }))
                      }
                    >
                      {expanded ? (
                        <>
                          Свернуть <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Развернуть <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-2">
                  Состав
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="bg-surface-2 text-xs text-text-2">
                      <tr>
                        <th className="p-2 font-medium">Товар</th>
                        <th className="p-2 font-medium">Кол-во</th>
                        <th className="p-2 font-medium">Цена</th>
                        <th className="p-2 font-medium">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => {
                        const line = item.quantity * item.price;
                        return (
                          <tr key={item.id} className="border-t border-border">
                            <td className="p-2">{item.product?.name || "Товар"}</td>
                            <td className="p-2 tabular-nums">{item.quantity}</td>
                            <td className="p-2 tabular-nums">
                              {formatPrice(item.price)}
                            </td>
                            <td className="p-2 tabular-nums font-medium">
                              {formatPrice(line)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/bonuses?orderId=${encodeURIComponent(order.id)}`}>
                    <Gift className="mr-1.5 h-4 w-4" aria-hidden />
                    Бонусы по заказу
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-surface-2" />
          <div className="h-32 rounded-xl border border-border bg-surface-1" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
