import { SuperCompanyForm } from "@/components/admin/super-company-form";
import { createCompany } from "@/app/admin/super/actions";

export default function NewCompanyPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">新規会社登録</h2>
      <p className="mt-1 text-sm text-gray-500">
        新しいクライアント会社を登録します。登録後にクライアント用の管理者アカウントを発行してください。
      </p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SuperCompanyForm action={createCompany} />
      </div>
    </div>
  );
}
