import Link from "next/link";

export type Period = "today" | "week" | "month" | "last_month";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "month", label: "今月" },
  { key: "last_month", label: "先月" },
];

export function PeriodTabs({ current }: { current: Period }) {
  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {PERIODS.map((p) => (
        <Link key={p.key} href={`?period=${p.key}`}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            current === p.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}>{p.label}</Link>
      ))}
    </div>
  );
}
