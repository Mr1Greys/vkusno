"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HeaderDeliveryToggle } from "@/components/layout/HeaderDeliveryToggle";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { BrandLogo } from "@/components/layout/BrandLogo";

/**
 * Переключатель показываем только там, где он реально нужен.
 * На меню и оформлении — уже в нужном месте; в профиле не показываем.
 * Избранное ведёт с нижней навигации только на мобилке — там вторую строку с переключателем не показываем.
 */
const HIDE_HEADER_DELIVERY_PATHS = new Set([
  "/cart",
  "/checkout",
  "/menu",
  "/restaurant",
  "/profile",
]);

/** Только мобильная шапка: на этих путях без переключателя «Самовывоз / Доставка». */
const HIDE_MOBILE_HEADER_DELIVERY_PATHS = new Set(["/favorites"]);

function stripTrailingSlash(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function Header() {
  const pathname = usePathname() || "";
  const path = stripTrailingSlash(pathname);
  const showHeaderDeliveryToggle =
    !HIDE_HEADER_DELIVERY_PATHS.has(path);
  const showMobileDeliveryToggle =
    showHeaderDeliveryToggle &&
    !HIDE_MOBILE_HEADER_DELIVERY_PATHS.has(path);

  const headerRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Важно: sticky-offset ниже должен совпадать с реальной высотой хедера.
  // Иначе при скрытом переключателе появляется зазор перед CategoryNav.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const root = document.documentElement;
    const setVar = () => {
      root.style.setProperty("--shop-header-height", `${el.offsetHeight}px`);
    };

    setVar();
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    return () => ro.disconnect();
  }, [showHeaderDeliveryToggle, showMobileDeliveryToggle]);

  return (
    <header
      id="shop-site-header"
      ref={headerRef}
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled ? "bg-cream/95 backdrop-blur-md" : "bg-cream"
      }`}
    >
      {/* Мобильная: вторая строка — только если переключатель не скрыт (корзина / чекаут) */}
      <div
        className={`mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-3 px-3 py-2.5 md:hidden ${
          showMobileDeliveryToggle ? "gap-y-2" : ""
        }`}
      >
        <div className="flex items-center justify-self-start">
          <BrandLogo variant="header" />
        </div>
        <div className="flex items-center justify-self-end">
          <HeaderActions />
        </div>
        {showMobileDeliveryToggle && (
          <div className="col-span-2 flex w-full min-w-0 justify-center justify-self-center px-0">
            <div className="w-full max-w-md">
              <HeaderDeliveryToggle />
            </div>
          </div>
        )}
      </div>

      {/* Десктоп: три колонки с переключателем — или компактная строка без него */}
      {showHeaderDeliveryToggle ? (
        <div className="relative mx-auto hidden min-h-[6.75rem] max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 px-3 py-2 pl-6 md:grid lg:gap-10 lg:pl-10 lg:pr-4">
          <div className="flex items-center justify-self-start md:ml-4">
            <BrandLogo variant="header" />
          </div>
          <div className="flex shrink-0 items-center justify-center justify-self-center">
            <HeaderDeliveryToggle />
          </div>
          <div className="flex items-center justify-end justify-self-end gap-3">
            <HeaderActions />
          </div>
        </div>
      ) : (
        <div className="relative mx-auto hidden max-w-7xl items-center justify-between px-3 py-3 pl-6 md:flex lg:pl-10 lg:pr-4">
          <div className="flex items-center md:ml-4">
            <BrandLogo variant="header" />
          </div>
          <HeaderActions />
        </div>
      )}
    </header>
  );
}
