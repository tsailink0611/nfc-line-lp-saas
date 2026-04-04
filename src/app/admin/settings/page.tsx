import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { redirect } from "next/navigation";
import { SettingsCompanyForm } from "@/components/admin/settings-company-form";
import { SettingsLpForm } from "@/components/admin/settings-lp-form";

export default async function SettingsPage() {
  const ctx = await getCurrentAdminContext();
  if (!ctx) redirect("/admin/login");
  const supabase = await createClient();

  const [{ data: company }, { data: lpSettings }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", ctx.companyId).single(),
    supabase.from("lp_settings").select("*").eq("company_id", ctx.companyId).single(),
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
        <SettingsLpForm companyId={ctx.companyId} lpSettings={lpSettings} />
      </div>
    </div>
  );
}
