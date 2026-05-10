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
          className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-1.5 scrollbar-hide sm:gap-3 md:gap-4 md:py-2"
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
                  "group flex min-w-[4rem] shrink-0 flex-col items-center gap-2 rounded-[20px] py-1.5 pb-2 outline-none focus:outline-none",
                  "transition-transform active:scale-[0.96] md:min-w-[4.65rem]",
                  "focus-visible:shadow-[inset_0_0_0_2px_rgba(245,166,35,0.62),0_0_0_3px_#FAF8F5]",
                  "[-webkit-tap-highlight-color:transparent]"
                )}
              >
                <span
                  className={cn(
                    "flex h-[3.6rem] w-[3.6rem] shrink-0 items-center justify-center rounded-full transition-[box-shadow,color,background,transform] duration-300 md:h-14 md:w-14",
                    active
                      ? cn(
                          "bg-accent text-brand",
                          "shadow-[0_12px_32px_-16px_rgba(245,166,35,0.55),inset_0_-1px_0_rgba(0,0,0,0.08)]"
                        )
                      : cn(
                          "bg-[#FFFCF9]/95 text-brand group-hover:text-accent",
                          "shadow-[0_5px_24px_-12px_rgba(74,60,47,0.16),inset_0_0_0_1px_rgba(74,60,47,0.1)]",
                          "group-hover:bg-white group-hover:shadow-[0_10px_28px_-14px_rgba(74,60,47,0.22),inset_0_0_0_1px_rgba(74,60,47,0.14)]"
                        )
                  )}
                >
                  <CategoryOrbIcon slug={cat.slug} />
                </span>
                <span
                  className={cn(
                    "max-w-[5.5rem] text-center text-[11px] font-semibold leading-tight tracking-tight md:max-w-[6rem] md:text-[12px]",
                    active ? "text-text" : "text-text-2 group-hover:text-text"
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
