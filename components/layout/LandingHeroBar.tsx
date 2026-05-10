"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeliveryStore } from "@/store/deliveryStore";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { BrandLogo } from "@/components/layout/BrandLogo";

const PICKUP_SPOT = "Пекарня на Ленинском";
const WAIT_BLURB = "~ 15 мин";

function LandingDeliveryToggle({
  className,
  maxWidthClass = "max-w-[19rem] sm:max-w-[20rem]",
}: {
  className?: string;
  maxWidthClass?: string;
}) {
  const type = useDeliveryStore((s) => s.type);
  const setType = useDeliveryStore((s) => s.setType);

  return (
    <div className={cn("flex min-w-0 justify-center px-0 md:px-0", className)}>
      <div
        className={cn("relative w-full", maxWidthClass)}
        role="group"
        aria-label="Способ получения заказа"
      >
        <div
          className={cn(
            "relative grid grid-cols-2 gap-1 rounded-full p-1",
            "bg-gradient-to-b from-white/95 via-[#FAF7F2] to-[#EFE8DD]/95",
            "shadow-[0_6px_28px_-12px_rgba(74,60,47,0.22),inset_0_1px_0_rgba(255,255,255,0.95)]"
          )}
        >
          <motion.div
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full",
              "bg-gradient-to-b from-[#5C4A3A] to-brand",
              "shadow-[0_10px_28px_-8px_rgba(74,60,47,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]"
            )}
            animate={{ x: type === "PICKUP" ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          />
          <button
            type="button"
            onClick={() => setType("DELIVERY")}
            className={cn(
              "relative z-10 flex min-h-[40px] items-center justify-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors sm:min-h-[44px] sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.12em]",
              type === "DELIVERY"
                ? "text-[#FFFCF9]"
                : "text-text-2/90 hover:text-text"
            )}
          >
            <Truck className="h-4 w-4 shrink-0 opacity-95 sm:h-[17px] sm:w-[17px]" strokeWidth={2} />
            <span className="whitespace-nowrap">Доставка</span>
          </button>
          <button
            type="button"
            onClick={() => setType("PICKUP")}
            className={cn(
              "relative z-10 flex min-h-[40px] items-center justify-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors sm:min-h-[44px] sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.12em]",
              type === "PICKUP"
                ? "text-[#FFFCF9]"
                : "text-text-2/90 hover:text-text"
            )}
          >
            <Store className="h-4 w-4 shrink-0 opacity-95 sm:h-[17px] sm:w-[17px]" strokeWidth={2} />
            <span className="whitespace-nowrap">Самовывоз</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PickupSpotLink({ className }: { className?: string }) {
  return (
    <Link
      href="/menu"
      className={cn(
        "group flex min-w-0 max-w-[min(100%,15rem)] items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-300 sm:max-w-[17rem] md:max-w-[19rem] md:gap-3 md:px-2.5 md:py-2",
        "text-text hover:bg-brand/[0.06] active:bg-brand/[0.08]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        className
      )}
    >
      <MapPin
        className="h-[18px] w-[18px] shrink-0 text-brand/90 md:h-5 md:w-5"
        strokeWidth={2}
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-semibold leading-snug text-text md:text-[14px]">
          {PICKUP_SPOT}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium tabular-nums text-text-2 md:text-[12px]">
          <Clock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          Время ожидания {WAIT_BLURB}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-coffee/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand/70 md:h-5 md:w-5"
        aria-hidden
      />
    </Link>
  );
}

export function LandingHeroBar() {
  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto max-w-7xl px-3 py-3 md:px-6 md:py-3.5">
        {/* Мобильная */}
        <div className="flex flex-col gap-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo variant="hero" />
            <HeaderActions />
          </div>
          <LandingDeliveryToggle className="w-full" maxWidthClass="max-w-none" />
          <PickupSpotLink className="w-full max-w-none justify-between gap-3 rounded-2xl px-3 py-2.5" />
        </div>

        {/* Десктоп: три колонки — лого | переключатель по центру | точка + действия */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-6 lg:gap-10">
          <div className="flex items-center justify-self-start">
            <BrandLogo variant="hero" />
          </div>
          <div className="flex shrink-0 items-center justify-center justify-self-center px-2">
            <LandingDeliveryToggle maxWidthClass="w-[min(100vw-28rem,17.5rem)] md:w-[17.5rem]" />
          </div>
          <div className="flex min-w-0 items-center justify-end justify-self-end gap-3 lg:gap-4">
            <PickupSpotLink />
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
}
