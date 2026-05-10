"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MenuPromoBanner } from "@/components/shop/MenuPromoBanner";
import { cn } from "@/lib/utils";

export type ShopPageHeroProps = {
  title: string;
  titleIcon?: React.ReactNode;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Промо-баннер */
  promoLayout?: "split" | "full";
  promoEyebrow?: string;
  promoHeadline?: string;
  promoSubline?: string;
  promoImageSrc?: string | null;
  promoImageAlt?: string;
  className?: string;
};

export function ShopPageHero({
  title,
  titleIcon,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Найти блюдо по названию…",
  promoLayout = "split",
  promoEyebrow,
  promoHeadline,
  promoSubline,
  promoImageSrc,
  promoImageAlt,
  className,
}: ShopPageHeroProps) {
  return (
    <section className={cn("pb-6 md:pb-9", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-coffee transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          На главную
        </Link>

        <header className="mb-6 md:mb-8">
          <h1 className="flex flex-wrap items-center gap-3 font-display text-3xl font-bold tracking-tight text-text md:text-[2rem] md:tracking-tighter">
            {titleIcon ? (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/[0.08] text-brand ring-1 ring-brand/15"
                aria-hidden
              >
                {titleIcon}
              </span>
            ) : null}
            {title}
          </h1>
        </header>

        <div className="space-y-4 md:space-y-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[1.15rem] w-[1.15rem] -translate-y-1/2 text-text-3"
              strokeWidth={2}
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              autoComplete="off"
              aria-label="Поиск блюда"
              className="h-12 rounded-full border-border/70 bg-surface-1 py-3 pl-11 pr-4 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-text-3 focus-visible:ring-brand/30 md:h-[3.25rem] md:pl-12"
            />
          </div>
          <MenuPromoBanner
            layout={promoLayout}
            imageSrc={promoImageSrc}
            imageAlt={promoImageAlt}
            eyebrow={promoEyebrow}
            headline={promoHeadline}
            subline={promoSubline}
          />
        </div>
      </div>
    </section>
  );
}
