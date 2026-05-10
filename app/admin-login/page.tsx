"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+79990000000");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      setError("Неверный телефон или пароль");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-surface-1 p-8 shadow-lg">
        <h1 className="text-3xl font-display font-bold mb-4">
          Админ вход
        </h1>
        <p className="text-sm text-text-2 mb-6">
          Войдите под админским логином, чтобы открыть панель управления.
        </p>

        <div className="rounded-2xl border border-border bg-surface-2 p-4 mb-6 text-sm text-text-2">
          <p className="font-medium">Тестовые данные</p>
          <p>Телефон: <span className="font-semibold">+79990000000</span></p>
          <p>Пароль: <span className="font-semibold">admin123</span></p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-sm text-error">{error}</p>}

          <div>
            <Label htmlFor="admin-phone">Телефон</Label>
            <Input
              id="admin-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="admin-password">Пароль</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Вход..." : "Войти в админку"}
          </Button>
        </form>
      </div>
    </div>
  );
}
