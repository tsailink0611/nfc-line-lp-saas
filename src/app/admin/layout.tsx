import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // admin_userの情報を取得
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*, company:companies(*)")
    .eq("auth_user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={adminUser?.name ?? "管理者"}
        companyName={adminUser?.company?.company_name ?? ""}
        role={adminUser?.role ?? "admin"}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
