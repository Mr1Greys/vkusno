"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { InstallPrompt } from "@/components/shop/InstallPrompt";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const showStandardHeader = pathname !== "/";

  return (
    <div className="flex min-h-screen flex-col gap-8 pb-[var(--mobile-tab-bar-height)] md:pb-0">
      {showStandardHeader ? <Header /> : null}
      <CartDrawer open={isOpen} onOpenChange={closeCart} />
      <main className="flex-1">{children}</main>
      <InstallPrompt />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}