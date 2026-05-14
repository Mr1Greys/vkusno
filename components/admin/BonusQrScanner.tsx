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

function disposeStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* ignore */
    }
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Мягкие ограничения для мобильных Safari: без ideal 1920×1080 (часто зависает getUserMedia).
 */
async function getPreferredCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { audio: false, video: { facingMode: { ideal: "environment" } } },
    { audio: false, video: { facingMode: "environment" } },
    { audio: false, video: { facingMode: "user" } },
    { audio: false, video: true },
  ];
  let last: unknown;
  for (const c of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(c);
    } catch (e) {
      last = e;
    }
  }
  if (last instanceof Error) throw last;
  throw new Error(String(last));
}

export function BonusQrScanner({
  onDecoded,
  active,
  onCameraState,
}: BonusQrScannerProps) {
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTokenRef = useRef<string>("");
  const cooldownRef = useRef<number>(0);
  const decodeOnceDoneRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [needsTapPlay, setNeedsTapPlay] = useState(false);

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
    decodeOnceDoneRef.current = false;

    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      disposeStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraError(null);
      setNeedsTapPlay(false);
      onCameraState?.("idle");
      return;
    }

    let cancelled = false;
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints, {
      tryPlayVideoTimeout: 16000,
      delayBetweenScanAttempts: 220,
    });

    const start = async () => {
      const waitForVideoEl = async (): Promise<HTMLVideoElement | null> => {
        for (let i = 0; i < 30; i++) {
          if (cancelled) return null;
          const el = videoRef.current;
          if (el) return el;
          await new Promise((r) => requestAnimationFrame(r));
        }
        return videoRef.current;
      };

      const videoEl = await waitForVideoEl();
      if (cancelled || !videoEl) return;

      onCameraState?.("starting");
      setCameraError(null);
      setNeedsTapPlay(false);

      let stream: MediaStream | null = null;
      try {
        stream = await withTimeout(
          getPreferredCameraStream(),
          20000,
          "Камера не ответила за 20 с. Проверьте разрешение и перезагрузите страницу."
        );
        if (cancelled) {
          disposeStream(stream);
          return;
        }
        streamRef.current = stream;

        const callback = (result: Result | undefined) => {
          if (!result || cancelled || decodeOnceDoneRef.current) return;
          const raw = result.getText();
          const token = extractLoyaltyQrJwt(raw);
          if (!token) return;
          decodeOnceDoneRef.current = true;
          try {
            controlsRef.current?.stop();
          } catch {
            /* ignore */
          }
          handleDecode(raw);
        };

        const controls = await withTimeout(
          reader.decodeFromStream(stream, videoEl, callback),
          22000,
          "Не удалось запустить предпросмотр камеры."
        );
        if (cancelled) {
          controls.stop();
          disposeStream(stream);
          return;
        }
        controlsRef.current = controls;
        onCameraState?.("live");

        videoEl.setAttribute("playsinline", "true");
        videoEl.playsInline = true;
        videoEl.muted = true;
        try {
          await videoEl.play();
          setNeedsTapPlay(false);
        } catch {
          setNeedsTapPlay(true);
        }

        requestAnimationFrame(() => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.srcObject && (v.paused || v.readyState < 2)) {
            setNeedsTapPlay(true);
          }
        });
      } catch (e) {
        if (cancelled) {
          disposeStream(stream);
          return;
        }
        disposeStream(stream);
        streamRef.current = null;
        const msg =
          e instanceof Error
            ? e.message
            : "Не удалось открыть камеру. Разрешите доступ и используйте HTTPS.";
        setCameraError(msg);
        onCameraState?.("error");
      }
    };

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      disposeStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      onCameraState?.("idle");
    };
  }, [active, handleDecode, onCameraState]);

  const resumePreview = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
      setNeedsTapPlay(false);
    } catch {
      setCameraError("Нажмите ещё раз или проверьте разрешения камеры в настройках браузера.");
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-[280px] space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black shadow-inner ring-1 ring-black/20">
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] h-full w-full object-cover [transform:translateZ(0)]"
          muted
          playsInline
          autoPlay
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center p-[10%]"
          aria-hidden
        >
          <div className="relative h-full w-full rounded-xl border-2 border-dashed border-white/50">
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
        {active && needsTapPlay ? (
          <button
            type="button"
            onClick={resumePreview}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 text-center text-sm font-medium text-white backdrop-blur-[2px]"
          >
            Нажмите, чтобы включить предпросмотр камеры
          </button>
        ) : null}
        {active ? (
          <p className="pointer-events-none absolute bottom-2 left-0 right-0 z-[3] text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 drop-shadow">
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
