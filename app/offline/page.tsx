"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-7xl">🥐</span>
      <h1 className="font-display text-3xl text-brand">Нет подключения</h1>
      <p className="text-text-2 max-w-xs">
        Меню и корзина сохранены — вернитесь когда появится интернет
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-brand text-white px-6 py-3 rounded-2xl font-medium"
      >
        Попробовать снова
      </button>
    </div>
  );
}