"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { updateLpSettings } from "@/app/admin/settings/actions";
import type { LpSettings } from "@/types/database";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin/staff/actions";

type Props = {
  companyId: string;
  lpSettings: LpSettings | null;
};

export function SettingsLpForm({ companyId, lpSettings }: Props) {
  const boundAction = updateLpSettings.bind(null, companyId);
  const [state, formAction, pending] = useActionState(boundAction, {} as ActionState);

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{state.error}</div>
      )}

      <div>
        <Label htmlFor="hero_catch">ヒーローキャッチコピー</Label>
        <Input
          id="hero_catch"
          name="hero_catch"
          defaultValue={lpSettings?.hero_catch ?? ""}
          placeholder="あなたの理想の暮らしを実現する"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="hero_subcatch">ヒーローサブキャッチ</Label>
        <Input
          id="hero_subcatch"
          name="hero_subcatch"
          defaultValue={lpSettings?.hero_subcatch ?? ""}
          placeholder="不動産のプロフェッショナルにお任せください"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="cta_label" required>CTA文言</Label>
        <Input
          id="cta_label"
          name="cta_label"
          defaultValue={lpSettings?.cta_label ?? "LINEで相談する"}
          error={fieldError("cta_label")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="footer_text">フッター文言</Label>
        <Textarea
          id="footer_text"
          name="footer_text"
          defaultValue={lpSettings?.footer_text ?? ""}
          rows={2}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="theme_type">テーマ</Label>
        <Select id="theme_type" name="theme_type" defaultValue={lpSettings?.theme_type ?? "default"} className="mt-1">
          <option value="default">デフォルト（ダーク）</option>
          <option value="light">ライト</option>
          <option value="premium">プレミアム</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="industry_type">業種テンプレート</Label>
        <Select id="industry_type" name="industry_type" defaultValue={lpSettings?.industry_type ?? "real_estate"} className="mt-1">
          <option value="real_estate">不動産・建築</option>
          <option value="construction">建築・リフォーム</option>
          <option value="automotive">自動車</option>
          <option value="general">汎用</option>
        </Select>
        <p className="mt-1 text-xs text-gray-500">LINE連携のメリット表示内容が業種に合わせて変わります</p>
      </div>

      <div>
        <Label htmlFor="hero_background_url">ヒーロー背景画像URL</Label>
        <Input
          id="hero_background_url"
          name="hero_background_url"
          type="url"
          defaultValue={lpSettings?.hero_background_url ?? ""}
          placeholder="https://..."
          error={fieldError("hero_background_url")}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">空欄の場合はグラデーション背景を使用します</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "保存中..." : "LP設定を保存"}</Button>
      </div>
    </form>
  );
}
