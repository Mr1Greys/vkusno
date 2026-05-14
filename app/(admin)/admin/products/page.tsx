"use client";

import { useState, useEffect, useMemo } from "react";
import type { Product } from "@/types";
import { Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { readResponseJson } from "@/lib/read-response-json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CatalogTab = "BAKERY" | "RESTAURANT";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  catalog: CatalogTab;
};

type AdminProduct = Product & {
  category?: AdminCategory;
};

function formatFailedApi(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) return fallback;
  const o = body as { error?: unknown; details?: unknown };
  const main = typeof o.error === "string" ? o.error : fallback;
  if (typeof o.details === "string" && o.details.trim()) {
    const oneLine = o.details.replace(/\s+/g, " ").trim().slice(0, 420);
    return `${main} (${oneLine})`;
  }
  return main;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tab, setTab] = useState<CatalogTab>("BAKERY");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/categories"),
        ]);
        const p = await readResponseJson<unknown>(pRes);
        const c = await readResponseJson<unknown>(cRes);

        if (cancelled) return;

        const errPayload = (x: unknown) =>
          typeof x === "object" &&
          x !== null &&
          "error" in x &&
          typeof (x as { error: unknown }).error === "string"
            ? (x as { error: string }).error
            : null;

        if (!pRes.ok) {
          setLoadError(
            formatFailedApi(p.body, errPayload(p.body) ?? `Товары: ${pRes.status}`)
          );
          setProducts([]);
          setCategories([]);
        } else if (!cRes.ok) {
          setLoadError(
            formatFailedApi(
              c.body,
              errPayload(c.body) ?? `Категории: ${cRes.status}`
            )
          );
          setProducts([]);
          setCategories([]);
        } else if (p.body == null || c.body == null) {
          setLoadError(
            "Пустой ответ сервера. Перезапустите Next.js и проверьте, что миграции применены (npx prisma migrate deploy)."
          );
          setProducts([]);
          setCategories([]);
        } else {
          setLoadError(null);
          setProducts(Array.isArray(p.body) ? (p.body as AdminProduct[]) : []);
          setCategories(
            Array.isArray(c.body) ? (c.body as AdminCategory[]) : []
          );
        }
      } catch {
        if (!cancelled) {
          setLoadError("Не удалось связаться с сервером.");
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.catalog === tab),
    [categories, tab]
  );

  const defaultCategoryId = useMemo(() => {
    return categoryOptions[0]?.id ?? "";
  }, [categoryOptions]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.category?.catalog === tab),
    [products, tab]
  );

  const setCatalogTab = (next: CatalogTab) => {
    setTab(next);
    setShowForm(false);
    setEditingProduct(null);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError(null);
    const form = e.currentTarget;
    const stockRaw = (
      form.elements.namedItem("stockQuantity") as HTMLInputElement
    ).value.trim();
    const stockQuantity =
      stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0);

    const priceRaw = (form.elements.namedItem("price") as HTMLInputElement)
      .value.trim();
    const parsedPrice = parseInt(priceRaw, 10);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setSaveError(
        "Укажите целое неотрицательное число цены в копейках (например 160 ₽ = 16000)."
      );
      return;
    }
    const price = Math.floor(parsedPrice);

    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement)
        .value,
      price,
      weight: (form.elements.namedItem("weight") as HTMLInputElement).value,
      imageUrl:
        (form.elements.namedItem("imageUrl") as HTMLInputElement).value.trim() ||
        null,
      stockQuantity,
      isHalal: (form.elements.namedItem("isHalal") as HTMLInputElement).checked,
      isAvailable: (form.elements.namedItem("isAvailable") as HTMLInputElement)
        .checked,
      categoryId: (form.elements.namedItem("categoryId") as HTMLSelectElement)
        .value,
    };

    const method = editingProduct ? "PATCH" : "POST";

    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingProduct ? { id: editingProduct.id, ...data } : data
      ),
    });

    if (!res.ok) {
      const { body } = await readResponseJson<{ error?: string }>(res);
      setSaveError(
        (body && typeof body.error === "string" && body.error) ||
          "Не удалось сохранить"
      );
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    const listRes = await fetch("/api/admin/products");
    const { body: listBody } = await readResponseJson<unknown>(listRes);
    if (listRes.ok && Array.isArray(listBody)) {
      setProducts(listBody as AdminProduct[]);
    }
  };

  const refreshProducts = async () => {
    const listRes = await fetch("/api/admin/products");
    const { body: listBody } = await readResponseJson<unknown>(listRes);
    if (listRes.ok && Array.isArray(listBody)) {
      setProducts(listBody as AdminProduct[]);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    const ok = window.confirm(
      `Удалить карточку «${product.name}»? Действие необратимо (если товар ни разу не был в заказах).`
    );
    if (!ok) return;
    setDeleteError(null);
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const { body } = await readResponseJson<{ error?: string }>(res);
      if (!res.ok) {
        setDeleteError(
          (body && typeof body.error === "string" && body.error) ||
            "Не удалось удалить"
        );
        return;
      }
      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setShowForm(false);
      }
      await refreshProducts();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  const formKey = `${tab}-${editingProduct?.id ?? "new"}`;

  return (
    <div>
      {loadError ? (
        <div
          className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}
      {deleteError ? (
        <div
          className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {deleteError}
        </div>
      ) : null}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">Товары</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setSaveError(null);
            setShowForm(true);
          }}
        >
          Добавить товар
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setCatalogTab("BAKERY")}
          className={cn(
            "rounded-t-md px-4 py-2 text-sm font-semibold transition-colors",
            tab === "BAKERY"
              ? "border-b-2 border-brand text-brand"
              : "text-text-2 hover:text-text"
          )}
        >
          Карточки Пекарни
        </button>
        <button
          type="button"
          onClick={() => setCatalogTab("RESTAURANT")}
          className={cn(
            "rounded-t-md px-4 py-2 text-sm font-semibold transition-colors",
            tab === "RESTAURANT"
              ? "border-b-2 border-brand text-brand"
              : "text-text-2 hover:text-text"
          )}
        >
          Карточки Ресторана
        </button>
      </div>

      {showForm && (
        <form
          key={formKey}
          onSubmit={handleSave}
          className="mb-6 space-y-4 rounded-lg border border-border bg-surface-1 p-4"
        >
          <h2 className="font-semibold">
            {editingProduct ? "Редактировать" : "Новый товар"}{" "}
            <span className="font-normal text-text-2">
              ({tab === "BAKERY" ? "пекарня" : "ресторан"})
            </span>
          </h2>
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-text-2">
              Нет категорий для этой витрины. Выполните{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">
                npx prisma db seed
              </code>{" "}
              после миграций.
            </p>
          ) : null}
          {saveError ? (
            <p className="text-sm font-medium text-destructive">{saveError}</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Название</Label>
              <Input name="name" defaultValue={editingProduct?.name} required />
            </div>
            <div>
              <Label>Категория</Label>
              <select
                name="categoryId"
                defaultValue={
                  editingProduct?.categoryId &&
                  categoryOptions.some((c) => c.id === editingProduct.categoryId)
                    ? editingProduct.categoryId
                    : defaultCategoryId
                }
                className="h-9 w-full rounded-md border border-border px-3"
                required
                disabled={categoryOptions.length === 0}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {!cat.isActive ? " (выкл.)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Цена в копейках</Label>
              <Input
                name="price"
                type="number"
                min={0}
                step={1}
                placeholder="16000 (= 160 ₽)"
                defaultValue={editingProduct?.price}
                required
              />
              <p className="mt-1 text-xs text-text-2">
                В базе и на сайте цена в копейках: 160&nbsp;₽ → <strong>16000</strong>.
              </p>
            </div>
            <div>
              <Label>Вес</Label>
              <Input name="weight" defaultValue={editingProduct?.weight || ""} />
            </div>
            <div className="md:col-span-2">
              <Label>URL изображения</Label>
              <Input
                name="imageUrl"
                placeholder="/images/…"
                defaultValue={editingProduct?.imageUrl || ""}
              />
            </div>
            <div>
              <Label>Остаток (пусто = без лимита)</Label>
              <Input
                name="stockQuantity"
                type="number"
                min={0}
                placeholder="не ведём"
                defaultValue={
                  editingProduct?.stockQuantity != null
                    ? String(editingProduct.stockQuantity)
                    : ""
                }
              />
            </div>
          </div>
          <div>
            <Label>Описание</Label>
            <Input
              name="description"
              defaultValue={editingProduct?.description || ""}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isHalal"
                defaultChecked={editingProduct?.isHalal}
              />
              Халяль
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={editingProduct?.isAvailable ?? true}
              />
              Доступен
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={categoryOptions.length === 0}>
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
                setSaveError(null);
              }}
            >
              Отмена
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-1 p-4"
          >
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-text-2">
                {formatPrice(product.price)} | {product.weight || "—"}{" "}
                {product.isHalal ? "· Халяль " : ""}
                {product.stockQuantity != null
                  ? `· Остаток: ${product.stockQuantity}`
                  : "· Остаток: —"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTab(product.category?.catalog ?? "BAKERY");
                  setEditingProduct(product);
                  setSaveError(null);
                  setShowForm(true);
                }}
              >
                Редактировать
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={deletingId === product.id}
                onClick={() => void handleDelete(product)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
