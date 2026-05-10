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
      <h1 className="text-2xl font-display font-bold mb-6">Обзор</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-1 p-4 rounded-lg border border-border">
          <p className="text-text-2 text-sm">Заказов сегодня</p>
          <p className="text-2xl font-bold">{stats.ordersToday}</p>
        </div>
        <div className="bg-surface-1 p-4 rounded-lg border border-border">
          <p className="text-text-2 text-sm">Всего заказов</p>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-surface-1 p-4 rounded-lg border border-border">
          <p className="text-text-2 text-sm">Клиентов</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-surface-1 p-4 rounded-lg border border-border">
          <p className="text-text-2 text-sm">Выручка</p>
          <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Последние заказы</h2>
      <div className="bg-surface-1 rounded-lg border border-border overflow-hidden">
        <table className="w-full">
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
  );
}