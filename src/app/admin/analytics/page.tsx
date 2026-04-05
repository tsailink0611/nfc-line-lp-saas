import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { redirect } from "next/navigation";
import { Smartphone, Users, TrendingUp, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/admin/analytics/stat-card";
import { PeriodTabs, type Period } from "@/components/admin/analytics/period-tabs";
import { TapChart, type DayRow } from "@/components/admin/analytics/tap-chart";
import { StaffRanking, type StaffRankRow } from "@/components/admin/analytics/staff-ranking";
import { RecentTaps, type RecentTapRow } from "@/components/admin/analytics/recent-taps";

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

  const tapDiff = prevTaps > 0 ? Math.round(((taps - prevTaps) / prevTaps) * 100) : null;
  const lpDiff = prevLps > 0 ? Math.round(((lps - prevLps) / prevLps) * 100) : null;
  const convRate = taps > 0 ? Math.round((lps / taps) * 100) : 0;
  const prevConvRate = prevTaps > 0 ? Math.round((prevLps / prevTaps) * 100) : 0;
  const convDiff = prevConvRate > 0 ? convRate - prevConvRate : null;

  const recentTaps: RecentTapRow[] = (recentRaw ?? []).map((r: Record<string, unknown>) => {
    const token = r.nfc_tokens as Record<string, unknown> | null;
    const staff = token?.staff_members as Record<string, unknown> | null;
    return {
      resolved_at: r.resolved_at as string,
      user_agent: r.user_agent as string | null,
      display_name: (staff?.display_name as string | null) ?? null,
      last_name: (staff?.last_name as string) ?? "",
      first_name: (staff?.first_name as string) ?? "",
      slug: (staff?.slug as string) ?? "",
    };
  });

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">アナリティクス</h1>
        </div>
        <PeriodTabs current={period} />
      </div>

      {/* KPIカード 5枚 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title={`${label}のNFCタップ`} value={taps} unit="回" diff={tapDiff}
          icon={<Smartphone className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" />
        <StatCard title={`${label}のLP表示`} value={lps} unit="回" diff={lpDiff}
          icon={<Users className="h-5 w-5 text-indigo-600" />} iconBg="bg-indigo-50" />
        <StatCard title="タップ→LP転換率" value={convRate} unit="%" diff={convDiff}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} iconBg="bg-emerald-50" />
        <StatCard title="公開スタッフ数" value={activeStaff ?? 0} unit="名" diff={null}
          icon={<Users className="h-5 w-5 text-purple-600" />} iconBg="bg-purple-50" />
        <StatCard title="スタッフ平均タップ" value={activeStaff ? Math.round(taps / activeStaff) : 0} unit="回" diff={null}
          icon={<BarChart2 className="h-5 w-5 text-orange-600" />} iconBg="bg-orange-50" />
      </div>

      {/* グラフ + ランキング */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-3">
          <h2 className="mb-6 text-sm font-semibold text-gray-900">NFCタップ推移</h2>
          <TapChart daily={daily} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">スタッフ別タップランキング</h2>
          <StaffRanking ranking={ranking} label={label} />
        </div>
      </div>

      {/* 最近のタップログ */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">最近のNFCタップ（直近20件）</h2>
        </div>
        <RecentTaps taps={recentTaps} />
      </div>
    </div>
  );
}
