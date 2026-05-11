"use client";

import Image from "next/image";
import { useLayoutEffect, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vypechka_mobile_welcome_dismissed";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function MobileWelcomeScreen() {
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    if (!isMobileViewport()) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Приветствие"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed inset-0 z-[100] bg-cream md:hidden",
            "supports-[height:100dvh]:min-h-[100dvh] min-h-screen"
          )}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/landing/homewelcome.png"
              alt="Выпечка и точка — пекарня и ресторан"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Лёгкий градиент у самого низа — не забиваем три подписи на макете */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-cream/95 via-cream/45 to-transparent" />

          {/* Кнопка выше низа экрана, чтобы были видны «Свежая выпечка» и т.д. на картинке */}
          <div
            className={cn(
              "absolute inset-x-0 z-10 flex flex-col items-center px-4",
              "bottom-[max(10.5rem,calc(env(safe-area-inset-bottom,0px)+9.25rem))]"
            )}
          >
            <button
              type="button"
              onClick={dismiss}
              className={cn(
                "pointer-events-auto flex h-12 w-auto max-w-[13.25rem] items-center justify-center gap-2 rounded-full px-6",
                "bg-brand text-[14px] font-semibold tracking-tight text-[#FFFCF9]",
                "shadow-[0_12px_32px_-12px_rgba(74,60,47,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]",
                "transition-[transform,filter] active:scale-[0.98] active:brightness-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              )}
            >
              <span>Перейти в меню</span>
              <Wheat className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            </button>
            <p className="pointer-events-auto mt-3 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-coffee/85">
              <span aria-hidden className="mx-1 opacity-60">
                ◇
              </span>
              Доставка и самовывоз
              <span aria-hidden className="mx-1 opacity-60">
                ◇
              </span>
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
