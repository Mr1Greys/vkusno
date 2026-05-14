import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_NOT_CANCELLED } from "@/lib/admin/dashboard-stats";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      bonusPoints: true,
      createdAt: true,
    },
  });

  const orderAgg = await prisma.order.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      ...ORDER_NOT_CANCELLED,
    },
    _count: true,
    _sum: { totalAmount: true },
  });
  const byUserId = new Map(
    orderAgg
      .filter((r) => r.userId)
      .map((r) => [
        r.userId as string,
        { count: r._count, sum: r._sum.totalAmount ?? 0 },
      ])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text md:text-3xl">
          Клиенты
        </h1>
        <p className="mt-1 text-sm text-text-2">
          Заказы и суммы без статуса «Отменён».
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-2">
              <tr>
                <th className="p-3 font-medium">Имя</th>
                <th className="p-3 font-medium">Телефон</th>
                <th className="p-3 font-medium">Регистрация</th>
                <th className="p-3 font-medium">Заказов</th>
                <th className="p-3 font-medium">Сумма</th>
                <th className="p-3 font-medium">Бонусы</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const o = byUserId.get(user.id);
                const orderCount = o?.count ?? 0;
                const totalSpent = o?.sum ?? 0;
                return (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-3 text-sm">{user.name || "—"}</td>
                    <td className="p-3 text-sm">{user.phone}</td>
                    <td className="whitespace-nowrap p-3 text-sm text-text-2">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="p-3 text-sm tabular-nums">{orderCount}</td>
                    <td className="p-3 text-sm font-medium tabular-nums">
                      {formatPrice(totalSpent)}
                    </td>
                    <td className="p-3 text-sm font-medium tabular-nums text-brand">
                      {user.bonusPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
