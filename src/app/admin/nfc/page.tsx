import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { redirect } from "next/navigation";
import { NfcCreateForm } from "@/components/admin/nfc-create-form";
import { NfcTokenRow } from "@/components/admin/nfc-token-row";

export default async function NfcManagementPage() {
  const ctx = await getCurrentAdminContext();
  if (!ctx) redirect("/admin/login");
  const supabase = await createClient();

  const [{ data: tokens }, { data: staffList }] = await Promise.all([
    supabase
      .from("nfc_tokens")
      .select("*, staff_member:staff_members(last_name, first_name, slug)")
      .eq("company_id", ctx.companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("staff_members")
      .select("id, last_name, first_name")
      .eq("company_id", ctx.companyId)
      .order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">NFC管理</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">新規トークン発行</h2>
        <NfcCreateForm staffList={staffList ?? []} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">トークン</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">担当者</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">遷移先</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">備考</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">状態</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tokens && tokens.length > 0 ? (
              tokens.map((token) => (
                <NfcTokenRow key={token.id} token={token} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  NFCトークンがまだ発行されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
