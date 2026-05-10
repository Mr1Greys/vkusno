import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Users, Settings, Package } from "lucide-react";

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
    { href: "/admin", icon: LayoutDashboard, label: "Обзор" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Заказы" },
    { href: "/admin/products", icon: Package, label: "Товары" },
    { href: "/admin/users", icon: Users, label: "Клиенты" },
    { href: "/admin/settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-1 border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-display font-bold text-xl">
            Админ-панель
          </Link>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-text-2 hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}