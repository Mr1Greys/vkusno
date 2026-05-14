"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AdminNavItem = { href: string; label: string };

function navActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/admin") return p === "/admin";
  return p === h || p.startsWith(`${h}/`);
}

export function AdminChrome({
  navItems,
  children,
}: {
  navItems: AdminNavItem[];
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface-1/95 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-3 sm:px-4 md:h-[4.25rem] md:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-border/80 md:hidden"
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

          <Link
            href="/admin"
            className="min-w-0 flex-1 font-display text-lg font-bold tracking-tight text-text md:flex-none md:text-xl"
            onClick={close}
          >
            Админ-панель
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex md:flex-1 md:justify-end lg:gap-1"
            aria-label="Разделы админки"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-3.5",
                  navActive(pathname, item.href)
                    ? "bg-brand/12 text-brand"
                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-brand md:inline-flex"
          >
            На сайт
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
        </div>
      </header>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] md:hidden"
            aria-label="Закрыть меню"
            onClick={close}
          />
          <nav
            id="admin-mobile-nav"
            className="fixed inset-y-0 left-0 z-[70] flex w-[min(100vw,19.5rem)] flex-col border-r border-border bg-surface-1 shadow-[8px_0_40px_-12px_rgba(74,60,47,0.35)] md:hidden"
            aria-label="Разделы админки"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <p className="font-display text-base font-bold text-text">Разделы</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={close}
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-2 pb-4">
              {navItems.map((item) => {
                const active = navActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "rounded-xl px-4 py-3.5 text-[15px] font-semibold leading-snug transition-colors",
                      active
                        ? "bg-brand/10 text-brand ring-1 ring-brand/15"
                        : "text-text hover:bg-surface-2 active:bg-surface-2/80"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-border bg-surface-2/50 p-3">
              <Link
                href="/"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-[#FFFCF9] shadow-sm transition-colors hover:bg-brand-hover"
              >
                На сайт
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          </nav>
        </>
      ) : null}

      <main className="container mx-auto px-3 py-4 sm:px-4 md:py-6">{children}</main>
    </div>
  );
}
