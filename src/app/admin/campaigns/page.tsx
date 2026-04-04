import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function CampaignsListPage() {
  const ctx = await getCurrentAdminContext();
  if (!ctx) redirect("/admin/login");
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, store:stores(store_name)")
    .eq("company_id", ctx.companyId)
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">キャンペーン一覧</h1>
        <Link href="/admin/campaigns/new">
          <Button><Plus className="mr-2 h-4 w-4" />新規登録</Button>
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">タイトル</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">店舗</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">期間</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">状態</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{c.title}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {(c.store as { store_name: string } | null)?.store_name ?? "全店舗"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {c.start_date ?? "-"} ~ {c.end_date ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={c.is_public ? "success" : "default"}>{c.is_public ? "公開" : "非公開"}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link href={`/admin/campaigns/${c.id}`}>
                      <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">キャンペーンがまだ登録されていません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
