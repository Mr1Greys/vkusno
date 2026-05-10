"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Heart, Home, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const HIDE_PATHS = new Set(["/checkout"]);

function normalizePath(path: string) {
  const p = path || "";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

const NAV: {
  href: string;
  label: string;
  Icon: LucideIcon;
  showCartBadge?: boolean;
}[] = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/favorites", label: "Избранное", Icon: Heart },
  { href: "/cart", label: "Корзина", Icon: ShoppingCart, showCartBadge: true },
  { href: "/profile", label: "Профиль", Icon: User },
];

export function MobileBottomNav() {
  const pathname = normalizePath(usePathname() || "");
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemsCount());

  useEffect(() => setMounted(true), []);

  if (HIDE_PATHS.has(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-1 shadow-[0_-4px_24px_-8px_rgba(74,60,47,0.12)] md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Основная навигация"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2">
        {NAV.map(({ href, label, Icon, showCartBadge }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1 ${
                active ? "text-brand" : "text-text-2"
              }`}
            >
              <span className="relative flex h-9 w-9 items-center justify-center">
                <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
                {showCartBadge && mounted && cartCount > 0 ? (
                  <span className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-[5px] text-[10px] font-bold text-brand ring-2 ring-surface-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </span>
              <span
                className={`truncate text-[11px] leading-none ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
