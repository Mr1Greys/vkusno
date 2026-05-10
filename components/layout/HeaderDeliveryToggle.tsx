"use client";

import { motion } from "framer-motion";
import { Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeliveryStore } from "@/store/deliveryStore";

export function HeaderDeliveryToggle() {
  const type = useDeliveryStore((s) => s.type);
  const setType = useDeliveryStore((s) => s.setType);

  return (
    <div
      className="pointer-events-auto relative mx-auto w-full max-w-[min(100%,17.5rem)] sm:max-w-[15.5rem] md:max-w-[17rem]"
      role="group"
      aria-label="Способ получения заказа"
    >
      <div className="relative grid grid-cols-2 gap-0.5 rounded-full bg-white/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-border/80 backdrop-blur-sm">
        <motion.div
          className="absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-full bg-brand shadow-[0_8px_24px_-8px_rgba(74,60,47,0.55)]"
          animate={{ x: type === "DELIVERY" ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
        />
        <button
          type="button"
          onClick={() => setType("PICKUP")}
          className={cn(
            "relative z-10 flex min-h-[38px] items-center justify-center gap-1.5 rounded-full px-2 text-[11px] font-semibold transition-colors md:gap-2 md:px-3 md:text-xs",
            type === "PICKUP" ? "text-[#FFFCF9]" : "text-text-2"
          )}
        >
          <Store className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2} />
          <span className="whitespace-nowrap">Самовывоз</span>
        </button>
        <button
          type="button"
          onClick={() => setType("DELIVERY")}
          className={cn(
            "relative z-10 flex min-h-[38px] items-center justify-center gap-1.5 rounded-full px-2 text-[11px] font-semibold transition-colors md:gap-2 md:px-3 md:text-xs",
            type === "DELIVERY" ? "text-[#FFFCF9]" : "text-text-2"
          )}
        >
          <Truck className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2} />
          <span className="whitespace-nowrap">Доставка</span>
        </button>
      </div>
    </div>
  );
}
