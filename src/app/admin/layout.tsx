import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { cookies } from "next/headers";

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

  // super_admin が別会社を閲覧中の場合、その会社名を表示
  const cookieStore = await cookies();
  const viewingCompanyId = adminUser?.role === "super_admin"
    ? cookieStore.get("super_viewing_company_id")?.value
    : undefined;

  let displayCompanyName = adminUser?.company?.company_name ?? "";
  if (viewingCompanyId) {
    const { data: viewingCompany } = await supabase
      .from("companies")
      .select("company_name")
      .eq("id", viewingCompanyId)
      .single();
    if (viewingCompany) displayCompanyName = viewingCompany.company_name;
  }

  // 会社コンテキストがあるか（通常adminは常にあり、super_adminは閲覧会社選択後）
  const hasCompanyContext =
    adminUser?.role !== "super_admin" || !!viewingCompanyId;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={adminUser?.name ?? "管理者"}
        companyName={displayCompanyName}
        role={adminUser?.role ?? "admin"}
        hasCompanyContext={hasCompanyContext}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
