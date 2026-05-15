"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gift,
  Search,
  Camera,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ScanLine,
  X,
} from "lucide-react";
import { BonusQrScanner } from "@/components/admin/BonusQrScanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { bonusTypeLabel } from "@/lib/bonus-type-labels";

type UserPreview = {
  id: string;
  phone: string;
  name: string | null;
  bonusPoints: number;
};

type HistoryRow = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string | null;
  orderId: string | null;
  createdAt: string;
  user: { phone: string; name: string | null };
  order: { id: string; orderNumber: string } | null;
  createdBy: { phone: string; name: string | null } | null;
};

type SummaryRow = { type: string; _sum: { amount: number | null } };

function AdminBonusesInner() {
  const router = useRouter();
  const urlParams = useSearchParams();
  const urlOrderId = urlParams.get("orderId")?.trim() ?? "";

  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [scannerPortalMounted, setScannerPortalMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPreview | null>(null);
  const [scanMessage, setScanMessage] = useState("");
  const [phoneLookup, setPhoneLookup] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [summaryByType, setSummaryByType] = useState<SummaryRow[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cameraState, setCameraState] = useState<
    "idle" | "starting" | "live" | "error"
  >("idle");
  const [qrVerify, setQrVerify] = useState<
    "idle" | "verifying" | "found" | "error"
  >("idle");
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [bonusModalSource, setBonusModalSource] = useState<"QR" | "PHONE">(
    "PHONE"
  );
  const [modalAmount, setModalAmount] = useState("");
  const [modalReason, setModalReason] = useState("");
  const verifyGen = useRef(0);
  const operationRef = useRef<HTMLElement | null>(null);
  const prevScannerModalOpen = useRef(scannerModalOpen);
  const cameraScanActive =
    scannerModalOpen && qrVerify !== "verifying" && qrVerify !== "found";

  const historyQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(historyPage));
    p.set("pageSize", "30");
    if (selectedUser) p.set("userId", selectedUser.id);
    if (urlOrderId) p.set("orderId", urlOrderId);
    if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) p.set("dateFrom", dateFrom);
    if (dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) p.set("dateTo", dateTo);
    return p.toString();
  }, [historyPage, selectedUser, urlOrderId, dateFrom, dateTo]);

  useEffect(() => {
    const df = urlParams.get("dateFrom")?.trim() ?? "";
    const dt = urlParams.get("dateTo")?.trim() ?? "";
    if (df && dt) {
      setDateFrom(df);
      setDateTo(dt);
    }
  }, [urlParams]);

  useEffect(() => {
    setScannerPortalMounted(true);
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/admin/bonus-history?${historyQuery}`);
    if (!res.ok) return;
    const data = await res.json();
    setHistory(data.rows ?? []);
    setHistoryTotal(data.total ?? 0);
    setSummaryByType(data.summaryByType ?? []);
  }, [historyQuery]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (prevScannerModalOpen.current && !scannerModalOpen) {
      setCameraState("idle");
      verifyGen.current += 1;
      setQrVerify((prev) => (prev === "verifying" ? "idle" : prev));
    }
    prevScannerModalOpen.current = scannerModalOpen;
  }, [scannerModalOpen]);

  useEffect(() => {
    if (!scannerModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScannerModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [scannerModalOpen]);

  const onQrDecoded = useCallback(async (token: string) => {
    const seq = ++verifyGen.current;
    setScanMessage("");
    setLookupError("");
    setQrVerify("verifying");
    const res = await fetch("/api/admin/bonus/parse-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));
    if (verifyGen.current !== seq) return;
    if (!res.ok) {
      setQrVerify("error");
      setScanMessage(data.error || "Не удалось прочитать QR");
      return;
    }
    setQrVerify("found");
    setSelectedUser(data.user);
    setScanMessage(`Клиент найден: ${data.user.phone}`);
    setScannerModalOpen(false);
    setBonusModalSource("QR");
    setModalAmount("");
    setModalReason("");
    setBonusModalOpen(true);
  }, []);

  const lookupByPhone = async () => {
    setLookupError("");
    const phone = phoneLookup.trim();
    if (!phone) {
      setLookupError("Введите телефон");
      return;
    }
    const res = await fetch(
      `/api/admin/users/by-phone?phone=${encodeURIComponent(phone)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLookupError(data.error || "Не найден");
      setSelectedUser(null);
      return;
    }
    setSelectedUser(data.user);
    setQrVerify("found");
    setScanMessage(`Клиент найден: ${data.user.phone}`);
    setScannerModalOpen(false);
    setBonusModalSource("PHONE");
    setModalAmount("");
    setModalReason("");
    setBonusModalOpen(true);
  };

  const submitAdjustDelta = async (
    deltaValue: number,
    source: "QR" | "MANUAL",
    reasonText: string
  ) => {
    if (!selectedUser) return;
    const d = Math.trunc(deltaValue);
    if (!Number.isFinite(d) || d === 0) {
      setLookupError("Укажите ненулевое целое число баллов");
      return;
    }
    setSubmitting(true);
    setLookupError("");
    const res = await fetch("/api/admin/bonus/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        delta: d,
        reason: reasonText,
        source,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setLookupError(data.error || "Ошибка");
      return;
    }
    if (data.user) setSelectedUser(data.user);
    setDelta("");
    setReason("");
    setModalAmount("");
    setModalReason("");
    setBonusModalOpen(false);
    setQrVerify("idle");
    await loadHistory();
  };

  const submitAdjust = async (source: "QR" | "MANUAL") => {
    if (!selectedUser) return;
    const d = Math.trunc(Number(delta.replace(",", ".")));
    if (!Number.isFinite(d) || d === 0) {
      setLookupError(
        "Укажите целое число баллов (положительное — начислить, отрицательное — списать)"
      );
      return;
    }
    await submitAdjustDelta(d, source, reason);
  };

  const submitModal = async (sign: 1 | -1) => {
    const amount = Math.trunc(Number(modalAmount.replace(",", ".")));
    if (!Number.isFinite(amount) || amount <= 0) {
      setLookupError("Введите целое число баллов больше нуля");
      return;
    }
    const src = bonusModalSource === "QR" ? "QR" : "MANUAL";
    await submitAdjustDelta(sign * amount, src, modalReason);
  };

  const onBonusModalOpenChange = (open: boolean) => {
    setBonusModalOpen(open);
    if (!open) {
      setQrVerify("idle");
      setLookupError("");
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Бонусы</h1>
        <p className="mt-1 text-sm text-text-2">
          Сканирование QR клиента, ручное начисление или списание, журнал операций.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface-1 p-3 sm:p-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Camera className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-sm font-semibold leading-tight text-text">Сканер QR</h2>
                <p className="text-xs leading-snug text-text-2">
                  Откройте камеру и наведите на QR из «Бонусы» в приложении клиента — не банковский
                  платёжный код.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setQrVerify("idle");
                setScanMessage("");
                setScannerModalOpen(true);
              }}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand shadow-sm transition hover:bg-brand/20 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Открыть сканер QR-кода"
            >
              <ScanLine
                className="h-5 w-5 transition group-hover:scale-105"
                strokeWidth={2.25}
                aria-hidden
              />
            </button>
          </div>
          {scanMessage && !scannerModalOpen ? (
            <p
              className={cn(
                "mt-2 border-t border-border/50 pt-2 text-xs leading-snug",
                qrVerify === "error" ? "text-destructive" : "text-text-2"
              )}
            >
              {scanMessage}
            </p>
          ) : null}
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-surface-1 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Search className="h-4 w-4" />
            По телефону
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="+79991234567"
              value={phoneLookup}
              onChange={(e) => setPhoneLookup(e.target.value)}
            />
            <Button type="button" variant="secondary" onClick={lookupByPhone}>
              Найти
            </Button>
          </div>
        </section>
      </div>

      {scannerPortalMounted && scannerModalOpen
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[200] cursor-default bg-black/45 backdrop-blur-sm"
                aria-label="Закрыть сканер"
                onClick={() => setScannerModalOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-bonus-scanner-title"
                className={cn(
                  "fixed z-[201] flex max-h-[90vh] w-full flex-col overflow-y-auto overflow-x-hidden border-border bg-surface-1 shadow-2xl outline-none",
                  "inset-x-0 bottom-0 rounded-t-[1.75rem] border-t border-x-0 border-b-0 pb-[env(safe-area-inset-bottom,0px)]",
                  "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(90vh,680px)] sm:w-[min(100vw-2rem,440px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:pb-0"
                )}
              >
                <button
                  type="button"
                  className="absolute right-3 top-3 z-10 rounded-full p-2 text-text-2 transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  onClick={() => setScannerModalOpen(false)}
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
                <div className="border-b border-border/60 bg-surface-1 px-5 pb-4 pt-6 pr-14">
                  <div className="space-y-2 text-left">
                    <h2
                      id="admin-bonus-scanner-title"
                      className="font-display text-lg font-semibold leading-tight tracking-tight text-text sm:text-xl"
                    >
                      Сканер QR
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-2">
                    Наведите камеру на QR из раздела «Бонусы» в профиле клиента в нашем приложении —
                    это не платёжный QR банка. Если код не читается, проверьте яркость экрана и расстояние
                    15–25 см.
                  </p>
                </div>
                <div className="border-b border-border/40 bg-surface-2/35 px-4 py-5 sm:px-5">
                  <BonusQrScanner
                    active={cameraScanActive}
                    onDecoded={onQrDecoded}
                    onCameraState={setCameraState}
                    className="max-w-full sm:max-w-md"
                  />
                </div>
                <div className="space-y-2 rounded-b-lg bg-[#efe8df]/95 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
                        cameraState === "live" &&
                          "border-emerald-500/35 bg-emerald-500/10 text-emerald-800",
                        cameraState === "starting" &&
                          "border-amber-500/35 bg-amber-500/10 text-amber-900",
                        cameraState === "error" &&
                          "border-destructive/35 bg-destructive/10 text-destructive",
                        cameraState === "idle" &&
                          "border-border bg-surface-1 text-text-2"
                      )}
                    >
                      {cameraState === "starting" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : null}
                      {cameraState === "live" ? (
                        <span
                          className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]"
                          aria-hidden
                        />
                      ) : null}
                      {cameraState === "error" ? (
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {cameraState === "idle" && cameraScanActive
                        ? "Ожидание камеры…"
                        : cameraState === "idle"
                          ? "Камера выключена"
                          : cameraState === "starting"
                            ? "Запуск…"
                            : cameraState === "live"
                              ? "Сканирование"
                              : "Ошибка камеры"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
                        qrVerify === "verifying" &&
                          "border-brand/30 bg-brand/5 text-brand",
                        qrVerify === "found" &&
                          "border-emerald-500/35 bg-emerald-500/10 text-emerald-800",
                        qrVerify === "error" &&
                          "border-destructive/35 bg-destructive/10 text-destructive",
                        qrVerify === "idle" && "border-border bg-surface-1 text-text-2"
                      )}
                    >
                      {qrVerify === "verifying" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : null}
                      {qrVerify === "found" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {qrVerify === "error" ? (
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {qrVerify === "idle"
                        ? "Код"
                        : qrVerify === "verifying"
                          ? "Проверка…"
                          : qrVerify === "found"
                            ? "Клиент найден"
                            : "Ошибка кода"}
                    </span>
                  </div>
                  {scanMessage ? (
                    <p
                      className={cn(
                        "text-sm",
                        qrVerify === "error" ? "text-destructive" : "text-text-2"
                      )}
                    >
                      {scanMessage}
                    </p>
                  ) : null}
                  {qrVerify === "found" && selectedUser ? (
                    <p className="text-sm text-emerald-800">
                      Клиент выбран — открыто окно операции. После закрытия нажмите кнопку сканера для
                      следующего гостя.
                    </p>
                  ) : null}
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      <Dialog open={bonusModalOpen} onOpenChange={onBonusModalOpenChange}>
        <DialogContent className="max-h-[min(90vh,640px)] w-[min(100vw-1.5rem,26rem)] gap-4 overflow-y-auto p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {bonusModalSource === "QR" ? "Клиент по QR" : "Клиент по телефону"}
            </DialogTitle>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-2 p-3 text-sm">
                <p className="font-medium">{selectedUser.name || "—"}</p>
                <p className="text-text-2">{selectedUser.phone}</p>
                <p className="mt-1 tabular-nums">
                  Баланс:{" "}
                  <span className="font-semibold text-brand">
                    {selectedUser.bonusPoints}
                  </span>
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modal-bonus-amount">Сумма (целое число баллов)</Label>
                <Input
                  id="modal-bonus-amount"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  placeholder="Например, 50"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modal-bonus-reason">Комментарий (необязательно)</Label>
                <Input
                  id="modal-bonus-reason"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  disabled={submitting}
                />
              </div>
              {lookupError ? (
                <p className="text-sm text-error">{lookupError}</p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  disabled={submitting || !selectedUser}
                  onClick={() => {
                    setLookupError("");
                    void submitModal(1);
                  }}
                >
                  Начислить
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={submitting || !selectedUser}
                  onClick={() => {
                    setLookupError("");
                    void submitModal(-1);
                  }}
                >
                  Списать
                </Button>
              </div>
              <p className="text-center text-xs text-text-2">
                Запись в журнале:{" "}
                {bonusModalSource === "QR" ? "«по QR»" : "«вручную»"}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-2">Нет данных клиента.</p>
          )}
        </DialogContent>
      </Dialog>

      <section
        ref={operationRef}
        className={cn(
          "space-y-4 rounded-lg border border-border bg-surface-1 p-4 transition-shadow duration-500",
          selectedUser &&
            "shadow-[0_0_0_2px_rgba(74,60,47,0.12),0_8px_28px_rgba(74,60,47,0.08)]"
        )}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Gift className="h-4 w-4" />
          Операция
        </div>
        {selectedUser ? (
          <div className="rounded-md bg-surface-2 p-3 text-sm">
            <p className="font-medium">{selectedUser.name || "—"}</p>
            <p className="text-text-2">{selectedUser.phone}</p>
            <p className="mt-1 tabular-nums">
              Баланс:{" "}
              <span className="font-semibold text-brand">
                {selectedUser.bonusPoints}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-2">
            После сканирования или поиска по телефону откроется окно начисления. Ниже — запасной
            ввод, если удобнее без модального окна.
          </p>
        )}
        {lookupError ? (
          <p className="text-sm text-error">{lookupError}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="bonus-delta">Баллы (+ начислить / − списать)</Label>
            <Input
              id="bonus-delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              disabled={!selectedUser || submitting}
            />
          </div>
          <div>
            <Label htmlFor="bonus-reason">Комментарий</Label>
            <Input
              id="bonus-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!selectedUser || submitting}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!selectedUser || submitting}
            onClick={() => submitAdjust("MANUAL")}
          >
            Применить (вручную)
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedUser || submitting}
            onClick={() => submitAdjust("QR")}
          >
            Записать как «по QR»
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold">Журнал</h2>
          <div className="flex flex-wrap gap-2">
            {selectedUser ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Сбросить клиента
              </Button>
            ) : null}
            {urlOrderId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/bonuses")}
              >
                Сбросить заказ
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface-2/40 p-3">
          <div>
            <Label htmlFor="bh-from" className="text-xs">
              С даты
            </Label>
            <Input
              id="bh-from"
              type="date"
              className="mt-1 h-9 w-[11rem]"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bh-to" className="text-xs">
              По дату
            </Label>
            <Input
              id="bh-to"
              type="date"
              className="mt-1 h-9 w-[11rem]"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setHistoryPage(1);
              const p = new URLSearchParams();
              if (dateFrom) p.set("dateFrom", dateFrom);
              if (dateTo) p.set("dateTo", dateTo);
              if (urlOrderId) p.set("orderId", urlOrderId);
              router.push(`/admin/bonuses?${p.toString()}`);
            }}
          >
            Применить даты
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setHistoryPage(1);
              router.push(urlOrderId ? `/admin/bonuses?orderId=${urlOrderId}` : "/admin/bonuses");
            }}
          >
            Сбросить даты
          </Button>
        </div>

        {urlOrderId ? (
          <p className="text-xs text-brand">
            Фильтр по заказу: <span className="font-mono">{urlOrderId}</span>
          </p>
        ) : null}

        {summaryByType.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summaryByType.map((s) => (
              <div
                key={s.type}
                className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm shadow-sm"
              >
                <span className="text-text-2">{bonusTypeLabel(s.type)}: </span>
                <span className="font-semibold tabular-nums">
                  {(s._sum.amount ?? 0).toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-xs text-text-2">
          Всего записей: {historyTotal}
          {selectedUser ? " (фильтр по клиенту)" : ""}
          {urlOrderId ? " (фильтр по заказу)" : ""}
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-text-2">
              <tr>
                <th className="p-2">Дата</th>
                <th className="p-2">Клиент</th>
                <th className="p-2">Тип</th>
                <th className="p-2">Сумма</th>
                <th className="p-2">Заказ</th>
                <th className="p-2">Кто</th>
                <th className="p-2">Описание</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="whitespace-nowrap p-2 text-text-2">
                    {new Date(row.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-2">{row.user.phone}</td>
                  <td className="p-2">{bonusTypeLabel(row.type)}</td>
                  <td className="p-2 tabular-nums font-medium">{row.amount}</td>
                  <td className="p-2">
                    {row.order ? (
                      <Link
                        href={`/admin/orders?highlight=${encodeURIComponent(row.order.orderNumber)}`}
                        className="text-brand hover:underline"
                      >
                        {row.order.orderNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-2 text-text-2">
                    {row.createdBy?.phone ?? "—"}
                  </td>
                  <td
                    className="max-w-xs truncate p-2 text-text-2"
                    title={row.description ?? ""}
                  >
                    {row.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={historyPage <= 1}
            onClick={() => setHistoryPage((p) => p - 1)}
          >
            Назад
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={historyPage * 30 >= historyTotal}
            onClick={() => setHistoryPage((p) => p + 1)}
          >
            Вперёд
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function AdminBonusesPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-8 w-40 rounded bg-surface-2" />
          <div className="h-48 rounded-xl bg-surface-2" />
        </div>
      }
    >
      <AdminBonusesInner />
    </Suspense>
  );
}
