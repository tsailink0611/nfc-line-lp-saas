import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export function StatCard({
  title, value, unit, diff, icon, iconBg,
}: {
  title: string; value: number; unit: string; diff: number | null;
  icon: React.ReactNode; iconBg: string;
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
          {diff > 0 ? <ArrowUp className="h-3 w-3 text-emerald-500" />
            : diff < 0 ? <ArrowDown className="h-3 w-3 text-red-400" />
            : <Minus className="h-3 w-3 text-gray-400" />}
          <span className={`text-xs font-medium ${
            diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-gray-400"
          }`}>{diff > 0 ? "+" : ""}{diff}% 前期比</span>
        </div>
      )}
    </div>
  );
}
