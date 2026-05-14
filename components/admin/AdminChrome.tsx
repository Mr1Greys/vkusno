"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CircleDollarSign,
  Croissant,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Percent,
  Settings,
  ShoppingBag,
  Users,
  Wine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";

type CatalogFilter = "BAKERY" | "RESTAURANT";

export type AdminNavDef = {
  path: string;
  label: string;
  Icon: LucideIcon;
  /** Для `/admin/products`: какой таб подсвечивать */
  catalog?: CatalogFilter;
};

export type AdminNavGroup = { title: string; items: AdminNavDef[] };

const NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Главное",
    items: [
      { path: "/admin", label: "Дашборд", Icon: LayoutDashboard },
      { path: "/admin/orders", label: "Заказы", Icon: ShoppingBag },
      { path: "/admin/users", label: "Клиенты", Icon: Users },
    ],
  },
  {
    title: "Меню",
    items: [
      {
        path: "/admin/products",
        label: "Пекарня",
        Icon: Croissant,
        catalog: "BAKERY",
      },
      {
        path: "/admin/products",
        label: "Ресторан",
        Icon: Wine,
        catalog: "RESTAURANT",
      },
      { path: "/admin/settings", label: "Акции", Icon: Percent },
    ],
  },
  {
    title: "Аналитика",
    items: [
      { path: "/admin/orders", label: "Продажи", Icon: BarChart3 },
      { path: "/admin/bonuses", label: "Бонусы", Icon: CircleDollarSign },
      { path: "/admin/settings", label: "Настройки", Icon: Settings },
    ],
  },
];

function normPath(p: string) {
  return (p.replace(/\/$/, "") || "/") as string;
}

function itemHref(item: AdminNavDef): string {
  if (item.path === "/admin/products" && item.catalog) {
    return `/admin/products?catalog=${item.catalog}`;
  }
  return item.path;
}

function navActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: AdminNavDef
): boolean {
  const p = normPath(pathname);
  const ip = normPath(item.path);
  if (p !== ip) return false;

  if (item.path === "/admin") {
    return true;
  }

  if (item.path === "/admin/products" && item.catalog) {
    const cat = searchParams.get("catalog");
    if (item.catalog === "BAKERY") {
      return !cat || cat === "BAKERY";
    }
    return cat === "RESTAURANT";
  }

  return true;
}

function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Разделы админки"
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mt-5 first:mt-0">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2/75">
            {group.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = navActive(pathname, searchParams, item);
              const href = itemHref(item);
              const Icon = item.Icon;
              return (
                <li key={`${group.title}-${item.label}-${item.catalog ?? ""}`}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold leading-snug transition-colors",
                      active
                        ? "bg-brand/12 text-brand shadow-sm ring-1 ring-brand/15"
                        : "text-text hover:bg-surface-2/90 active:bg-surface-2"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-brand" : "text-text-2"
                      )}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const close = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, close]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[min(17.5rem,100vw)] shrink-0 flex-col border-r border-border/80 bg-surface-2/40 py-5 pl-4 pr-3 lg:flex">
        <div className="flex items-center gap-3 px-2 pb-2">
          <BrandLogo variant="admin" href="/admin" />
          <div className="min-w-0 leading-tight">
            <p className="font-display text-[15px] font-bold tracking-tight text-text">
              Выпечка и Точка
            </p>
            <p className="text-xs font-medium text-text-2">Админ-панель</p>
          </div>
        </div>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pt-2">
          <SidebarNav />
        </div>

        <div className="mt-auto border-t border-border/60 pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface-1 px-3 py-2.5 text-sm font-semibold text-text shadow-sm transition-colors hover:border-brand/25 hover:bg-brand/[0.06] hover:text-brand"
          >
            На сайт
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface-1/95 px-3 shadow-sm backdrop-blur-md sm:h-[3.75rem] sm:gap-3 sm:px-4 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-border/80"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-nav"
            aria-label={drawerOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            {drawerOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>

          <BrandLogo variant="admin" href="/admin" className="shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-text sm:text-base">
              Админ-панель
            </p>
            <p className="truncate text-[11px] text-text-2 sm:text-xs">
              Выпечка и Точка
            </p>
          </div>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-2 text-xs font-semibold text-brand sm:px-3 sm:text-sm"
          >
            Сайт
            <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
          </Link>
        </header>

        {drawerOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] lg:hidden"
              aria-label="Закрыть меню"
              onClick={close}
            />
            <div
              id="admin-mobile-nav"
              className="fixed inset-y-0 left-0 z-[70] flex w-[min(100vw,19.5rem)] flex-col border-r border-border bg-surface-1 shadow-[8px_0_40px_-12px_rgba(74,60,47,0.35)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <BrandLogo variant="admin" href="/admin" />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate font-display text-sm font-bold text-text">
                      Выпечка и Точка
                    </p>
                    <p className="text-[11px] text-text-2">Админ-панель</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  onClick={close}
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 pt-2">
                <SidebarNav onNavigate={close} />
              </div>
              <div className="border-t border-border bg-surface-2/40 p-3">
                <Link
                  href="/"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-[#FFFCF9] shadow-sm transition-colors hover:bg-brand-hover"
                >
                  На сайт
                  <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
                </Link>
              </div>
            </div>
          </>
        ) : null}

        <main className="container mx-auto flex-1 px-3 py-4 sm:px-4 md:py-6 lg:max-w-none lg:px-6 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
