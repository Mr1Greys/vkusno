import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminChrome } from "@/components/admin/AdminChrome";

/** На этапе `next build` на Vercel нет доступа к БД — не предрендерим админку. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-text-2">
          Загрузка…
        </div>
      }
    >
      <AdminChrome>{children}</AdminChrome>
    </Suspense>
  );
}
