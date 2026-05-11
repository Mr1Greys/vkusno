"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Heart, Home, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

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

/** Тонкие линии как в минималистичном таб-баре */
const ICON_INACTIVE_W = 1.35;
const ICON_ACTIVE_W = 1.9;

export function MobileBottomNav() {
  const pathname = normalizePath(usePathname() || "");
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemsCount());

  useEffect(() => setMounted(true), []);

  if (HIDE_PATHS.has(pathname)) return null;

  return (
    <nav
      aria-label="Основная навигация"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 outline-none md:hidden"
    >
      <div
        className={cn(
          "pointer-events-auto border-t border-beige/50 bg-white",
          "pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2.5",
          "shadow-[0_-6px_28px_-14px_rgba(74,60,47,0.12)]"
        )}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-3 sm:px-5">
          {NAV.map(({ href, label, Icon, showCartBadge }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-1 text-current outline-none [-webkit-tap-highlight-color:transparent]",
                  "transition-colors duration-150 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  active
                    ? "text-brand"
                    : "text-text-3 active:text-text-2 sm:hover:text-text-2"
                )}
              >
                <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center sm:h-6 sm:w-6">
                  <Icon
                    className="h-[22px] w-[22px] text-current sm:h-6 sm:w-6"
                    strokeWidth={active ? ICON_ACTIVE_W : ICON_INACTIVE_W}
                    aria-hidden
                  />
                  {showCartBadge && mounted && cartCount > 0 ? (
                    <span
                      className="absolute -right-2 -top-1.5 flex min-h-[15px] min-w-[15px] items-center justify-center rounded-full bg-accent px-1 py-0.5 text-[8px] font-bold tabular-nums text-brand shadow-sm ring-[2px] ring-white"
                      aria-live="polite"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "max-w-[4.75rem] truncate text-center text-[11px] leading-tight tracking-tight sm:max-w-[5.25rem] sm:text-xs",
                    active ? "font-semibold" : "font-medium"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
