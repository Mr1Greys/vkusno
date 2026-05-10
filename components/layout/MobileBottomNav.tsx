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

const ICON_INACTIVE_W = 1.6;
const ICON_ACTIVE_W = 1.95;

export function MobileBottomNav() {
  const pathname = normalizePath(usePathname() || "");
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemsCount());

  useEffect(() => setMounted(true), []);

  if (HIDE_PATHS.has(pathname)) return null;

  return (
    <nav
      aria-label="Основная навигация"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      <div className="pointer-events-auto pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] pt-2">
        <div
          className={cn(
            "mx-3 rounded-[22px]",
            "border border-brand/[0.12]",
            /* почти сплошной фон — текст/иконки не теряются на тёмных фото под скроллом */
            "bg-cream/[0.98] backdrop-blur-sm",
            "shadow-[0_8px_28px_-10px_rgba(74,60,47,0.28),inset_0_1px_0_rgba(255,255,255,0.85)]"
          )}
        >
          <div className="flex items-stretch justify-between gap-0 px-2 py-2 sm:px-3">
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
                    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[17px] py-2 transition-[color,transform,background,box-shadow] duration-300 ease-out [-webkit-tap-highlight-color:transparent]",
                    active
                      ? cn(
                          "bg-white/90 text-brand",
                          "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(74,60,47,0.08)] ring-1 ring-brand/10"
                        )
                      : cn(
                          "text-brand/90",
                          "[&_svg]:drop-shadow-[0_0.5px_0_rgba(250,248,245,0.95)]",
                          "active:scale-[0.97]",
                          "hover:bg-black/[0.04] hover:text-brand"
                        )
                  )}
                >
                  <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                    <Icon
                      className="h-[22px] w-[22px] text-current"
                      strokeWidth={active ? ICON_ACTIVE_W : ICON_INACTIVE_W + 0.1}
                      aria-hidden
                    />
                    {showCartBadge && mounted && cartCount > 0 ? (
                      <span
                        className="absolute -right-1.5 -top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent px-1 py-0.5 text-[9px] font-bold tabular-nums text-brand shadow-sm ring-[2.5px] ring-cream"
                        aria-live="polite"
                      >
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "max-w-[4.75rem] truncate text-center text-[12px] leading-tight tracking-tight [text-shadow:0_0.5px_0_rgba(250,248,245,0.9)] md:max-w-[5rem]",
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
      </div>
    </nav>
  );
}
