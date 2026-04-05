export type StaffRankRow = {
  display_name: string | null;
  last_name: string;
  first_name: string;
  slug: string;
  tap_count: number;
};

export function StaffRanking({ ranking, label }: { ranking: StaffRankRow[]; label: string }) {
  const filtered = ranking.filter((r) => r.tap_count > 0);
  const maxTaps = Math.max(...ranking.map((r) => r.tap_count), 1);
  if (filtered.length === 0) {
    return <p className="mt-6 text-center text-sm text-gray-400">{label}のタップデータがありません</p>;
  }
  return (
    <ol className="space-y-3">
      {filtered.map((row, i) => (
        <li key={row.slug}>
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i === 0 ? "bg-yellow-100 text-yellow-700"
              : i === 1 ? "bg-gray-200 text-gray-600"
              : i === 2 ? "bg-orange-100 text-orange-600"
              : "bg-gray-50 text-gray-400"
            }`}>{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{row.display_name || `${row.last_name} ${row.first_name}`}</span>
            <span className="shrink-0 text-sm font-semibold text-gray-700">{row.tap_count}</span>
          </div>
          <div className="ml-8 mt-1 h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(row.tap_count / maxTaps) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
