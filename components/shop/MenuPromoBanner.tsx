"use client";

import Image from "next/image";
import { Star, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuPromoBannerProps = {
  className?: string;
  /** split: текст + миниатюра; full: только картинка на всю ширину карточки */
  layout?: "split" | "full";
  imageSrc?: string | null;
  imageAlt?: string;
  headline?: string;
  subline?: string;
  eyebrow?: string;
};

export function MenuPromoBanner({
  className,
  layout = "split",
  imageSrc,
  imageAlt = "Рекламный баннер",
  eyebrow = "Акции",
  headline = "Выгода на любимые блюда",
  subline = "Промо появится здесь — добавьте imageSrc позже.",
}: MenuPromoBannerProps) {
  const hasImage = Boolean(imageSrc?.trim());

  if (layout === "full" && hasImage) {
    return (
      <div
        className={cn(
          "relative isolate w-full overflow-hidden rounded-2xl shadow-[0_20px_45px_-28px_rgba(74,60,47,0.42)] md:rounded-2xl",
          className
        )}
      >
        {/* block + leading-none: убираем зазор под картинкой; фон тёплый на случай субпикселя */}
        <div className="relative block w-full overflow-hidden leading-none bg-[#EFE8DD] md:leading-normal">
          <div className="relative aspect-[16/11] w-full max-md:min-h-0 md:aspect-auto md:h-[clamp(168px,min(24vw,248px),268px)] md:min-h-[168px] lg:h-[clamp(172px,21vw,252px)]">
            <Image
              src={imageSrc!}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, min(896px, 72vw)"
              priority
              className="object-cover object-center max-md:scale-[1.1] md:scale-[1.08]"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-[min(92%,14.5rem)] flex-col justify-center gap-3.5 pl-3 pr-2 text-left sm:w-[min(56%,14.5rem)] sm:pl-4 md:max-w-[calc(50%-0.5rem)] md:w-auto md:gap-[1.125rem] md:pl-6 lg:max-w-[21rem] lg:pl-8">
          <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
            <Star
              className="size-6 shrink-0 text-accent md:size-8"
              strokeWidth={2}
              aria-hidden
            />
            <span className="min-w-0 text-[13px] font-semibold leading-snug tracking-tight text-text-2 [text-shadow:0_1px_12px_rgba(250,248,245,0.92)] sm:text-[14px] md:text-[15px] lg:text-[16px]">
              Копите бонусы
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
            <Wallet className="size-6 shrink-0 text-coffee md:size-8" strokeWidth={2} aria-hidden />
            <span className="min-w-0 text-left text-[13px] font-semibold leading-snug tracking-tight text-text-2 [text-shadow:0_1px_12px_rgba(250,248,245,0.92)] sm:text-[14px] md:text-[15px] lg:text-[16px]">
              <span className="hidden md:inline">Оплачивайте бонусами</span>
              <span className="flex flex-col items-start leading-snug md:hidden">
                <span>Оплачивайте</span>
                <span>бонусами</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] md:rounded-2xl",
        "border border-brand/25",
        "bg-gradient-to-br from-brand via-[#5C4838] to-[#3e3228]",
        "text-[#FFFCF9] shadow-[0_24px_50px_-28px_rgba(74,60,47,0.85)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-accent/18 blur-3xl" aria-hidden />
      <div className="relative flex items-stretch gap-3 px-4 py-3.5 md:gap-5 md:px-5 md:py-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 md:gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 md:text-[11px]">
            {eyebrow}
          </p>
          <p className="font-display text-base font-bold leading-tight tracking-tight md:text-lg">
            {headline}
          </p>
          <p className="line-clamp-2 max-w-[20rem] text-[12px] leading-snug text-white/82 md:text-[13px]">
            {subline}
          </p>
        </div>

        <div
          className={cn(
            "relative h-[4.85rem] w-[5.5rem] shrink-0 overflow-hidden rounded-2xl sm:h-[5.35rem] sm:w-[6.75rem]",
            "bg-white/12 md:h-[6rem] md:w-[7.5rem]",
            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]"
          )}
        >
          {hasImage ? (
            <Image src={imageSrc!} alt="" fill className="object-cover" sizes="120px" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 text-center">
              <span className="text-2xl opacity-95" aria-hidden>
                🥐
              </span>
              <span className="text-[9px] font-medium leading-tight text-white/65">
                Промо
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
