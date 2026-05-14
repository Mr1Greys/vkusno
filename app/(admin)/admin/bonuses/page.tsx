"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Gift, Search, Camera, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { BonusQrScanner } from "@/components/admin/BonusQrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export default function AdminBonusesPage() {
  const [scannerOn, setScannerOn] = useState(false);
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
  const [cameraState, setCameraState] = useState<
    "idle" | "starting" | "live" | "error"
  >("idle");
  const [qrVerify, setQrVerify] = useState<
    "idle" | "verifying" | "found" | "error"
  >("idle");
  const verifyGen = useRef(0);
  const operationRef = useRef<HTMLElement | null>(null);
  const prevScannerOn = useRef(scannerOn);

  const historyQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(historyPage));
    p.set("pageSize", "30");
    if (selectedUser) p.set("userId", selectedUser.id);
    return p.toString();
  }, [historyPage, selectedUser]);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/admin/bonus-history?${historyQuery}`);
    if (!res.ok) return;
    const data = await res.json();
    setHistory(data.rows ?? []);
    setHistoryTotal(data.total ?? 0);
  }, [historyQuery]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (prevScannerOn.current && !scannerOn) {
      setCameraState("idle");
      verifyGen.current += 1;
      setQrVerify((prev) => (prev === "verifying" ? "idle" : prev));
    }
    prevScannerOn.current = scannerOn;
  }, [scannerOn]);

  const focusOperation = useCallback(() => {
    window.requestAnimationFrame(() => {
      operationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const onQrDecoded = async (token: string) => {
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
    focusOperation();
  };

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
    focusOperation();
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
    setSubmitting(true);
    setLookupError("");
    const res = await fetch("/api/admin/bonus/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        delta: d,
        reason,
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
    await loadHistory();
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
        <section className="space-y-4 rounded-lg border border-border bg-surface-1 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Camera className="h-4 w-4" />
            Сканер QR
          </div>
          <p className="text-xs leading-relaxed text-text-2">
            Наведите камеру на QR из раздела «Бонусы» в профиле клиента в нашем приложении —
            это не платёжный QR банка. Если код не читается, проверьте яркость экрана и
            расстояние 15–25 см.
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scannerOn}
              onChange={(e) => setScannerOn(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Включить камеру
          </label>
          <BonusQrScanner
            active={scannerOn}
            onDecoded={onQrDecoded}
            onCameraState={setCameraState}
          />
          <div className="space-y-2 rounded-xl border border-border/80 bg-surface-2/60 p-3">
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
                {cameraState === "idle" && !scannerOn
                  ? "Камера выключена"
                  : cameraState === "idle"
                    ? "Камера"
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
              <div className="flex gap-3 rounded-lg border border-brand/20 bg-surface-1 p-3 text-sm shadow-sm">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <div className="space-y-1">
                  <p className="font-semibold text-text">
                    Готово к операции
                  </p>
                  <p className="text-text-2">
                    Ниже введите сумму баллов (положительное число — начислить) и нажмите
                    «Применить» или «Записать как по QR».
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={focusOperation}
                  >
                    К форме начисления
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
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

      <section
        ref={operationRef}
        className={cn(
          "space-y-4 rounded-lg border border-border bg-surface-1 p-4 transition-shadow duration-500",
          qrVerify === "found" &&
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
            Сначала отсканируйте QR или найдите клиента по телефону.
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
          {selectedUser ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(null)}
            >
              Показать всех
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-text-2">
          Всего записей: {historyTotal}
          {selectedUser ? " (фильтр по клиенту)" : ""}
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
                  <td className="p-2">{row.type}</td>
                  <td className="p-2 tabular-nums font-medium">{row.amount}</td>
                  <td className="p-2">
                    {row.order ? (
                      <Link
                        href="/admin/orders"
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
