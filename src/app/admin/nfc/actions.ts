"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { nfcTokenSchema } from "@/lib/validators/nfc";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin/staff/actions";

export async function createNfcToken(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const companyId = ctx.companyId;
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = nfcTokenSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // 担当者のslugを取得してtarget_pathを生成
  const { data: staff } = await supabase
    .from("staff_members")
    .select("slug")
    .eq("id", parsed.data.staff_member_id)
    .single();

  if (!staff) return { error: "担当者が見つかりません" };

  const token = crypto.randomUUID();

  const { error } = await supabase.from("nfc_tokens").insert({
    company_id: companyId,
    staff_member_id: parsed.data.staff_member_id,
    token,
    target_path: `/staff/${staff.slug}`,
    note: parsed.data.note || null,
    is_active: true,
  });

  if (error) return { error: "NFCトークンの発行に失敗しました" };
  revalidatePath("/admin/nfc");
  return {};
}

export async function toggleNfcToken(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("nfc_tokens").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/nfc");
}

export async function deleteNfcToken(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("nfc_tokens").delete().eq("id", id);
  if (error) return { error: "NFCトークンの削除に失敗しました" };
  revalidatePath("/admin/nfc");
  return {};
}
