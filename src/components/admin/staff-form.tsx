"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import type { StaffMember, Store } from "@/types/database";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/staff/actions";

type Props = {
  stores: Store[];
  staff?: StaffMember | null;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function StaffForm({ stores, staff, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [mainImage, setMainImage] = useState(staff?.main_image_url ?? "");
  const [subImage, setSubImage] = useState(staff?.sub_image_url ?? "");
  const [isPublic, setIsPublic] = useState(staff?.is_public ?? false);

  const fieldError = (name: string) =>
    state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="main_image_url" value={mainImage} />
      <input type="hidden" name="sub_image_url" value={subImage} />
      <input type="hidden" name="is_public" value={String(isPublic)} />

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="last_name" required>姓</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={staff?.last_name}
            error={fieldError("last_name")}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="first_name" required>名</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={staff?.first_name}
            error={fieldError("first_name")}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="last_name_en">姓（英語）</Label>
          <Input
            id="last_name_en"
            name="last_name_en"
            defaultValue={staff?.last_name_en ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="first_name_en">名（英語）</Label>
          <Input
            id="first_name_en"
            name="first_name_en"
            defaultValue={staff?.first_name_en ?? ""}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="display_name">表示名</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={staff?.display_name ?? ""}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="slug" required>スラッグ（URL用）</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={staff?.slug}
          placeholder="tanaka-taro"
          error={fieldError("slug")}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">英小文字・数字・ハイフンのみ</p>
      </div>

      <div>
        <Label htmlFor="store_id" required>店舗</Label>
        <Select
          id="store_id"
          name="store_id"
          defaultValue={staff?.store_id}
          error={fieldError("store_id")}
          className="mt-1"
        >
          <option value="">選択してください</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.store_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="position">役職</Label>
          <Input
            id="position"
            name="position"
            defaultValue={staff?.position ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="career_years">キャリア年数</Label>
          <Input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            defaultValue={staff?.career_years ?? ""}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="profile_text">プロフィール</Label>
        <Textarea
          id="profile_text"
          name="profile_text"
          defaultValue={staff?.profile_text ?? ""}
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="specialties_text">得意分野</Label>
        <Textarea
          id="specialties_text"
          name="specialties_text"
          defaultValue={staff?.specialties_text ?? ""}
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label>メイン画像</Label>
          <ImageUpload
            currentUrl={mainImage || null}
            onUpload={setMainImage}
            onRemove={() => setMainImage("")}
            folder="staff"
            className="mt-1"
          />
        </div>
        <div>
          <Label>サブ画像</Label>
          <ImageUpload
            currentUrl={subImage || null}
            onUpload={setSubImage}
            onRemove={() => setSubImage("")}
            folder="staff"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="staff_line_url">LINE追加URL</Label>
        <Input
          id="staff_line_url"
          name="staff_line_url"
          defaultValue={staff?.staff_line_url ?? ""}
          placeholder="https://line.me/ti/p/..."
          error={fieldError("staff_line_url")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="company_mobile_number">会社支給携帯番号</Label>
        <Input
          id="company_mobile_number"
          name="company_mobile_number"
          defaultValue={staff?.company_mobile_number ?? ""}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="youtube_url">YouTube URL</Label>
        <Input
          id="youtube_url"
          name="youtube_url"
          defaultValue={staff?.youtube_url ?? ""}
          error={fieldError("youtube_url")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="booking_url">打ち合わせ予約URL（Googleカレンダー等）</Label>
        <Input
          id="booking_url"
          name="booking_url"
          type="url"
          defaultValue={staff?.booking_url ?? ""}
          placeholder="https://calendar.google.com/calendar/appointments/..."
          error={fieldError("booking_url")}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          GoogleカレンダーやCalendlyの予約ページURLを入力するとLPに「打ち合わせを予約する」ボタンが表示されます
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="sort_order">表示順</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={staff?.sort_order ?? 0}
            className="mt-1"
          />
        </div>
        <div className="flex items-end gap-3">
          <Label>公開状態</Label>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isPublic ? "bg-green-500" : "bg-gray-200"}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${isPublic ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
          <span className="text-sm text-gray-600">{isPublic ? "公開" : "非公開"}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
