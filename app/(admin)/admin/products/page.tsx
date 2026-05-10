"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData.flatMap((c: any) => c.products?.length ? [c] : []));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      price: parseInt((form.elements.namedItem("price") as HTMLInputElement).value, 10),
      weight: (form.elements.namedItem("weight") as HTMLInputElement).value,
      isHalal: (form.elements.namedItem("isHalal") as HTMLInputElement).checked,
      isAvailable: (form.elements.namedItem("isAvailable") as HTMLInputElement).checked,
      categoryId: (form.elements.namedItem("categoryId") as HTMLSelectElement).value,
    };

    const url = editingProduct ? "/api/admin/products" : "/api/admin/products";
    const method = editingProduct ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduct ? { id: editingProduct.id, ...data } : data),
    });

    setShowForm(false);
    setEditingProduct(null);
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Товары</h1>
        <Button onClick={() => setShowForm(true)}>Добавить товар</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface-1 p-4 rounded-lg border border-border mb-6 space-y-4">
          <h2 className="font-semibold">{editingProduct ? "Редактировать" : "Новый товар"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Название</Label>
              <Input name="name" defaultValue={editingProduct?.name} required />
            </div>
            <div>
              <Label>Категория</Label>
              <select name="categoryId" defaultValue={editingProduct?.categoryId} className="w-full h-9 border border-border rounded-md px-3" required>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Цена (коп)</Label>
              <Input name="price" type="number" defaultValue={editingProduct?.price} required />
            </div>
            <div>
              <Label>Вес</Label>
              <Input name="weight" defaultValue={editingProduct?.weight || ""} />
            </div>
          </div>
          <div>
            <Label>Описание</Label>
            <Input name="description" defaultValue={editingProduct?.description || ""} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isHalal" defaultChecked={editingProduct?.isHalal} />
              Халяль
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isAvailable" defaultChecked={editingProduct?.isAvailable ?? true} />
              Доступен
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Сохранить</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
              Отмена
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-surface-1 p-4 rounded-lg border border-border flex justify-between items-center">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-text-2 text-sm">
                {formatPrice(product.price)} | {product.weight || "—"} | {product.isHalal && "Халяль "}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
              Редактировать
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}