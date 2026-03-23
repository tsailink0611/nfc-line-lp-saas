import { createClient } from "@/lib/supabase/server";
import { SettingsCompanyForm } from "@/components/admin/settings-company-form";
import { SettingsLpForm } from "@/components/admin/settings-lp-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("company_id")
    .single();

  if (!adminUser) return <p>権限がありません</p>;

  const [{ data: company }, { data: lpSettings }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", adminUser.company_id).single(),
    supabase.from("lp_settings").select("*").eq("company_id", adminUser.company_id).single(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">会社情報</h2>
        <SettingsCompanyForm company={company} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">LP設定</h2>
        <SettingsLpForm companyId={adminUser.company_id} lpSettings={lpSettings} />
      </div>
    </div>
  );
}
