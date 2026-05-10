import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { id: true, totalAmount: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Клиенты</h1>

      <div className="bg-surface-1 rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-2">
            <tr>
              <th className="text-left p-3 text-sm font-medium">Имя</th>
              <th className="text-left p-3 text-sm font-medium">Телефон</th>
              <th className="text-left p-3 text-sm font-medium">Заказов</th>
              <th className="text-left p-3 text-sm font-medium">Сумма</th>
              <th className="text-left p-3 text-sm font-medium">Бонусы</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const totalSpent = user.orders.reduce((sum, o) => sum + o.totalAmount, 0);
              return (
                <tr key={user.id} className="border-t border-border">
                  <td className="p-3 text-sm">{user.name || "—"}</td>
                  <td className="p-3 text-sm">{user.phone}</td>
                  <td className="p-3 text-sm">{user.orders.length}</td>
                  <td className="p-3 text-sm font-medium">{formatPrice(totalSpent)}</td>
                  <td className="p-3 text-sm font-medium text-brand">{user.bonusPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}