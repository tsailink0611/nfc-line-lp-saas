# スーパー管理画面 Phase A 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `role='super_admin'` を持つユーザーが全会社を一覧・登録できるスーパー管理画面 `/admin/super` を構築する。

**Architecture:** 既存の RLS ポリシーは一切変更せず、super_admin 専用ポリシーを追加する。Next.js App Router のレイアウト層でロールチェックを行い、一般管理者は `/admin/super` にアクセスできない。会社登録フォームは既存の store-form.tsx パターンを踏襲する。

**Tech Stack:** Next.js 15 App Router / React 19 / Supabase / Zod / Tailwind CSS 4

**ブランチ:** `feature/super-admin`（develop からチェックアウト済み）

**安全原則:**
- 既存の RLS ポリシー・関数は変更しない（追加のみ）
- DB マイグレーションは Supabase MCP で適用後に動作確認してからコミット
- 各タスク完了後に `npm run build` でビルド確認

---

## 変更ファイル一覧

| 操作 | ファイル | 役割 |
|---|---|---|
| 新規 | `supabase/migrations/004_super_admin_rls.sql` | super_admin RLS ポリシー追加 |
| 新規 | `src/lib/validators/company.ts` | 会社登録フォームバリデーション |
| 新規 | `src/app/admin/super/layout.tsx` | super_admin ロールチェック + レイアウト |
| 新規 | `src/app/admin/super/page.tsx` | 会社一覧ページ |
| 新規 | `src/app/admin/super/companies/new/page.tsx` | 新規会社登録ページ |
| 新規 | `src/app/admin/super/actions.ts` | 会社登録サーバーアクション |
| 新規 | `src/components/admin/super-company-form.tsx` | 会社登録フォームコンポーネント |

---

## Task 1: DBマイグレーション — super_admin RLS ポリシー追加

**Files:**
- Create: `supabase/migrations/004_super_admin_rls.sql`

- [ ] **Step 1: マイグレーションファイルを作成する**

```sql
-- supabase/migrations/004_super_admin_rls.sql
-- =============================================
-- super_admin ロール用 RLS ポリシー追加
-- 既存ポリシーは変更しない。新ポリシーを追加するだけ。
-- =============================================

-- super_admin 判定関数
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- companies: super_admin は全社を操作可能
CREATE POLICY "companies_super_admin_all" ON companies
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- lp_settings: super_admin は全社の LP 設定を操作可能
CREATE POLICY "lp_settings_super_admin_all" ON lp_settings
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- admin_users: super_admin は全管理者レコードを参照可能
CREATE POLICY "admin_users_super_admin_select" ON admin_users
  FOR SELECT TO authenticated
  USING (is_super_admin());
```

- [ ] **Step 2: Supabase MCP で適用する**

Supabase SQL Editor または MCP ツールで上記 SQL を実行する。
エラーが出る場合は既に同名ポリシーが存在している可能性があるので確認する。

- [ ] **Step 3: 動作確認 — super_admin ユーザーが companies を全件取得できるか確認**

Supabase SQL Editor で以下を実行し、全会社が返ることを確認：
```sql
-- super_admin の auth_user_id を一時的に設定して確認
SELECT * FROM companies;
-- 既存の DEMO と DEMO-AUTO の2件が返ることを確認
```

- [ ] **Step 4: あなた自身の admin_users レコードを super_admin に更新**

Supabase SQL Editor で実行（メールアドレスは実際のものに置き換える）：
```sql
UPDATE admin_users
SET role = 'super_admin'
WHERE email = 'tsailink0611@gmail.com';

-- 確認
SELECT id, name, email, role FROM admin_users WHERE role = 'super_admin';
```

- [ ] **Step 5: コミット**

```bash
git add supabase/migrations/004_super_admin_rls.sql
git commit -m "feat: add super_admin RLS policies and is_super_admin() function"
```

---

## Task 2: バリデーター — company.ts

**Files:**
- Create: `src/lib/validators/company.ts`

既存の `src/lib/validators/store.ts` パターンに従う。

- [ ] **Step 1: バリデーターファイルを作成する**

```typescript
// src/lib/validators/company.ts
import { z } from "zod";

export const companySchema = z.object({
  company_name: z.string().min(1, "会社名は必須です"),
  company_code: z
    .string()
    .min(1, "会社コードは必須です")
    .regex(/^[A-Z0-9-]+$/, "英大文字・数字・ハイフンのみ使用できます"),
  company_name_en: z.string().optional(),
  industry_type: z.enum(["automotive", "real_estate", "construction", "general"], {
    errorMap: () => ({ message: "業種を選択してください" }),
  }),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください")
    .default("#1a1a2e"),
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください")
    .default("#c8a951"),
  description: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/lib/validators/company.ts
git commit -m "feat: add company form validator"
```

---

## Task 3: サーバーアクション — super/actions.ts

**Files:**
- Create: `src/app/admin/super/actions.ts`

既存の `src/app/admin/stores/actions.ts` パターンに従う。super_admin チェックを追加する。

- [ ] **Step 1: アクションファイルを作成する**

```typescript
// src/app/admin/super/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/validators/company";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/app/admin/staff/actions";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .single();
  if (!adminUser || adminUser.role !== "super_admin") {
    throw new Error("権限がありません");
  }
  return supabase;
}

export async function createCompany(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let supabase;
  try {
    supabase = await assertSuperAdmin();
  } catch {
    return { error: "権限がありません" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = companySchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      company_code: parsed.data.company_code,
      company_name: parsed.data.company_name,
      company_name_en: parsed.data.company_name_en ?? null,
      primary_color: parsed.data.primary_color,
      secondary_color: parsed.data.secondary_color,
      description: parsed.data.description ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (companyError) {
    if (companyError.code === "23505") return { error: "この会社コードは既に使用されています" };
    return { error: "会社の登録に失敗しました" };
  }

  // LP設定を業種テンプレートのデフォルト値で作成
  await supabase.from("lp_settings").insert({
    company_id: company.id,
    industry_type: parsed.data.industry_type,
    theme_type: "default",
    cta_label: "LINEで相談する",
  });

  revalidatePath("/admin/super");
  redirect("/admin/super");
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/app/admin/super/actions.ts
git commit -m "feat: add super admin createCompany server action"
```

---

## Task 4: フォームコンポーネント — super-company-form.tsx

**Files:**
- Create: `src/components/admin/super-company-form.tsx`

既存の `src/components/admin/store-form.tsx` と `src/components/admin/settings-lp-form.tsx` パターンに従う。

- [ ] **Step 1: フォームコンポーネントを作成する**

```typescript
// src/components/admin/super-company-form.tsx
"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/staff/actions";
import type { createCompany } from "@/app/admin/super/actions";

type Props = {
  action: typeof createCompany;
};

const INDUSTRY_OPTIONS = [
  { value: "automotive", label: "自動車ディーラー" },
  { value: "real_estate", label: "不動産" },
  { value: "construction", label: "建設・リフォーム" },
  { value: "general", label: "汎用" },
];

function fieldError(errors: Record<string, string[]> | undefined, field: string) {
  return errors?.[field]?.[0];
}

export function SuperCompanyForm({ action }: Props) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={dispatch} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="company_name">会社名 *</Label>
          <Input
            id="company_name"
            name="company_name"
            placeholder="株式会社〇〇"
            error={fieldError(state.fieldErrors, "company_name")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company_code">会社コード * (英大文字・数字・ハイフン)</Label>
          <Input
            id="company_code"
            name="company_code"
            placeholder="TOYOTA-DEMO"
            error={fieldError(state.fieldErrors, "company_code")}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">登録後の変更はできません</p>
        </div>
      </div>

      <div>
        <Label htmlFor="company_name_en">会社名（英語）</Label>
        <Input
          id="company_name_en"
          name="company_name_en"
          placeholder="Example Co., Ltd."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="industry_type">業種 *</Label>
        <Select
          id="industry_type"
          name="industry_type"
          className="mt-1"
          defaultValue="general"
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        {fieldError(state.fieldErrors, "industry_type") && (
          <p className="mt-1 text-xs text-red-500">{fieldError(state.fieldErrors, "industry_type")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label htmlFor="primary_color">テーマカラー（メイン）</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              id="primary_color"
              name="primary_color"
              defaultValue="#1a1a2e"
              className="h-10 w-16 cursor-pointer rounded border border-gray-200 p-0.5"
            />
            <Input
              name="primary_color_text"
              defaultValue="#1a1a2e"
              placeholder="#1a1a2e"
              className="font-mono text-sm"
              readOnly
            />
          </div>
        </div>

        <div>
          <Label htmlFor="secondary_color">テーマカラー（サブ）</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              id="secondary_color"
              name="secondary_color"
              defaultValue="#c8a951"
              className="h-10 w-16 cursor-pointer rounded border border-gray-200 p-0.5"
            />
            <Input
              name="secondary_color_text"
              defaultValue="#c8a951"
              placeholder="#c8a951"
              className="font-mono text-sm"
              readOnly
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">会社概要</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="会社の概要を入力してください（任意）"
          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <a
          href="/admin/super"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          キャンセル
        </a>
        <Button type="submit" disabled={pending}>
          {pending ? "登録中..." : "会社を登録する"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/admin/super-company-form.tsx
git commit -m "feat: add SuperCompanyForm component"
```

---

## Task 5: スーパー管理レイアウト — super/layout.tsx

**Files:**
- Create: `src/app/admin/super/layout.tsx`

super_admin ロールチェックを行う。一般管理者は `/admin` にリダイレクトする。

- [ ] **Step 1: レイアウトファイルを作成する**

```typescript
// src/app/admin/super/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("name, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "super_admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* スーパー管理ヘッダー */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-gray-500 transition hover:text-gray-700"
            >
              ← 管理画面に戻る
            </Link>
            <span className="text-gray-300">|</span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              SUPER ADMIN
            </span>
            <h1 className="text-base font-bold text-gray-900">全社管理</h1>
          </div>
          <span className="text-sm text-gray-500">{adminUser.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/app/admin/super/layout.tsx
git commit -m "feat: add super admin layout with role check"
```

---

## Task 6: 会社一覧ページ — super/page.tsx

**Files:**
- Create: `src/app/admin/super/page.tsx`

全会社を一覧表示する。is_super_admin() ポリシーにより全件取得できる。

- [ ] **Step 1: 会社一覧ページを作成する**

```typescript
// src/app/admin/super/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getIndustryTemplate } from "@/lib/industry-templates";

export default async function SuperAdminPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, company_code, company_name, primary_color, secondary_color, is_active, created_at")
    .order("created_at", { ascending: false });

  const { data: lpSettings } = await supabase
    .from("lp_settings")
    .select("company_id, industry_type");

  const industryMap = new Map(
    (lpSettings ?? []).map((s) => [s.company_id, s.industry_type ?? "general"])
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">登録会社一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            {companies?.length ?? 0} 社登録済み
          </p>
        </div>
        <Link
          href="/admin/super/companies/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          + 新規会社登録
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">会社名</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">コード</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">業種</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">テーマ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">状態</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(companies ?? []).map((company) => {
              const industryType = industryMap.get(company.id) ?? "general";
              const template = getIndustryTemplate(industryType);
              return (
                <tr key={company.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{company.company_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
                      {company.company_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {template.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: company.primary_color }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: company.secondary_color ?? "#c8a951" }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        company.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {company.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              );
            })}
            {(companies ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  登録されている会社がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/app/admin/super/page.tsx
git commit -m "feat: add super admin company list page"
```

---

## Task 7: 新規会社登録ページ — super/companies/new/page.tsx

**Files:**
- Create: `src/app/admin/super/companies/new/page.tsx`

既存の `src/app/admin/stores/new/page.tsx` パターンに従う。

- [ ] **Step 1: 新規登録ページを作成する**

```typescript
// src/app/admin/super/companies/new/page.tsx
import { SuperCompanyForm } from "@/components/admin/super-company-form";
import { createCompany } from "@/app/admin/super/actions";

export default function NewCompanyPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">新規会社登録</h2>
      <p className="mt-1 text-sm text-gray-500">
        新しいクライアント会社を登録します。登録後にクライアント用の管理者アカウントを発行してください。
      </p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SuperCompanyForm action={createCompany} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ビルド確認（最終）**

```bash
npm run build
```

Expected: `✓ Compiled successfully` エラーなし・警告のみ許容

- [ ] **Step 3: 全ファイルをコミット**

```bash
git add src/app/admin/super/companies/new/page.tsx
git commit -m "feat: add new company registration page"
```

---

## Task 8: develop へ push して GitHub Actions 確認

- [ ] **Step 1: feature ブランチを push**

```bash
git push origin feature/super-admin
```

- [ ] **Step 2: GitHub で PR を作成（feature/super-admin → develop）**

GitHub MCP または以下で作成：
```bash
gh pr create --title "feat: スーパー管理画面 Phase A" --head feature/super-admin --base develop
```

- [ ] **Step 3: GitHub Actions の結果を確認**

```bash
gh run list --repo tsailink0611/nfc-line-lp-saas --limit 3
```

Expected: `completed success`

- [ ] **Step 4: PR をマージ（develop へ）**

Actions が success になったらマージする。main へのマージはこのセッションでは行わない。

---

## 完了後の確認手順

1. develop へのマージ後、`npm run deploy` でローカルデプロイ（またはmainへのPR後に自動デプロイ）
2. `/admin/super` にアクセスして会社一覧が表示されることを確認
3. 一般管理者アカウントで `/admin/super` にアクセスして `/admin` にリダイレクトされることを確認
4. 新規会社登録フォームで会社を作成し、一覧に表示されることを確認
