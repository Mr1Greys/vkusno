"use client";

import type { FC } from "react";
import {
  Beef,
  CakeSlice,
  CookingPot,
  Croissant,
  Disc3,
  Pizza,
  Salad,
  Soup,
  Wheat,
  Sandwich,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Line-иконки категорий: тонкий stroke для пилюль, чуть плотнее для круглых орбов (если понадобится).
 */

const STROKE_ORB = 1.45;
const STROKE_PILL = 1.15;

export const CATEGORY_ORB_SVG_CLASS =
  "h-8 w-8 shrink-0 md:h-8 md:w-8";

export const CATEGORY_PILL_ICON_CLASS = "h-[1.15rem] w-[1.15rem] shrink-0 sm:h-5 sm:w-5";

export type CategoryIconProps = {
  className?: string;
  strokeWidth?: number;
};

function FallbackIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Wheat
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      stroke="currentColor"
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function BlinyIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Disc3
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function DessertsIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <CakeSlice
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function SavoryPastryIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Sandwich
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function SweetPastryIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Croissant
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function MangalIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Beef
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function SaladsIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Salad
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function SnacksIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Pizza
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function SoupsIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <Soup
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

function HotDishesIcon({ className, strokeWidth }: CategoryIconProps) {
  return (
    <CookingPot
      className={cn(CATEGORY_ORB_SVG_CLASS, className)}
      strokeWidth={strokeWidth ?? STROKE_ORB}
      aria-hidden
    />
  );
}

const CATEGORY_ORB_ICONS: Record<string, FC<CategoryIconProps>> = {
  bliny: BlinyIcon,
  desserts: DessertsIcon,
  "savory-pastry": SavoryPastryIcon,
  "sweet-pastry": SweetPastryIcon,
  mangal: MangalIcon,
  salads: SaladsIcon,
  snacks: SnacksIcon,
  soups: SoupsIcon,
  "hot-dishes": HotDishesIcon,
};

export type CategoryOrbVariant = "orb" | "pill";

export function CategoryOrbIcon({
  slug,
  variant = "orb",
}: {
  slug: string;
  variant?: CategoryOrbVariant;
}) {
  const Cmp = CATEGORY_ORB_ICONS[slug] ?? FallbackIcon;
  const pill = variant === "pill";
  return (
    <Cmp
      className={pill ? CATEGORY_PILL_ICON_CLASS : undefined}
      strokeWidth={pill ? STROKE_PILL : STROKE_ORB}
    />
  );
}
