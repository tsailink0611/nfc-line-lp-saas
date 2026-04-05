export type DayRow = { day: string; tap_count: number };

export function TapChart({ daily }: { daily: DayRow[] }) {
  const maxTaps = Math.max(...daily.map((d) => d.tap_count), 1);
  if (daily.length === 0) {
    return <div className="flex h-48 items-center justify-center text-sm text-gray-400">データがありません</div>;
  }
  return (
    <div className="flex h-48 items-end gap-1">
      {daily.map((d) => {
        const h = Math.max((d.tap_count / maxTaps) * 176, d.tap_count > 0 ? 4 : 0);
        const lbl = new Date(d.day).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
        return (
          <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-1">
            {d.tap_count > 0 && (
              <span className="absolute -top-5 text-xs font-medium text-gray-600 opacity-0 transition group-hover:opacity-100">{d.tap_count}</span>
            )}
            <div className="w-full rounded-t-sm bg-blue-500 transition-all hover:bg-blue-600" style={{ height: `${h}px` }} />
            {(daily.length <= 15 || daily.indexOf(d) % 5 === 0) && (
              <span className="text-xs text-gray-400 whitespace-nowrap">{lbl}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
