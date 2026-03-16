import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function StoresListPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .order("store_name");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">店舗一覧</h1>
        <Link href="/admin/stores/new">
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">店舗名</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">コード</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">電話</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">状態</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores && stores.length > 0 ? (
              stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{store.store_name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{store.store_code}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{store.phone ?? "-"}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={store.is_active ? "success" : "default"}>
                      {store.is_active ? "有効" : "無効"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link href={`/admin/stores/${store.id}`}>
                      <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">店舗がまだ登録されていません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
