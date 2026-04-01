"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/staff/actions";
import type { createAdminAccount } from "@/app/admin/super/actions";

type Props = {
  companyId: string;
  companyName: string;
  action: typeof createAdminAccount;
};

export function SuperAccountForm({ companyId, companyName, action }: Props) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(action, {});

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={dispatch} className="space-y-5">
      <input type="hidden" name="company_id" value={companyId} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      )}

      <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
        発行先: <span className="font-semibold">{companyName}</span>
      </div>

      <div>
        <Label htmlFor="name">担当者氏名 *</Label>
        <Input
          id="name"
          name="name"
          placeholder="山田 太郎"
          error={fieldError("name")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@example.com"
          error={fieldError("email")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="password">初期パスワード *</Label>
        <Input
          id="password"
          name="password"
          type="text"
          placeholder="Abc12345"
          error={fieldError("password")}
          className="mt-1 font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">8文字以上・大文字1文字以上・数字1文字以上</p>
      </div>

      <div className="flex justify-end gap-3">
        <a
          href="/admin/super"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          キャンセル
        </a>
        <Button type="submit" disabled={pending}>
          {pending ? "発行中..." : "アカウントを発行する"}
        </Button>
      </div>
    </form>
  );
}
