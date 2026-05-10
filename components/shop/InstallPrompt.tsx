"use client";

import { useState, useEffect } from "react";

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
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-card-hover p-4 flex items-center gap-3">
      <span className="text-3xl">🥐</span>
      <div className="flex-1">
        <p className="font-medium text-sm text-brand">Установить приложение</p>
        {isIOS ? (
          <p className="text-xs text-text-2">Нажмите Поделиться → «На экран Домой»</p>
        ) : (
          <p className="text-xs text-text-2">Быстрый доступ без браузера</p>
        )}
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          className="bg-brand text-white text-sm px-3 py-1.5 rounded-xl font-medium"
        >
          Установить
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-text-3 text-lg">
        ✕
      </button>
    </div>
  );
}