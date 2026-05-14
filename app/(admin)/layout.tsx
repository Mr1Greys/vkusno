import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminChrome } from "@/components/admin/AdminChrome";

/** На этапе `next build` на Vercel нет доступа к БД — не предрендерим админку. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { href: "/admin", label: "Обзор" },
    { href: "/admin/orders", label: "Заказы" },
    { href: "/admin/products", label: "Товары" },
    { href: "/admin/users", label: "Клиенты" },
    { href: "/admin/bonuses", label: "Бонусы" },
    { href: "/admin/settings", label: "Настройки" },
  ];

  return <AdminChrome navItems={navItems}>{children}</AdminChrome>;
}
