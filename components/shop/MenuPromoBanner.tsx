"use client";

import Image from "next/image";
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
        <div className="relative block w-full overflow-hidden leading-none bg-[#EFE8DD] md:leading-normal">
          <div className="relative aspect-[2/1] w-full max-md:min-h-0 md:aspect-auto md:h-[clamp(325px,min(45vw,488px),525px)] md:min-h-[325px] lg:h-[clamp(360px,39vw,490px)]">
            <Image
              src={imageSrc!}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, min(896px, 72vw)"
              priority
              className="object-cover object-center"
            />
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
