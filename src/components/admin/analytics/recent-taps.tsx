import { Smartphone } from "lucide-react";

export type RecentTapRow = {
  resolved_at: string;
  user_agent: string | null;
  display_name: string | null;
  last_name: string;
  first_name: string;
  slug: string;
};

function detectDevice(ua: string | null): string {
  if (!ua) return "不明";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  return "その他";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo",
  });
}

export function RecentTaps({ taps }: { taps: RecentTapRow[] }) {
  if (taps.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400">タップログがありません</p>;
  }
  return (
    <div className="divide-y divide-gray-50">
      {taps.map((tap, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <Smartphone className="h-4 w-4 text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{tap.display_name || `${tap.last_name} ${tap.first_name}`}</p>
            <p className="text-xs text-gray-400">/staff/{tap.slug}</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{detectDevice(tap.user_agent)}</span>
          <span className="shrink-0 text-xs text-gray-400">{formatTime(tap.resolved_at)}</span>
        </div>
      ))}
    </div>
  );
}
