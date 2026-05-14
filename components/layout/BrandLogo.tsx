"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const boxClass = {
  /** Единый размер лого во всех шапках (главная и внутренние страницы). */
  hero: "h-[5rem] w-[5rem] sm:h-[5.5rem] sm:w-[5.5rem] md:h-[6.5rem] md:w-[6.5rem]",
  header:
    "h-[5rem] w-[5rem] sm:h-[5.5rem] sm:w-[5.5rem] md:h-[6.5rem] md:w-[6.5rem]",
  /** Баннеры, PWA-подсказка — без ссылки на главную */
  prompt: "h-11 w-11 shrink-0 rounded-[14px]",
  /** Админ-сайдбар — компактное квадратное лого */
  admin: "h-12 w-12 shrink-0 rounded-2xl sm:h-[3.25rem] sm:w-[3.25rem]",
};

type BrandLogoProps = {
  variant?: keyof typeof boxClass;
  className?: string;
  /** Без обёртки-ссылки (Install prompt, офлайн-баннер и т.п.) */
  asStatic?: boolean;
  /** Куда ведёт ссылка (по умолчанию главная витрина) */
  href?: string;
};

/**
 * Подложка под PNG: тот же cream, что и у шапки/страницы (#FAF8F5).
 * Смешивание убирает «холодный» белый фон у растрового лого; лёгкий sepia
 * подтягивает остаточный серый к тёплому кремовому.
 */
export function BrandLogo({
  variant = "hero",
  className,
  asStatic = false,
  href = "/",
}: BrandLogoProps) {
  const isPrompt = variant === "prompt";
  const isAdmin = variant === "admin";

  const mark = (
    <span
      className={cn(
        "relative isolate block overflow-hidden bg-cream",
        isAdmin &&
          "rounded-2xl bg-gradient-to-br from-brand/[0.14] to-brand/[0.06] ring-1 ring-brand/15",
        !isAdmin && isPrompt ? "rounded-[14px]" : !isAdmin ? "rounded-2xl" : "",
        boxClass[variant]
      )}
    >
      <Image
        src="/images/logos/выпечкаиточка.png"
        alt=""
        aria-hidden={isPrompt}
        fill
        sizes={
          isPrompt
            ? "44px"
            : isAdmin
              ? "52px"
              : "(max-width: 768px) 5rem, (max-width: 1024px) 5.5rem, 6.5rem"
        }
        className="object-contain object-center mix-blend-darken [filter:sepia(0.04)_saturate(1.06)]"
        unoptimized
        priority={!isPrompt && !isAdmin}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </span>
  );

  const wrapClass = cn(
    "relative z-[1] flex shrink-0 items-center",
    !asStatic && "transition-opacity hover:opacity-95",
    className
  );

  if (asStatic) {
    return (
      <span
        className={wrapClass}
        role="img"
        aria-label="Выпечка и Точка"
      >
        {mark}
      </span>
    );
  }

  return (
    <Link href={href} className={wrapClass}>
      {mark}
      <span className="sr-only">Выпечка и Точка</span>
    </Link>
  );
}
