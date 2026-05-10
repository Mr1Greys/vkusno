"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [iikoStatus, setIikoStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const keys = [
      "delivery_price",
      "delivery_free_from",
      "bonus_percent",
      "min_order_amount",
      "address",
      "phone",
      "iiko_api_login",
      "iiko_organization_id",
      "iiko_terminal_id",
      "iiko_is_enabled",
    ];

    for (const key of keys) {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings[key] || "" }),
      });
    }

    alert("Настройки сохранены");
  };

  const checkIikoConnection = async () => {
    setIikoStatus("Проверка...");
    try {
      const res = await fetch("/api/admin/iiko/check");
      const data = await res.json();
      setIikoStatus(data.ok ? `Подключено: ${data.orgName}` : `Ошибка: ${data.error}`);
    } catch {
      setIikoStatus("Ошибка подключения");
    }
  };

  const syncPayments = async () => {
    setSyncing(true);
    try {
      await fetch("/api/admin/iiko/sync-payments", { method: "POST" });
      alert("Способы оплаты синхронизированы");
    } catch {
      alert("Ошибка синхронизации");
    }
    setSyncing(false);
  };

  const syncMenu = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/iiko/sync-menu", { method: "POST" });
      const data = await res.json();
      alert(`Синхронизовано: ${data.matched} из ${data.total} товаров`);
    } catch {
      alert("Ошибка синхронизации");
    }
    setSyncing(false);
  };

  if (loading) return <div>Загрузка...</div>;

  const iikoEnabled = settings.iiko_is_enabled === "true";

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Настройки</h1>

      <div className="bg-surface-1 p-6 rounded-lg border border-border max-w-lg mb-6">
        <h2 className="font-semibold mb-4">Основные настройки</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Стоимость доставки (₽)</label>
            <Input
              value={settings.delivery_price || ""}
              onChange={(e) => setSettings({ ...settings, delivery_price: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Бесплатная доставка от (₽)</label>
            <Input
              value={settings.delivery_free_from || ""}
              onChange={(e) => setSettings({ ...settings, delivery_free_from: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Процент бонусов (%)</label>
            <Input
              value={settings.bonus_percent || ""}
              onChange={(e) => setSettings({ ...settings, bonus_percent: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Мин. сумма заказа (₽)</label>
            <Input
              value={settings.min_order_amount || ""}
              onChange={(e) => setSettings({ ...settings, min_order_amount: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Адрес</label>
            <Input
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Телефон</label>
            <Input
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <Button className="mt-6" onClick={handleSave}>
          Сохранить
        </Button>
      </div>

      <div className="bg-surface-1 p-6 rounded-lg border border-border max-w-lg">
        <h2 className="font-semibold mb-4">Интеграция iiko</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="iiko_enabled"
              checked={iikoEnabled}
              onChange={(e) =>
                setSettings({ ...settings, iiko_is_enabled: e.target.checked ? "true" : "false" })
              }
            />
            <label htmlFor="iiko_enabled" className="text-sm font-medium">
              Интеграция включена
            </label>
          </div>
          {iikoEnabled && (
            <>
              <div>
                <label className="text-sm font-medium">API Login (iiko.biz)</label>
                <Input
                  value={settings.iiko_api_login || ""}
                  onChange={(e) => setSettings({ ...settings, iiko_api_login: e.target.value })}
                  className="mt-1"
                  placeholder="your-api-login"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Organization ID</label>
                <Input
                  value={settings.iiko_organization_id || ""}
                  onChange={(e) => setSettings({ ...settings, iiko_organization_id: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Terminal Group ID</label>
                <Input
                  value={settings.iiko_terminal_id || ""}
                  onChange={(e) => setSettings({ ...settings, iiko_terminal_id: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={checkIikoConnection}>
                  Проверить подключение
                </Button>
                <Button variant="outline" onClick={syncPayments} disabled={syncing}>
                  Обновить способы оплаты
                </Button>
                <Button variant="outline" onClick={syncMenu} disabled={syncing}>
                  Синхронизировать меню
                </Button>
              </div>
              {iikoStatus && <p className="text-sm text-text-2 mt-2">{iikoStatus}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}