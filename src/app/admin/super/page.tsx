import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getIndustryTemplate } from "@/lib/industry-templates";
import { switchViewingCompany } from "./actions";

export default async function SuperAdminPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select(
      "id, company_code, company_name, primary_color, secondary_color, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  const { data: lpSettings } = await supabase
    .from("lp_settings")
    .select("company_id, industry_type");

  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("company_id");

  const industryMap = new Map(
    (lpSettings ?? []).map((s) => [s.company_id, s.industry_type ?? "general"])
  );

  const accountCountMap = new Map<string, number>();
  for (const u of adminUsers ?? []) {
    accountCountMap.set(u.company_id, (accountCountMap.get(u.company_id) ?? 0) + 1);
  }

  const { data: staffList } = await supabase
    .from("staff_members")
    .select("company_id");

  const { data: storeList } = await supabase
    .from("stores")
    .select("company_id");

  const staffCountMap = new Map<string, number>();
  for (const s of staffList ?? []) {
    staffCountMap.set(s.company_id, (staffCountMap.get(s.company_id) ?? 0) + 1);
  }

  const storeCountMap = new Map<string, number>();
  for (const s of storeList ?? []) {
    storeCountMap.set(s.company_id, (storeCountMap.get(s.company_id) ?? 0) + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">登録会社一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            {companies?.length ?? 0} 社登録済み
          </p>
        </div>
        <Link
          href="/admin/super/companies/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          + 新規会社登録
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                コード
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                業種
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                テーマ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                担当者 / 店舗
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                アカウント
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                登録日
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(companies ?? []).map((company) => {
              const industryType = industryMap.get(company.id) ?? "general";
              const template = getIndustryTemplate(industryType);
              return (
                <tr key={company.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{company.company_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
                      {company.company_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {template.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: company.primary_color }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                        style={{
                          backgroundColor: company.secondary_color ?? "#c8a951",
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{staffCountMap.get(company.id) ?? 0}名</span>
                      <span className="text-gray-300">/</span>
                      <span>{storeCountMap.get(company.id) ?? 0}店舗</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const count = accountCountMap.get(company.id) ?? 0;
                      return (
                        <Link
                          href={`/admin/super/companies/${company.id}/accounts`}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 ${
                            count > 0
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {count > 0 ? `${count}名` : "未発行"}
                        </Link>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        company.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {company.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/super/accounts/new?company_id=${company.id}`}
                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                      >
                        + アカウント発行
                      </Link>
                      <form action={switchViewingCompany.bind(null, company.id)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          管理画面へ →
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(companies ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  登録されている会社がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
