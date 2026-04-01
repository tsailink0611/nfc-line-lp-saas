import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SuperAccountForm } from "@/components/admin/super-account-form";
import { createAdminAccount } from "@/app/admin/super/actions";

type Props = {
  searchParams: Promise<{ company_id?: string }>;
};

export default async function NewAccountPage({ searchParams }: Props) {
  const { company_id } = await searchParams;

  if (!company_id) redirect("/admin/super");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, company_name")
    .eq("id", company_id)
    .single();

  if (!company) redirect("/admin/super");

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">管理者アカウント発行</h2>
      <p className="mt-1 text-sm text-gray-500">
        クライアント本部用のログインアカウントを発行します。
      </p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SuperAccountForm
          companyId={company.id}
          companyName={company.company_name}
          action={createAdminAccount}
        />
      </div>
    </div>
  );
}
