import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-2 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-text-2">
            © {new Date().getFullYear()} Все права защищены
          </div>
          <div className="flex gap-4">
            <Link href="/admin-login" className="text-sm text-text-3 hover:text-brand">
              Админ-панель
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}