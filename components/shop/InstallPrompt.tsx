"use client";

import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()));

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
  };

  if (dismissed || (!prompt && !isIOS)) return null;

  return (
    <div
      className="fixed left-4 right-4 z-[55] animate-fade-in md:hidden"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 7.95rem)",
      }}
    >
      <div
        role="banner"
        className="relative flex items-center gap-3.5 rounded-[22px] border border-brand/[0.09] bg-[#FFFDFB]/93 px-4 py-3 shadow-[0_14px_40px_-20px_rgba(74,60,47,0.28),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl backdrop-saturate-150"
      >
        <BrandLogo variant="prompt" asStatic className="ring-1 ring-brand/[0.06]" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight text-brand">Установить приложение</p>
          {isIOS ? (
            <p className="mt-0.5 text-[11px] leading-snug text-text-2">
              Нажмите Поделиться → «На экран Домой»
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] leading-snug text-text-2">
              Быстрый доступ без браузера
            </p>
          )}
        </div>
        {!isIOS && (
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_-2px_rgba(74,60,47,0.35)] transition hover:bg-brand-hover active:scale-[0.97]"
          >
            Установить
          </button>
        )}
        <button
          type="button"
          aria-label="Закрыть"
          onClick={() => setDismissed(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-3 transition hover:bg-black/[0.04] hover:text-text-2 active:scale-95"
        >
          <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
