"use client";

import { useCallback, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

type BonusQrScannerProps = {
  onDecoded: (text: string) => void;
  active: boolean;
};

export function BonusQrScanner({ onDecoded, active }: BonusQrScannerProps) {
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastRef = useRef<string>("");
  const cooldownRef = useRef<number>(0);

  const handleDecode = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      const now = Date.now();
      if (t === lastRef.current && now - cooldownRef.current < 2500) return;
      lastRef.current = t;
      cooldownRef.current = now;
      onDecoded(t);
    },
    [onDecoded]
  );

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const videoEl = videoRef.current;
      if (!videoEl || cancelled) return;

      const reader = new BrowserMultiFormatReader();
      reader
        .decodeFromVideoDevice(undefined, videoEl, (result) => {
          if (result && !cancelled) {
            handleDecode(result.getText());
          }
        })
        .then((controls) => {
          if (cancelled) {
            controls.stop();
            return;
          }
          controlsRef.current = controls;
        })
        .catch(() => {
          /* камера недоступна и т.п. */
        });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, handleDecode]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-black">
      <video
        ref={videoRef}
        className="h-56 w-full object-cover"
        muted
        playsInline
      />
    </div>
  );
}
