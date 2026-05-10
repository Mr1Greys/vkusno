"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const boxClass = {
  hero: "h-[4.25rem] w-[4.25rem] sm:h-[5.25rem] sm:w-[5.25rem] md:h-[6.5rem] md:w-[6.5rem]",
  header:
    "h-[3.75rem] w-[3.75rem] sm:h-[4.75rem] sm:w-[4.75rem] md:h-[6rem] md:w-[6rem]",
};

type BrandLogoProps = {
  variant?: keyof typeof boxClass;
  className?: string;
};

/**
 * Фон PNG часто белый — смешиваем с кремовым подложкой, чтобы не было «квадрата».
 * `mix-blend-darken`: белые пиксели визуально совпадают с bg-cream.
 */
export function BrandLogo({ variant = "hero", className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-[1] flex shrink-0 items-center transition-opacity hover:opacity-95",
        className
      )}
    >
      <span
        className={cn(
          "relative isolate block overflow-hidden rounded-2xl bg-cream",
          boxClass[variant]
        )}
      >
        <Image
          src="/images/logos/выпечкаиточка.png"
          alt="Выпечка и Точка"
          fill
          sizes={
            variant === "hero"
              ? "(max-width: 768px) 5rem, 7rem"
              : "(max-width: 768px) 4rem, 6rem"
          }
          className="object-contain object-center mix-blend-darken"
          unoptimized
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </span>
      <span className="sr-only">Выпечка и Точка — на главную</span>
    </Link>
  );
}
