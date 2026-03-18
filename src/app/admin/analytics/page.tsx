import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/stats-card";
import { BarChart2, Users, Smartphone, TrendingUp, type LucideIcon } from "lucide-react";

type StaffRankRow = {
  staff_member_id: string;
  last_name: string;
  first_name: string;
  slug: string;
  visit_count: number;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 各種集計クエリを並列実行
  const [
    { count: todayVisits },
    { count: weekVisits },
    { count: monthVisits },
    { count: monthScans },
    { data: rankingData },
    { data: dailyRaw },
  ] = await Promise.all([
    supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", todayStart),
    supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", weekStart),
    supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", monthStart),
    supabase
      .from("nfc_resolutions")
      .select("*", { count: "exact", head: true })
      .gte("resolved_at", monthStart),
    supabase.rpc("get_staff_visit_ranking", { since: monthStart }),
    supabase
      .from("page_visits")
      .select("visited_at")
      .gte("visited_at", weekStart)
      .order("visited_at", { ascending: true }),
  ]);

  const staffRanking: StaffRankRow[] = (rankingData as StaffRankRow[] | null) ?? [];

  // 直近7日間の日別訪問数を集計
  const dailyCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    dailyCounts[key] = 0;
  }
  (dailyRaw ?? []).forEach((v) => {
    const d = new Date(v.visited_at);
    const key = d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    if (key in dailyCounts) dailyCounts[key]++;
  });

  const dailyEntries = Object.entries(dailyCounts);
  const maxCount = Math.max(...dailyEntries.map(([, c]) => c), 1);

  return (
    <div>
      <div className="flex items-center gap-3">
        <BarChart2 className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">アクセス分析</h1>
      </div>

      {/* 統計カード */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="今日の訪問" value={todayVisits ?? 0} icon={Users as LucideIcon} />
        <StatsCard title="今週の訪問" value={weekVisits ?? 0} icon={TrendingUp as LucideIcon} />
        <StatsCard title="今月の訪問" value={monthVisits ?? 0} icon={BarChart2 as LucideIcon} />
        <StatsCard title="今月のNFCスキャン" value={monthScans ?? 0} icon={Smartphone as LucideIcon} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* 直近7日間グラフ */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-base font-semibold text-gray-900">直近7日間の訪問推移</h2>
          <div className="flex h-48 items-end gap-2">
            {dailyEntries.map(([date, count]) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{count > 0 ? count : ""}</span>
                <div
                  className="w-full rounded-t-md bg-blue-500 transition-all"
                  style={{
                    height: `${Math.max((count / maxCount) * 160, count > 0 ? 4 : 0)}px`,
                  }}
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{date}</span>
              </div>
            ))}
          </div>
          {(weekVisits ?? 0) === 0 && (
            <p className="mt-4 text-center text-sm text-gray-400">まだ訪問データがありません</p>
          )}
        </div>

        {/* スタッフ別ランキング */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            今月のLPアクセスランキング
          </h2>
          {staffRanking.length > 0 ? (
            <ol className="space-y-3">
              {staffRanking.map((row, i) => (
                <li key={row.slug} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : i === 1
                        ? "bg-gray-100 text-gray-600"
                        : i === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {row.last_name} {row.first_name}
                    </p>
                    <p className="truncate text-xs text-gray-400">/staff/{row.slug}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {row.visit_count}件
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-center text-sm text-gray-400">まだアクセスデータがありません</p>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        ※ ISRキャッシュ中のアクセスは記録されない場合があります（概算値）
      </p>
    </div>
  );
}
