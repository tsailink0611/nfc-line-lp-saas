# Large-Scale Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** コードの重複・肥大化・責務混在を解消し、保守性・型安全性を向上させる

**Architecture:** 4つの独立したトラックに分割して並列実行。各トラックは他のトラックに依存しないため、worktreeを使って同時並行で作業できる。

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase, Zod, Tailwind CSS

---

## 並列実行トラック概要

| トラック | 対象 | 削減見込み |
|---------|------|-----------|
| **A** | analytics/page.tsx 分割 | ~200行削減 |
| **B** | フォーム共通コンポーネント化 | ~150行削減 |
| **C** | Server Actions 認証統一 | ~100行削減 |
| **D** | 型定義補強 (role enum, ActionState) | ~50行、型安全性向上 |

---

## Track A: analytics/page.tsx 分割

**対象ファイル:**
- Modify: `src/app/admin/analytics/page.tsx` (429行 → ~80行)
- Create: `src/components/admin/analytics/period-tabs.tsx`
- Create: `src/components/admin/analytics/kpi-cards.tsx`
- Create: `src/components/admin/analytics/tap-chart.tsx`
- Create: `src/components/admin/analytics/staff-ranking.tsx`
- Create: `src/components/admin/analytics/recent-taps.tsx`
- Create: `src/components/admin/analytics/stat-card.tsx`

- [ ] **Step A-1: stat-card.tsx を抽出**

```tsx
// src/components/admin/analytics/stat-card.tsx
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export function StatCard({
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
          <span className={`text-xs font-medium ${
            diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-gray-400"
          }`}>
            {diff > 0 ? "+" : ""}{diff}% 前期比
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step A-2: period-tabs.tsx を抽出**

```tsx
// src/components/admin/analytics/period-tabs.tsx
import Link from "next/link";

type Period = "today" | "week" | "month" | "last_month";
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
        <Link
          key={p.key}
          href={`?period=${p.key}`}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            current === p.key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step A-3: tap-chart.tsx を抽出**

```tsx
// src/components/admin/analytics/tap-chart.tsx
type DayRow = { day: string; tap_count: number };

export function TapChart({ daily }: { daily: DayRow[] }) {
  const maxTaps = Math.max(...daily.map((d) => d.tap_count), 1);
  if (daily.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        データがありません
      </div>
    );
  }
  return (
    <div className="flex h-48 items-end gap-1">
      {daily.map((d) => {
        const h = Math.max((d.tap_count / maxTaps) * 176, d.tap_count > 0 ? 4 : 0);
        const lbl = new Date(d.day).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
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
            {(daily.length <= 15 || daily.indexOf(d) % 5 === 0) && (
              <span className="text-xs text-gray-400 whitespace-nowrap">{lbl}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step A-4: staff-ranking.tsx を抽出**

```tsx
// src/components/admin/analytics/staff-ranking.tsx
type StaffRankRow = {
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
            <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
              {row.display_name || `${row.last_name} ${row.first_name}`}
            </span>
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
```

- [ ] **Step A-5: recent-taps.tsx を抽出**

```tsx
// src/components/admin/analytics/recent-taps.tsx
import { Smartphone } from "lucide-react";

type RecentTap = {
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

export function RecentTaps({ taps }: { taps: RecentTap[] }) {
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
            <p className="truncate text-sm font-medium text-gray-900">
              {tap.display_name || `${tap.last_name} ${tap.first_name}`}
            </p>
            <p className="text-xs text-gray-400">/staff/{tap.slug}</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {detectDevice(tap.user_agent)}
          </span>
          <span className="shrink-0 text-xs text-gray-400">{formatTime(tap.resolved_at)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step A-6: analytics/page.tsx をスリム化**

全データ取得ロジックは維持、表示部分をインポートコンポーネントへ置き換える。
import 5コンポーネント、return の JSX を各コンポーネント呼び出しに置き換える。
最終的に ~80行になること。

- [ ] **Step A-7: ビルド確認**

```bash
cd C:/dev/nfc-line-lp-saas
npm run build
```

- [ ] **Step A-8: commit**

```bash
git add src/components/admin/analytics/ src/app/admin/analytics/page.tsx
git commit -m "refactor: split analytics page into focused components"
```

---

## Track B: フォーム共通コンポーネント化

**対象ファイル:**
- Create: `src/components/admin/form-field.tsx`
- Create: `src/components/admin/error-alert.tsx`
- Create: `src/lib/form-utils.ts`
- Modify: `src/components/admin/staff-form.tsx`
- Modify: `src/components/admin/store-form.tsx`
- Modify: `src/components/admin/campaign-form.tsx`
- Modify: `src/components/admin/settings-lp-form.tsx`
- Modify: `src/components/admin/settings-company-form.tsx`

- [ ] **Step B-1: error-alert.tsx を作成**

```tsx
// src/components/admin/error-alert.tsx
export function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
      {message}
    </div>
  );
}

export function SuccessAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
      {message}
    </div>
  );
}
```

- [ ] **Step B-2: form-utils.ts を作成**

```typescript
// src/lib/form-utils.ts

/** fieldErrors の最初のエラーを返すヘルパー */
export function fieldError(
  fieldErrors: Record<string, string[]> | undefined,
  name: string
): string | undefined {
  return fieldErrors?.[name]?.[0];
}

/** formData からbooleanフィールドを取得 */
export function formBool(formData: FormData, name: string): boolean {
  return formData.get(name) === "true";
}

/** formData から空文字をnullに変換して取得 */
export function formNullable(formData: FormData, name: string): string | null {
  const v = formData.get(name) as string | null;
  return v && v.trim() !== "" ? v : null;
}
```

- [ ] **Step B-3: form-field.tsx を作成**

```tsx
// src/components/admin/form-field.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FormField({
  label,
  name,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step B-4: staff-form.tsx をリファクタリング**

以下の変更:
- `const fieldError = (name: string) => ...` を削除し `import { fieldError } from "@/lib/form-utils"` に置き換え
- `{state.error && <div className="...">}` を `<ErrorAlert message={state.error} />` に置き換え
- 繰り返しのフィールドラベル+エラー表示を `<FormField>` に置き換え

- [ ] **Step B-5: 残りフォーム（store, campaign, settings-lp, settings-company）に同様の変更を適用**

各ファイルで同じ3ステップを適用:
1. `fieldError` 重複定義削除 → import
2. エラーdiv → `<ErrorAlert>`
3. フィールドラップを `<FormField>` に

- [ ] **Step B-6: ビルド確認**

```bash
cd C:/dev/nfc-line-lp-saas
npm run build
```

- [ ] **Step B-7: commit**

```bash
git add src/components/admin/form-field.tsx src/components/admin/error-alert.tsx src/lib/form-utils.ts src/components/admin/
git commit -m "refactor: extract shared form components and utils"
```

---

## Track C: Server Actions 認証統一

**対象ファイル:**
- Modify: `src/app/admin/staff/actions.ts`
- Modify: `src/app/admin/stores/actions.ts`
- Modify: `src/app/admin/campaigns/actions.ts`
- Modify: `src/app/admin/settings/actions.ts`
- Modify: `src/app/admin/nfc/actions.ts`
- Modify: `src/app/admin/super/actions.ts`

**方針:** 各actions.tsで直接 `admin_users` をクエリしている箇所を全て `getCurrentAdminContext()` に統一する。

- [ ] **Step C-1: staff/actions.ts を修正**

```typescript
// Before（重複パターン）:
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const { data: adminUser } = await supabase.from("admin_users").select("company_id").single();
if (!adminUser) return { error: "権限がありません" };
const companyId = adminUser.company_id;

// After（統一パターン）:
const ctx = await getCurrentAdminContext();
if (!ctx) return { error: "権限がありません" };
const companyId = ctx.companyId;
const supabase = await createClient();
```

staff/actions.ts 内の全 action 関数に同様の変更を適用。

- [ ] **Step C-2: stores/actions.ts を修正**

同じ置き換えパターンを適用。

- [ ] **Step C-3: campaigns/actions.ts を修正**

同じ置き換えパターンを適用。

- [ ] **Step C-4: settings/actions.ts を修正**

同じ置き換えパターンを適用。

- [ ] **Step C-5: nfc/actions.ts を修正**

同じ置き換えパターンを適用。

- [ ] **Step C-6: super/actions.ts を修正**

super_admin 専用のため `ctx.adminUser.role === "super_admin"` チェックを追加。

- [ ] **Step C-7: ビルド確認**

```bash
cd C:/dev/nfc-line-lp-saas
npm run build
```

- [ ] **Step C-8: commit**

```bash
git add src/app/admin/
git commit -m "refactor: unify auth via getCurrentAdminContext in all server actions"
```

---

## Track D: 型定義補強

**対象ファイル:**
- Modify: `src/types/database.ts`
- Create: `src/types/actions.ts`

- [ ] **Step D-1: AdminRole 型を定義して database.ts に追加**

```typescript
// src/types/database.ts に追加

export type AdminRole = "admin" | "super_admin" | "super_account_admin";

// AdminUser の role を string → AdminRole に変更
export type AdminUser = {
  id: string;
  company_id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: AdminRole;  // string → AdminRole
  is_active: boolean;
  created_at: string;
};
```

- [ ] **Step D-2: actions.ts 型ファイルを作成**

```typescript
// src/types/actions.ts
/** Server Action の共通戻り値型 */
export type ActionResult<T = void> = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};
```

- [ ] **Step D-3: 各 actions.ts の戻り値型を ActionResult に統一**

```typescript
// Before:
export async function createStaff(prevState: unknown, formData: FormData) {
  // 型なし

// After:
import type { ActionResult } from "@/types/actions";
export async function createStaff(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
```

- [ ] **Step D-4: admin-context.ts の AdminContext 型を AdminRole 使用に更新**

```typescript
// src/lib/admin-context.ts
import type { AdminRole } from "@/types/database";

export type AdminContext = {
  companyId: string;
  adminUser: {
    id: string;
    company_id: string;
    name: string;
    email: string;
    role: AdminRole;  // string → AdminRole
    is_active: boolean;
  };
  isViewingOtherCompany: boolean;
};
```

- [ ] **Step D-5: TypeScript 型チェック**

```bash
cd C:/dev/nfc-line-lp-saas
npx tsc --noEmit
```

エラーがあれば修正する。

- [ ] **Step D-6: commit**

```bash
git add src/types/ src/lib/admin-context.ts src/app/admin/
git commit -m "refactor: strengthen type definitions with AdminRole enum and ActionResult"
```

---

## 統合・最終確認

全トラック完了後:

- [ ] **Step FINAL-1: 全トラックのブランチをマージ**

```bash
git checkout develop
git merge refactor/track-a refactor/track-b refactor/track-c refactor/track-d
```

- [ ] **Step FINAL-2: ビルド確認**

```bash
npm run build
```

- [ ] **Step FINAL-3: push**

```bash
git push origin develop
```
