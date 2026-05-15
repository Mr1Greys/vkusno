"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Croissant, Pencil, QrCode, ScanLine, X } from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

function formatBonusPoints(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    const d = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)} ${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return phone;
}

interface LoyaltyCardProps {
  name: string;
  phone: string;
  bonusPoints: number;
  onEditContacts?: () => void;
  className?: string;
}

export function LoyaltyCard({
  name,
  phone,
  bonusPoints,
  onEditContacts,
  className,
}: LoyaltyCardProps) {
  const [showQr, setShowQr] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [qrPhase, setQrPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [bonusPercent, setBonusPercent] = useState(5);

  useEffect(() => {
    fetch("/api/shop/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { bonus_percent?: string } | null) => {
        if (data?.bonus_percent) {
          const p = parseInt(data.bonus_percent, 10);
          if (!Number.isNaN(p)) setBonusPercent(p);
        }
      })
      .catch(() => {});
  }, []);

  const fetchQrToken = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/profile/loyalty-qr", { signal });
    if (!res.ok) throw new Error("loyalty-qr failed");
    const data = (await res.json()) as { token?: string };
    if (!data.token) throw new Error("loyalty-qr empty");
    return data.token;
  }, []);

  // Предзагрузка QR, чтобы при перевороте карточки код уже был готов
  useEffect(() => {
    if (token) return;
    const controller = new AbortController();
    fetchQrToken(controller.signal)
      .then((t) => {
        setToken(t);
        setQrPhase("ready");
      })
      .catch(() => {});
    return () => controller.abort();
  }, [fetchQrToken, token]);

  useEffect(() => {
    if (!showQr) return;
    if (token) {
      setQrPhase("ready");
      return;
    }

    let cancelled = false;
    setQrPhase("loading");

    fetchQrToken()
      .then((t) => {
        if (cancelled) return;
        setToken(t);
        setQrPhase("ready");
      })
      .catch(() => {
        if (!cancelled) setQrPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [showQr, token, fetchQrToken]);

  const retryQr = () => {
    setToken(null);
    setQrPhase("loading");
    fetchQrToken()
      .then((t) => {
        setToken(t);
        setQrPhase("ready");
      })
      .catch(() => setQrPhase("error"));
  };

  const displayName = name.trim() || "Клиент";
  const qrFg = "#2a2118";
  const qrBg = "#ffffff";

  return (
    <div className={cn("relative isolate", className)}>
      <div
        className={cn(
          "relative transition-[min-height] duration-300",
          showQr ? "min-h-[340px] sm:min-h-[360px]" : "min-h-[200px] sm:min-h-[210px]"
        )}
        style={{ perspective: "1200px" }}
      >
        <div
          className={cn(
            "relative h-full min-h-[inherit] w-full transition-transform duration-500 ease-out motion-reduce:transition-none",
            "[transform-style:preserve-3d]",
            showQr && "[transform:rotateY(180deg)]"
          )}
        >
          {/* Front */}
          <article
            className={cn(
              "relative overflow-hidden rounded-[24px] border border-[#e8dfd4]/90 bg-[#fcf7f2] shadow-[0_20px_50px_-28px_rgba(74,60,47,0.35)]",
              "[backface-visibility:hidden]"
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 top-4 h-36 w-36 rounded-[45%] bg-[#ebe2d6]/80 blur-[1px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-8 top-6 h-24 w-20 opacity-[0.14]"
            >
              <svg viewBox="0 0 80 100" className="h-full w-full text-coffee" fill="currentColor">
                <path d="M40 8c-8 12-22 18-22 38 0 14 8 26 22 32 14-6 22-18 22-32 0-20-14-26-22-38z" />
                <path d="M28 42c6 4 10 4 12 4s6 0 12-4" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative flex min-h-[200px] p-4 pr-[38%] sm:p-5 sm:pr-[42%]">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-0.5">
                <div className="space-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-[1.35rem] font-bold leading-tight tracking-tight text-text sm:text-2xl">
                      {displayName}
                    </h2>
                    {onEditContacts ? (
                      <button
                        type="button"
                        onClick={onEditContacts}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-coffee/80 transition hover:bg-white/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        aria-label="Редактировать контакты"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                  <p className="text-sm text-coffee">{formatPhoneDisplay(phone)}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-4xl font-bold tabular-nums leading-none tracking-tight text-text sm:text-[2.5rem]">
                        {formatBonusPoints(bonusPoints)}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center text-accent">
                        <Coins className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                      </span>
                    </div>
                    <p className="mt-1 text-[15px] font-medium text-coffee">Ваши бонусы</p>
                  </div>

                  <div className="border-t border-[#e0d5c8]/90 pt-3">
                    <p className="text-sm text-coffee">
                      Ваш кешбэк:{" "}
                      <span className="font-bold text-accent">{bonusPercent}%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Placeholder illustration */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-2 top-2 flex w-[36%] items-end justify-center sm:w-[38%]"
              >
                <div className="relative flex h-full w-full max-w-[140px] items-end justify-center pb-10">
                  <div className="absolute bottom-6 right-2 h-28 w-24 rounded-[42%] bg-[#ebe4da]/90" />
                  <div className="relative flex flex-col items-center">
                    <div className="relative z-[1] flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[48%] border-2 border-text/90 bg-white shadow-sm sm:h-20 sm:w-20">
                      <span className="absolute left-[38%] top-[38%] h-1.5 w-1.5 rounded-full bg-text" />
                      <span className="absolute right-[32%] top-[40%] h-0.5 w-3 rotate-[-8deg] rounded-full bg-text" />
                      <span className="absolute bottom-[32%] left-1/2 h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-text" />
                    </div>
                    <Croissant
                      className="relative -mt-3 h-14 w-14 text-[#c4923a] drop-shadow-sm sm:h-16 sm:w-16"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQr(true)}
                className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-[0_8px_24px_-8px_rgba(74,60,47,0.35)] ring-1 ring-black/[0.04] transition hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                aria-expanded={showQr}
                aria-label="Показать QR-код для бонусов"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2/80">
                  <QrCode className="h-5 w-5 text-text" strokeWidth={2} aria-hidden />
                </span>
                <span className="pr-1 text-sm font-semibold text-text">QR-код</span>
              </button>
            </div>
          </article>

          {/* Back — QR */}
          <article
            className={cn(
              "absolute inset-0 flex flex-col overflow-hidden rounded-[24px] border border-[#e8dfd4]/90 bg-[#fcf7f2] shadow-[0_20px_50px_-28px_rgba(74,60,47,0.35)]",
              "[backface-visibility:hidden] [transform:rotateY(180deg)]"
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#e0d5c8]/80 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ScanLine className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-text">QR для бонусов</p>
                  <p className="text-[11px] text-coffee">Покажите кассиру</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-coffee transition hover:bg-white/70 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Вернуться к карточке"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 px-4 py-4 sm:min-h-[260px] sm:px-5">
              {qrPhase === "error" && !token ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-error">Не удалось загрузить QR. Попробуйте ещё раз.</p>
                  <button
                    type="button"
                    onClick={retryQr}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-[#FFFCF9] transition hover:bg-brand-hover"
                  >
                    Повторить
                  </button>
                </div>
              ) : token ? (
                <div className="rounded-2xl border border-[#e0d5c8]/50 bg-white p-3 shadow-inner">
                  <QRCode value={token} size={200} level="H" bgColor={qrBg} fgColor={qrFg} />
                </div>
              ) : (
                <div
                  className="flex aspect-square w-[min(100%,220px)] flex-col items-center justify-center gap-3 rounded-2xl border border-[#e0d5c8]/60 bg-white/90"
                  role="status"
                  aria-label="Загрузка QR-кода"
                  aria-busy="true"
                >
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-2" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-surface-2" />
                </div>
              )}
              <p className="max-w-[260px] text-center text-[12px] leading-relaxed text-coffee">
                Кассир отсканирует код — бонусы начислятся или спишутся с вашего счёта.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
