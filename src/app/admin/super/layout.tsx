import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("name, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* スーパー管理ヘッダー */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-gray-500 transition hover:text-gray-700"
            >
              ← 管理画面に戻る
            </Link>
            <span className="text-gray-300">|</span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              SUPER ADMIN
            </span>
            <h1 className="text-base font-bold text-gray-900">全社管理</h1>
          </div>
          <span className="text-sm text-gray-500">{adminUser.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
