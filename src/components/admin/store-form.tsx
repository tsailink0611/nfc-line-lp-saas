"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorAlert } from "@/components/admin/error-alert";
import { fieldError } from "@/lib/form-utils";
import type { Store } from "@/types/database";
import { useActionState, useState } from "react";
import type { ActionResult } from "@/types/actions";

type Props = {
  store?: Store | null;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function StoreForm({ store, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [isActive, setIsActive] = useState(store?.is_active ?? true);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="is_active" value={String(isActive)} />

      <ErrorAlert message={state.error} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="store_code" required>店舗コード</Label>
          <Input
            id="store_code"
            name="store_code"
            defaultValue={store?.store_code}
            error={fieldError(state.fieldErrors, "store_code")}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="store_name" required>店舗名</Label>
          <Input
            id="store_name"
            name="store_name"
            defaultValue={store?.store_name}
            error={fieldError(state.fieldErrors, "store_name")}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="postal_code">郵便番号</Label>
          <Input
            id="postal_code"
            name="postal_code"
            defaultValue={store?.postal_code ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={store?.phone ?? ""}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">住所</Label>
        <Input
          id="address"
          name="address"
          defaultValue={store?.address ?? ""}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="business_hours">営業時間</Label>
        <Input
          id="business_hours"
          name="business_hours"
          defaultValue={store?.business_hours ?? ""}
          placeholder="9:00 - 18:00"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="regular_holiday">定休日</Label>
        <Input
          id="regular_holiday"
          name="regular_holiday"
          defaultValue={store?.regular_holiday ?? ""}
          placeholder="毎週水曜日"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="google_map_embed_url">Google Map 埋め込みURL</Label>
        <Textarea
          id="google_map_embed_url"
          name="google_map_embed_url"
          defaultValue={store?.google_map_embed_url ?? ""}
          error={fieldError(state.fieldErrors, "google_map_embed_url")}
          rows={2}
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-3">
        <Label>公開状態</Label>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${isActive ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className="text-sm text-gray-600">{isActive ? "有効" : "無効"}</span>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
