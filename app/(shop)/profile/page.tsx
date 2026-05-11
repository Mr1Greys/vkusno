"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Pencil,
  LogOut,
  Gift,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  History,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface BonusRow {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

function bonusTypeLabel(type: string): string {
  switch (type) {
    case "EARNED":
      return "Начисление";
    case "SPENT":
      return "Списание";
    case "MANUAL":
      return "Корректировка";
    case "REFERRAL":
      return "Реферал";
    default:
      return type;
  }
}

function formatBonusPoints(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bonusRows, setBonusRows] = useState<BonusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"choice" | "login" | "register">(
    "choice"
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [editContacts, setEditContacts] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone);
      Promise.all([
        fetch("/api/profile/orders").then((r) => r.json()),
        fetch("/api/profile/bonus-history").then((r) => r.json()),
      ])
        .then(([ordersData, bonusData]) => {
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          setBonusRows(Array.isArray(bonusData) ? bonusData : []);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    if (!res.ok) {
      setError("Неверный телефон или пароль");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    setUser(data);
    setAuthMode("choice");
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name: regName.trim() || undefined,
        email: regEmail.trim() || undefined,
        password: regPassword.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка регистрации");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    setUser(data);
    setAuthMode("choice");
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setBonusRows([]);
    router.push("/");
  };

  const openContactDialog = () => {
    if (!user) return;
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setProfilePhone(user.phone);
    setProfileMessage("");
    setEditContacts(true);
  };

  const cancelEditContacts = () => {
    if (!user) return;
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setProfilePhone(user.phone);
    setProfileMessage("");
    setEditContacts(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileName,
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileMessage(data.error || "Ошибка сохранения");
      setProfileSaving(false);
      return;
    }

    const data = await res.json();
    setUser(data);
    setProfileMessage("Сохранено");
    setProfileSaving(false);
    setEditContacts(false);
  };

  if (!user) {
    return (
      <div className="relative mx-auto max-w-lg px-4 py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-48 max-w-md rounded-full bg-accent/[0.09] blur-3xl"
        />
        {authMode === "choice" && (
          <div className="relative space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-1 shadow-card ring-1 ring-border/60">
              <User className="h-8 w-8 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-text md:text-3xl">
                Профиль
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-text-2">
                Войдите или зарегистрируйтесь — заказы, бонусы и контакты в одном
                месте.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => setAuthMode("login")}
                className="h-12 rounded-full px-8 text-[15px] font-semibold"
              >
                Войти
              </Button>
              <Button
                variant="outline"
                onClick={() => setAuthMode("register")}
                className="h-12 rounded-full border-border px-8 text-[15px] font-semibold"
              >
                Регистрация
              </Button>
            </div>
          </div>
        )}

        {authMode === "login" && (
          <form onSubmit={handleLogin} className="relative mx-auto max-w-sm space-y-5">
            <h1 className="font-display text-2xl font-bold">Вход</h1>
            {error && (
              <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-phone">Телефон</Label>
              <Input
                id="login-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="h-12 rounded-2xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-pass">Пароль</Label>
              <Input
                id="login-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-12 rounded-2xl"
                required
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-full" disabled={submitting}>
              {submitting ? "Вход..." : "Войти"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-full"
              onClick={() => {
                setAuthMode("choice");
                setError("");
              }}
            >
              Назад
            </Button>
          </form>
        )}

        {authMode === "register" && (
          <form
            onSubmit={handleRegister}
            className="relative mx-auto max-w-sm space-y-5"
          >
            <h1 className="font-display text-2xl font-bold">Регистрация</h1>
            <p className="text-[14px] leading-relaxed text-text-2">
              Укажите телефон. Пароль и почта — по желанию, для входа с других
              устройств.
            </p>
            {error && (
              <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Телефон</Label>
              <Input
                id="reg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="h-12 rounded-2xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-name">Имя</Label>
              <Input
                id="reg-name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Как к вам обращаться"
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                type="email"
                placeholder="Необязательно"
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-pass">Пароль</Label>
              <Input
                id="reg-pass"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                type="password"
                placeholder="Необязательно"
                className="h-12 rounded-2xl"
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-full" disabled={submitting}>
              {submitting ? "Регистрация..." : "Создать аккаунт"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-full"
              onClick={() => {
                setAuthMode("choice");
                setError("");
              }}
            >
              Назад
            </Button>
          </form>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 text-sm text-text-2">Загрузка профиля…</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-w-0 max-w-2xl overflow-x-hidden px-4 pb-32 pt-8 md:pb-16 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_140%_90%_at_50%_-15%,rgba(245,166,35,0.14),transparent_58%)]"
      />

      <header className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-coffee">
            Личный кабинет
          </p>
          <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-text md:text-[2rem]">
            Профиль
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-2 rounded-full border-border/80 px-5 text-[14px] font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Выйти
        </Button>
      </header>

      {/* Карточка пользователя: имя + вход в редактирование контактов */}
      <section className="relative mb-6 overflow-hidden rounded-[28px] border border-border/60 bg-surface-1 p-5 shadow-[0_28px_70px_-38px_rgba(74,60,47,0.35)] ring-1 ring-black/[0.03] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-[1.35rem] font-bold text-[#FFFCF9] shadow-inner">
              {(user.name?.[0] ?? user.phone?.[0] ?? "?").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-tight text-text">
                {user.name?.trim() || "Клиент"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 shrink-0 gap-1.5 rounded-full border-border/80 px-3 text-[13px] font-semibold text-coffee sm:h-11 sm:gap-2 sm:px-4 sm:text-[14px]"
            onClick={openContactDialog}
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
            Редактировать
          </Button>
        </div>
      </section>

      <Dialog open={editContacts} onOpenChange={(open) => !open && cancelEditContacts()}>
        <DialogContent className="max-h-[min(90vh,720px)] gap-0 overflow-y-auto rounded-[24px] border-border/70 p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border/50 px-6 pb-4 pt-6 text-left">
            <DialogTitle className="font-display text-xl font-bold text-text">
              Контакты
            </DialogTitle>
            <p className="pt-2 text-[13px] leading-relaxed text-text-2">
              Имя, почта и телефон не показываем на главной странице кабинета — только
              здесь. Подтверждение по SMS не требуется.
            </p>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-5 px-6 pb-6 pt-5">
            {profileMessage && (
              <p
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  profileMessage === "Сохранено"
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                )}
              >
                {profileMessage}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="p-name">Имя</Label>
              <Input
                id="p-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Почта</Label>
              <Input
                id="p-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="h-12 rounded-2xl"
                placeholder="Необязательно"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Телефон</Label>
              <Input
                id="p-phone"
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="h-12 rounded-2xl"
                required
              />
            </div>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-6"
                onClick={() => cancelEditContacts()}
                disabled={profileSaving}
              >
                Отмена
              </Button>
              <Button type="submit" className="h-12 rounded-full px-8" disabled={profileSaving}>
                {profileSaving ? "Сохранение…" : "Сохранить"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Бонусы */}
      <section className="relative mb-8 overflow-hidden rounded-[28px] border border-accent/25 bg-gradient-to-br from-[#FFFCF9] via-cream to-accent/[0.08] shadow-[0_32px_80px_-44px_rgba(245,166,35,0.45)] ring-1 ring-brand/10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee ring-1 ring-border/40">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
                Бонусная программа
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-2">Баланс</p>
                <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight text-brand md:text-5xl">
                  {formatBonusPoints(user.bonusPoints)}
                </p>
                <p className="mt-1 text-sm text-text-2">бонусов на счёте</p>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-text-2">
                1 бонус = 1 ₽ при оплате заказа. Начисляем от суммы покупки по
                правилам программы.
              </p>
            </div>
            <div className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center self-start rounded-3xl bg-brand text-[#FFFCF9] shadow-[0_16px_40px_-12px_rgba(74,60,47,0.55)] ring-4 ring-brand/15">
              <Gift className="h-10 w-10" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <div className="relative mt-8 border-t border-border/50 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-coffee" strokeWidth={2} />
              <h3 className="font-display text-base font-bold text-text">
                История операций
              </h3>
            </div>
            {bonusRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-white/50 px-4 py-10 text-center">
                <p className="text-[15px] font-medium text-text">
                  Пока без движений
                </p>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-2">
                  После заказов здесь появятся начисления и списания бонусов.
                </p>
              </div>
            ) : (
              <ul className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1">
                {bonusRows.map((row) => {
                  const spent = row.type === "SPENT";
                  return (
                    <li
                      key={row.id}
                      className="flex gap-3 rounded-2xl border border-border/40 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                          spent
                            ? "bg-error/[0.07] text-error ring-error/15"
                            : "bg-success/[0.08] text-success ring-success/20"
                        )}
                      >
                        {spent ? (
                          <ArrowDownRight className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-text">
                            {bonusTypeLabel(row.type)}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 text-[15px] font-bold tabular-nums",
                              spent ? "text-error" : "text-success"
                            )}
                          >
                            {spent ? "−" : "+"}
                            {formatBonusPoints(row.amount)}
                          </span>
                        </div>
                        {row.description ? (
                          <p className="mt-1 text-[13px] leading-snug text-text-2">
                            {row.description}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-3">
                          {new Date(row.createdAt).toLocaleString("ru", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Заказы */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <h2 className="font-display text-lg font-bold text-text">
            История заказов
          </h2>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-[24px] border border-border/60 bg-surface-1 px-6 py-14 text-center shadow-card ring-1 ring-black/[0.03]">
            <p className="text-[15px] font-medium text-text">Заказов пока нет</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-text-2">
              Загляните в меню пекарни или ресторана — соберём заказ с теплом.
            </p>
            <Button
              className="mt-6 rounded-full px-8"
              onClick={() => router.push("/menu")}
            >
              В меню
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-4 rounded-[22px] border border-border/60 bg-surface-1 p-4 shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-card"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-text">{order.orderNumber}</p>
                  <p className="mt-1 text-[13px] text-text-2">
                    {new Date(order.createdAt).toLocaleDateString("ru", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-brand">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="mt-0.5 text-[12px] capitalize text-text-3">
                    {order.status.toLowerCase()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
