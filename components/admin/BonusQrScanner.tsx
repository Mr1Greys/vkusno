"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import type { Result } from "@zxing/library";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { extractLoyaltyQrJwt } from "@/lib/extract-loyalty-qr-token";
import { cn } from "@/lib/utils";

type BonusQrScannerProps = {
  onDecoded: (token: string) => void;
  active: boolean;
  /** Состояние камеры / первого кадра */
  onCameraState?: (state: "idle" | "starting" | "live" | "error") => void;
};

export function BonusQrScanner({
  onDecoded,
  active,
  onCameraState,
}: BonusQrScannerProps) {
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTokenRef = useRef<string>("");
  const cooldownRef = useRef<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleDecode = useCallback(
    (text: string) => {
      const token = extractLoyaltyQrJwt(text);
      if (!token) return;
      const now = Date.now();
      if (token === lastTokenRef.current && now - cooldownRef.current < 3200) {
        return;
      }
      lastTokenRef.current = token;
      cooldownRef.current = now;
      onDecoded(token);
    },
    [onDecoded]
  );

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      setCameraError(null);
      onCameraState?.("idle");
      return;
    }

    let cancelled = false;
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);
    const videoEl = videoRef.current;
    if (!videoEl) return;

    onCameraState?.("starting");
    setCameraError(null);

    const callback = (result: Result | undefined) => {
      if (!result || cancelled) return;
      handleDecode(result.getText());
    };

    const start = async () => {
      try {
        try {
          const c = await reader.decodeFromConstraints(
            {
              video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            },
            videoEl,
            callback
          );
          if (cancelled) {
            c.stop();
            return;
          }
          controlsRef.current = c;
          onCameraState?.("live");
        } catch {
          const c = await reader.decodeFromVideoDevice(
            undefined,
            videoEl,
            callback
          );
          if (cancelled) {
            c.stop();
            return;
          }
          controlsRef.current = c;
          onCameraState?.("live");
        }
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Не удалось открыть камеру. Разрешите доступ в настройках браузера.";
        setCameraError(msg);
        onCameraState?.("error");
      }
    };

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      onCameraState?.("idle");
    };
  }, [active, handleDecode, onCameraState]);

  return (
    <div className="mx-auto w-full max-w-[280px] space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black shadow-inner ring-1 ring-black/20">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
        />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-[10%]"
          aria-hidden
        >
          <div
            className={cn(
              "relative h-full w-full rounded-xl border-2 border-dashed border-white/55 shadow-[inset_0_0_24px_rgba(0,0,0,0.25)]",
              active && "animate-pulse [animation-duration:2.2s]"
            )}
          >
            <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white" />
            <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white" />
            <span className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white" />
            <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white" />
            {active ? (
              <div className="absolute inset-[8%] overflow-hidden rounded-lg">
                <div className="absolute left-[6%] right-[6%] h-0.5 rounded-full bg-emerald-300/95 shadow-[0_0_14px_rgba(52,211,153,0.9)] animate-bonus-scanline" />
              </div>
            ) : null}
          </div>
        </div>
        {active ? (
          <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 drop-shadow">
            Наведите рамку на QR в приложении клиента
          </p>
        ) : null}
      </div>
      {cameraError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {cameraError}
        </p>
      ) : null}
    </div>
  );
}
