import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersToday, totalOrders, totalUsers, revenue] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    ordersToday,
    totalOrders,
    totalUsers,
    revenue: revenue._sum.totalAmount || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: true },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    CONFIRMED: "bg-blue-500",
    PREPARING: "bg-orange-500",
    READY: "bg-green-500",
    COMPLETED: "bg-success",
    CANCELLED: "bg-error",
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-bold tracking-tight text-text md:mb-6 md:text-3xl">
        Обзор
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-text-2">Заказов сегодня</p>
          <p className="mt-1 text-2xl font-bold tabular-nums md:text-3xl">{stats.ordersToday}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-text-2">Всего заказов</p>
          <p className="mt-1 text-2xl font-bold tabular-nums md:text-3xl">{stats.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-text-2">Клиентов</p>
          <p className="mt-1 text-2xl font-bold tabular-nums md:text-3xl">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-text-2">Выручка</p>
          <p className="mt-1 text-2xl font-bold tabular-nums md:text-3xl">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold text-text md:mb-4 md:text-xl">
        Последние заказы
      </h2>
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
          <thead className="bg-surface-2">
            <tr>
              <th className="text-left p-3 text-sm font-medium">Заказ</th>
              <th className="text-left p-3 text-sm font-medium">Клиент</th>
              <th className="text-left p-3 text-sm font-medium">Сумма</th>
              <th className="text-left p-3 text-sm font-medium">Статус</th>
              <th className="text-left p-3 text-sm font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-3 text-sm">{order.orderNumber}</td>
                <td className="p-3 text-sm">
                  {order.user?.name || order.guestName || order.guestPhone || "Гость"}
                </td>
                <td className="p-3 text-sm font-medium">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="p-3">
                  <Badge
                    className={`${statusColors[order.status]} text-white`}
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-text-2">
                  {new Date(order.createdAt).toLocaleDateString("ru")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}