"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Campaign, Store } from "@/types/database";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/staff/actions";

type Props = {
  stores: Store[];
  campaign?: Campaign | null;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function CampaignForm({ stores, campaign, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(campaign?.image_url ?? "");
  const [isPublic, setIsPublic] = useState(campaign?.is_public ?? false);

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="is_public" value={String(isPublic)} />

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{state.error}</div>
      )}

      <div>
        <Label htmlFor="title" required>タイトル</Label>
        <Input id="title" name="title" defaultValue={campaign?.title} error={fieldError("title")} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="summary">概要</Label>
        <Textarea id="summary" name="summary" defaultValue={campaign?.summary ?? ""} rows={3} className="mt-1" />
      </div>

      <div>
        <Label>画像</Label>
        <ImageUpload
          currentUrl={imageUrl || null}
          onUpload={setImageUrl}
          onRemove={() => setImageUrl("")}
          folder="campaigns"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="link_url">リンク先URL</Label>
        <Input id="link_url" name="link_url" defaultValue={campaign?.link_url ?? ""} error={fieldError("link_url")} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="store_id">適用店舗</Label>
        <Select id="store_id" name="store_id" defaultValue={campaign?.store_id ?? ""} className="mt-1">
          <option value="">全店舗共通</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.store_name}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="start_date">開始日</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={campaign?.start_date ?? ""} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="end_date">終了日</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={campaign?.end_date ?? ""} className="mt-1" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="sort_order">表示順</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={campaign?.sort_order ?? 0} className="mt-1" />
        </div>
        <div className="flex items-end gap-3">
          <Label>公開状態</Label>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isPublic ? "bg-green-500" : "bg-gray-200"}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-gray-600">{isPublic ? "公開" : "非公開"}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>{pending ? "保存中..." : "保存"}</Button>
      </div>
    </form>
  );
}
