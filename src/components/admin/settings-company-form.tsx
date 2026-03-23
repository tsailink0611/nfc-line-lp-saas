"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { updateCompanySettings } from "@/app/admin/settings/actions";
import type { Company } from "@/types/database";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/staff/actions";

type Props = {
  company: Company | null;
};

export function SettingsCompanyForm({ company }: Props) {
  const boundAction = updateCompanySettings.bind(null, company?.id ?? "");
  const [state, formAction, pending] = useActionState(boundAction, {} as ActionState);
  const [logoUrl, setLogoUrl] = useState(company?.logo_url ?? "");

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="logo_url" value={logoUrl} />

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{state.error}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="company_name" required>会社名</Label>
          <Input id="company_name" name="company_name" defaultValue={company?.company_name} error={fieldError("company_name")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="company_name_en">会社名（英語）</Label>
          <Input id="company_name_en" name="company_name_en" defaultValue={company?.company_name_en ?? ""} className="mt-1" />
        </div>
      </div>

      <div>
        <Label>ロゴ</Label>
        <ImageUpload
          currentUrl={logoUrl || null}
          onUpload={setLogoUrl}
          onRemove={() => setLogoUrl("")}
          folder="logos"
          className="mt-1"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="primary_color" required>メインカラー</Label>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" name="primary_color" defaultValue={company?.primary_color ?? "#1a1a2e"} className="h-10 w-10 cursor-pointer rounded border" />
            <Input name="primary_color" defaultValue={company?.primary_color ?? "#1a1a2e"} error={fieldError("primary_color")} className="flex-1" readOnly />
          </div>
        </div>
        <div>
          <Label htmlFor="secondary_color">サブカラー</Label>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" name="secondary_color" defaultValue={company?.secondary_color ?? "#16213e"} className="h-10 w-10 cursor-pointer rounded border" />
            <Input name="secondary_color" defaultValue={company?.secondary_color ?? "#16213e"} className="flex-1" readOnly />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">会社説明</Label>
        <Textarea id="description" name="description" defaultValue={company?.description ?? ""} rows={3} className="mt-1" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "保存中..." : "会社情報を保存"}</Button>
      </div>
    </form>
  );
}
