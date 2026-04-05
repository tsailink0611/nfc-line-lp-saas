"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/admin/error-alert";
import { fieldError } from "@/lib/form-utils";
import type { ActionResult } from "@/types/actions";
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

export function SuperCompanyForm({ action }: Props) {
  const [state, dispatch, pending] = useActionState<ActionResult, FormData>(action, {});

  return (
    <form action={dispatch} className="space-y-5">
      <ErrorAlert message={state.error} />

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
          error={fieldError(state.fieldErrors, "industry_type")}
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
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
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
