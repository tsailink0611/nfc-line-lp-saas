import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, UserCheck, Store, Megaphone } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: staffTotal },
    { count: staffPublic },
    { count: storeCount },
    { count: campaignCount },
  ] = await Promise.all([
    supabase.from("staff_members").select("*", { count: "exact", head: true }),
    supabase
      .from("staff_members")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
  ]);

  // 最新更新一覧
  const { data: recentStaff } = await supabase
    .from("staff_members")
    .select("id, last_name, first_name, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="担当者数" value={staffTotal ?? 0} icon={Users} />
        <StatsCard title="公開中" value={staffPublic ?? 0} icon={UserCheck} />
        <StatsCard title="店舗数" value={storeCount ?? 0} icon={Store} />
        <StatsCard title="キャンペーン" value={campaignCount ?? 0} icon={Megaphone} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">最近の更新</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white">
          {recentStaff && recentStaff.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentStaff.map((staff) => (
                <li key={staff.id} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm text-gray-900">
                    {staff.last_name} {staff.first_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(staff.updated_at).toLocaleDateString("ja-JP")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-8 text-center text-sm text-gray-500">
              まだデータがありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
