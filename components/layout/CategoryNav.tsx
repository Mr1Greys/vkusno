"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CategoryOrbIcon } from "@/components/layout/category-orb-icons";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    const header = document.getElementById("shop-site-header");
    const strip = document.querySelector('[data-sticky="shop-category-nav"]');
    const h = header instanceof HTMLElement ? header.offsetHeight : 0;
    const s = strip instanceof HTMLElement ? strip.offsetHeight : 0;
    const gap = 12;
    const top =
      el.getBoundingClientRect().top + window.scrollY - h - s - gap;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div
      data-sticky="shop-category-nav"
      className={cn(
        "sticky top-[var(--shop-header-height)] z-30",
        "bg-cream/75 backdrop-blur-xl backdrop-saturate-150",
        "shadow-[inset_0_-1px_0_rgba(74,60,47,0.05)]"
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 pb-3.5 pt-2 md:pb-5 md:pt-2.5">
        <nav
          className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-1.5 scrollbar-hide sm:gap-3 md:gap-3.5 md:py-2"
          aria-label="Категории меню"
        >
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.slug)}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "group flex min-h-[44px] max-w-[13rem] shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 sm:min-h-[48px] sm:max-w-[14.75rem] sm:gap-3 sm:px-4 sm:py-2.5 md:max-w-[15.5rem]",
                  "outline-none transition-[transform,background,color,border,box-shadow] duration-200",
                  "active:scale-[0.98] [-webkit-tap-highlight-color:transparent]",
                  "focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "bg-brand text-[#FFFCF9] shadow-[0_8px_22px_-10px_rgba(74,60,47,0.38)]"
                    : cn(
                        "border border-brand/[0.16] bg-[#FFFCF9]/95 text-brand/90 shadow-[0_2px_14px_-8px_rgba(74,60,47,0.14)]",
                        "hover:border-brand/28 hover:bg-white hover:text-brand"
                      )
                )}
              >
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center",
                    active ? "text-[#FFFCF9]" : "text-brand/75 group-hover:text-brand"
                  )}
                >
                  <CategoryOrbIcon slug={cat.slug} variant="pill" />
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-left text-[10px] font-semibold uppercase leading-snug tracking-[0.07em] sm:text-[11px] sm:tracking-[0.06em]",
                    active ? "text-[#FFFCF9]" : "text-text-2 group-hover:text-text"
                  )}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
