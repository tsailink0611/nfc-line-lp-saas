"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createNfcToken } from "@/app/admin/nfc/actions";
import { useActionState } from "react";
import type { ActionResult } from "@/types/actions";

type Props = {
  staffList: { id: string; last_name: string; first_name: string }[];
};

export function NfcCreateForm({ staffList }: Props) {
  const [state, formAction, pending] = useActionState(
    createNfcToken,
    {} as ActionResult
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4">
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="staff_member_id" required>担当者</Label>
        <Select
          id="staff_member_id"
          name="staff_member_id"
          error={state.fieldErrors?.staff_member_id?.[0]}
          className="mt-1"
        >
          <option value="">選択してください</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.last_name} {s.first_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="note">備考</Label>
        <Input id="note" name="note" placeholder="名刺用、カード用など" className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "発行中..." : "トークン発行"}
      </Button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
