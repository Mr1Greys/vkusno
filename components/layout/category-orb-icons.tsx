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

/**
 * Стандартные line-иконки (единый набор), как на референсе:
 * - один stroke
 * - круглые окончания/соединения
 * - никаких кастомных «кривых» SVG
 */

const STROKE = 2.25;

export const CATEGORY_ORB_SVG_CLASS =
  "h-8 w-8 shrink-0 md:h-8 md:w-8";

function FallbackIcon() {
  return (
    <Wheat
      className={CATEGORY_ORB_SVG_CLASS}
      stroke="currentColor"
      strokeWidth={STROKE}
      aria-hidden
    />
  );
}

function BlinyIcon() {
  return <Disc3 className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function DessertsIcon() {
  return <CakeSlice className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function SavoryPastryIcon() {
  return <Sandwich className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function SweetPastryIcon() {
  return <Croissant className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function MangalIcon() {
  return <Beef className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function SaladsIcon() {
  return <Salad className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function SnacksIcon() {
  return <Pizza className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function SoupsIcon() {
  return <Soup className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

function HotDishesIcon() {
  return <CookingPot className={CATEGORY_ORB_SVG_CLASS} strokeWidth={STROKE} aria-hidden />;
}

export const CATEGORY_ORB_ICONS: Record<string, FC> = {
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

export function CategoryOrbIcon({ slug }: { slug: string }) {
  const Cmp = CATEGORY_ORB_ICONS[slug] ?? FallbackIcon;
  return <Cmp />;
}
