import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { redirect } from "next/navigation";
import { Smartphone, Users, TrendingUp, BarChart2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import Link from "next/link";

type Period = "today" | "week" | "month" | "last_month";

type StaffRankRow = {
  staff_member_id: string;
  display_name: string | null;
  last_name: string;
  first_name: string;
  slug: string;
  tap_count: number;
};

type DayRow = {
  day: string;
  tap_count: number;
};

type RecentTap = {
  resolved_at: string;
  user_agent: string | null;
  nfc_token_id: string;
  last_name: string;
  first_name: string;
  display_name: string | null;
  slug: string;
};

function getPeriodRange(period: Period): { since: Date; until: Date; label: string; prevSince: Date; prevUntil: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") {
    const prevSince = new Date(today); prevSince.setDate(today.getDate() - 1);
    return { since: today, until: now, label: "今日", prevSince, prevUntil: today };
  }
  if (period === "week") {
    const since = new Date(today); since.setDate(today.getDate() - 6);
    const prevSince = new Date(since); prevSince.setDate(since.getDate() - 7);
    return { since, until: now, label: "直近7日間", prevSince, prevUntil: since };
  }
  if (period === "last_month") {
    const since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const until = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevSince = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { since, until, label: "先月", prevSince, prevUntil: since };
  }
  // month (default)
  const since = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevSince = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { since, until: now, label: "今月", prevSince, prevUntil: since };
}

function detectDevice(ua: string | null): string {
  if (!ua) return "不明";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  return "その他";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const ctx = await getCurrentAdminContext();
  if (!ctx) redirect("/admin/login");

  const { period: rawPeriod } = await searchParams;
  const period: Period =
    rawPeriod === "today" || rawPeriod === "week" || rawPeriod === "last_month"
      ? rawPeriod
      : "month";

  const companyId = ctx.companyId;
  const supabase = await createClient();
  const { since, until, label, prevSince, prevUntil } = getPeriodRange(period);

  const [
    { count: tapCount },
    { count: prevTapCount },
    { count: lpCount },
    { count: prevLpCount },
    { count: activeStaff },
    { data: rankingRaw },
    { data: dailyRaw },
    { data: recentRaw },
  ] = await Promise.all([
    supabase.from("nfc_resolutions")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("resolved_at", since.toISOString())
      .lte("resolved_at", until.toISOString()),
    supabase.from("nfc_resolutions")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("resolved_at", prevSince.toISOString())
      .lte("resolved_at", prevUntil.toISOString()),
    supabase.from("page_visits")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("visited_at", since.toISOString())
      .lte("visited_at", until.toISOString()),
    supabase.from("page_visits")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("visited_at", prevSince.toISOString())
      .lte("visited_at", prevUntil.toISOString()),
    supabase.from("staff_members")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_public", true),
    supabase.rpc("get_staff_tap_ranking", {
      p_company_id: companyId,
      p_since: since.toISOString(),
      p_until: until.toISOString(),
    }),
    supabase.rpc("get_daily_tap_counts", {
      p_company_id: companyId,
      p_days: period === "today" ? 1 : period === "week" ? 7 : 30,
    }),
    supabase
      .from("nfc_resolutions")
      .select(`
        resolved_at,
        user_agent,
        nfc_token_id,
        nfc_tokens!inner(
          staff_members!inner(last_name, first_name, display_name, slug)
        )
      `)
      .eq("company_id", companyId)
      .order("resolved_at", { ascending: false })
      .limit(20),
  ]);

  const taps = tapCount ?? 0;
  const prevTaps = prevTapCount ?? 0;
  const lps = lpCount ?? 0;
  const prevLps = prevLpCount ?? 0;
  const ranking: StaffRankRow[] = (rankingRaw as StaffRankRow[] | null) ?? [];
  const daily: DayRow[] = (dailyRaw as DayRow[] | null) ?? [];

  // 前期比計算
  const tapDiff = prevTaps > 0 ? Math.round(((taps - prevTaps) / prevTaps) * 100) : null;
  const lpDiff = prevLps > 0 ? Math.round(((lps - prevLps) / prevLps) * 100) : null;
  const convRate = taps > 0 ? Math.round((lps / taps) * 100) : 0;
  const prevConvRate = prevTaps > 0 ? Math.round((prevLps / prevTaps) * 100) : 0;
  const convDiff = prevConvRate > 0 ? convRate - prevConvRate : null;

  // グラフ用
  const maxTaps = Math.max(...daily.map((d) => d.tap_count), 1);
  const maxRankTaps = Math.max(...ranking.map((r) => r.tap_count), 1);

  // 最近のタップ整形
  const recentTaps = (recentRaw ?? []).map((r: Record<string, unknown>) => {
    const token = r.nfc_tokens as Record<string, unknown> | null;
    const staff = token?.staff_members as Record<string, unknown> | null;
    return {
      resolved_at: r.resolved_at as string,
      user_agent: r.user_agent as string | null,
      display_name: (staff?.display_name as string | null) ?? null,
      last_name: (staff?.last_name as string) ?? "",
      first_name: (staff?.first_name as string) ?? "",
      slug: (staff?.slug as string) ?? "",
    } as RecentTap & { nfc_token_id?: string };
  });

  const periods: { key: Period; label: string }[] = [
    { key: "today", label: "今日" },
    { key: "week", label: "今週" },
    { key: "month", label: "今月" },
    { key: "last_month", label: "先月" },
  ];

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">アナリティクス</h1>
        </div>
        {/* 期間タブ */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {periods.map((p) => (
            <Link
              key={p.key}
              href={`?period=${p.key}`}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                period === p.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPIカード 5枚 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={`${label}のNFCタップ`}
          value={taps}
          unit="回"
          diff={tapDiff}
          icon={<Smartphone className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title={`${label}のLP表示`}
          value={lps}
          unit="回"
          diff={lpDiff}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="タップ→LP転換率"
          value={convRate}
          unit="%"
          diff={convDiff}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="公開スタッフ数"
          value={activeStaff ?? 0}
          unit="名"
          diff={null}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          title="スタッフ平均タップ"
          value={activeStaff ? Math.round(taps / activeStaff) : 0}
          unit="回"
          diff={null}
          icon={<BarChart2 className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-50"
        />
      </div>

      {/* グラフ + ランキング */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* タップ推移グラフ */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-3">
          <h2 className="mb-6 text-sm font-semibold text-gray-900">
            NFCタップ推移
          </h2>
          {daily.length > 0 ? (
            <div className="flex h-48 items-end gap-1">
              {daily.map((d) => {
                const h = Math.max((d.tap_count / maxTaps) * 176, d.tap_count > 0 ? 4 : 0);
                const date = new Date(d.day);
                const lbl = date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
                return (
                  <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-1">
                    {d.tap_count > 0 && (
                      <span className="absolute -top-5 text-xs font-medium text-gray-600 opacity-0 transition group-hover:opacity-100">
                        {d.tap_count}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t-sm bg-blue-500 transition-all hover:bg-blue-600"
                      style={{ height: `${h}px` }}
                    />
                    {daily.length <= 15 && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">{lbl}</span>
                    )}
                    {daily.length > 15 && daily.indexOf(d) % 5 === 0 && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">{lbl}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              データがありません
            </div>
          )}
        </div>

        {/* スタッフランキング */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            スタッフ別タップランキング
          </h2>
          {ranking.filter((r) => r.tap_count > 0).length > 0 ? (
            <ol className="space-y-3">
              {ranking.map((row, i) => (
                <li key={row.slug}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : i === 1
                          ? "bg-gray-200 text-gray-600"
                          : i === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                      {row.display_name || `${row.last_name} ${row.first_name}`}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-gray-700">
                      {row.tap_count}
                    </span>
                  </div>
                  <div className="ml-8 mt-1 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(row.tap_count / maxRankTaps) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 text-center text-sm text-gray-400">
              {label}のタップデータがありません
            </p>
          )}
        </div>
      </div>

      {/* 最近のタップログ */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">最近のNFCタップ（直近20件）</h2>
        </div>
        {recentTaps.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentTaps.map((tap, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {tap.display_name || `${tap.last_name} ${tap.first_name}`}
                  </p>
                  <p className="text-xs text-gray-400">/staff/{tap.slug}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {detectDevice(tap.user_agent)}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(tap.resolved_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-gray-400">タップログがありません</p>
        )}
      </div>
    </div>
  );
}

// インラインStatCardコンポーネント
function StatCard({
  title,
  value,
  unit,
  diff,
  icon,
  iconBg,
}: {
  title: string;
  value: number;
  unit: string;
  diff: number | null;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value.toLocaleString()}
        <span className="ml-1 text-base font-normal text-gray-400">{unit}</span>
      </p>
      {diff !== null && (
        <div className="mt-2 flex items-center gap-1">
          {diff > 0 ? (
            <ArrowUp className="h-3 w-3 text-emerald-500" />
          ) : diff < 0 ? (
            <ArrowDown className="h-3 w-3 text-red-400" />
          ) : (
            <Minus className="h-3 w-3 text-gray-400" />
          )}
          <span
            className={`text-xs font-medium ${
              diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {diff > 0 ? "+" : ""}{diff}% 前期比
          </span>
        </div>
      )}
    </div>
  );
}
