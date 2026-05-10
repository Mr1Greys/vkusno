"use client";

import Image from "next/image";
import Link from "next/link";
import { Wheat, Utensils } from "lucide-react";
import { LandingHeroBar } from "@/components/layout/LandingHeroBar";
import {
  IconFreshBake,
  IconQuality,
  IconFastDelivery,
  IconMadeWithLove,
} from "@/components/landing/BenefitIcons";

const benefitItems = [
  {
    Icon: IconFreshBake,
    title: "Свежая выпечка",
    sub: "Каждый день из печи — круасаны, хлеб, десерты.",
  },
  {
    Icon: IconQuality,
    title: "Качество ингредиентов",
    sub: "Только проверенное сырьё без компромиссов.",
  },
  {
    Icon: IconFastDelivery,
    title: "Доставка по городу",
    sub: "Собираем заказ быстро и аккуратно до двери.",
  },
  {
    Icon: IconMadeWithLove,
    title: "С душой",
    sub: "Готовим так, как угощаем родных.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <LandingHeroBar />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,166,35,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(139,111,71,0.08),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(74,60,47,0.06),transparent_45%)]"
      />

      <section className="relative px-4 pb-6 pt-5 md:pb-10 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-coffee">
            Выпечка и точка
          </p>
          <h1 className="font-display text-[clamp(2.1rem,5.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-text">
            Добро пожаловать!
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-text-2 md:mt-4 md:text-[17px]">
            Два пространства — пекарня и ресторан. Способ получения заказа и точка самовывоза — в
            полосе выше.
          </p>
        </div>
      </section>

      <div className="relative container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Link
            href="/menu"
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[28px] shadow-[0_40px_100px_-48px_rgba(74,60,47,0.85)] ring-1 ring-black/[0.06] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_48px_120px_-40px_rgba(74,60,47,0.55)]"
          >
            <Image
              src="/images/products/bakery-hero.png"
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand/90 via-brand/45 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-9">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#F5E6D8] ring-1 ring-white/25 backdrop-blur-sm">
                <Wheat className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-[#FFFCF9]">
                Пекарня
              </h2>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/90">
                Свежая выпечка, хлеб, десерты и ароматный кофе.
              </p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFFCF9] px-6 py-3 text-sm font-semibold text-brand transition-transform group-hover:translate-x-0.5">
                Перейти в пекарню
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/restaurant"
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[28px] shadow-[0_40px_100px_-48px_rgba(139,111,71,0.55)] ring-1 ring-black/[0.06] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_48px_120px_-40px_rgba(139,111,71,0.45)]"
          >
            <Image
              src="/images/products/restaurant-hero.png"
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-coffee/88 via-coffee/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-9">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#F5E6D8] ring-1 ring-white/25 backdrop-blur-sm">
                <Utensils className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-[#FFFCF9]">
                Ресторан
              </h2>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/90">
                Завтраки, горячие блюда, салаты и напитки.
              </p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFFCF9] px-6 py-3 text-sm font-semibold text-coffee transition-transform group-hover:translate-x-0.5">
                Перейти в ресторан
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        </div>

        <section className="mx-auto mt-20 max-w-4xl border-t border-border/70 pt-14 md:mt-24 md:pt-16">
          <div className="mb-10 md:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-3">
              Наши опоры
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-text md:text-[1.75rem]">
              Без лишних блоков — просто то, во что верим
            </h2>
          </div>

          <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
            {benefitItems.map(({ Icon, title, sub }, i) => (
              <div key={title} className="flex gap-5 md:gap-6">
                <Icon
                  className="h-11 w-11 shrink-0 text-brand md:h-12 md:w-12"
                  aria-hidden
                />
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-3">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-text md:text-[1.15rem]">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[22rem] text-[15px] leading-relaxed text-text-2">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
