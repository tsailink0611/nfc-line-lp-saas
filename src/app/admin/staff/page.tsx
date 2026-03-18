import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, ExternalLink } from "lucide-react";

export default async function StaffListPage() {
  const supabase = await createClient();

  const { data: staffList } = await supabase
    .from("staff_members")
    .select("*, store:stores(store_name)")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">担当者一覧</h1>
        <Link href="/admin/staff/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                氏名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                店舗
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                役職
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                順序
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                操作
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                LP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffList && staffList.length > 0 ? (
              staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {staff.last_name} {staff.first_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {(staff.store as { store_name: string } | null)?.store_name ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {staff.position ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={staff.is_public ? "success" : "default"}>
                      {staff.is_public ? "公開" : "非公開"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {staff.sort_order}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link href={`/admin/staff/${staff.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {staff.is_public && (
                      <a href={`/staff/${staff.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" title="LPを新しいタブで開く">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </Button>
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  担当者がまだ登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
