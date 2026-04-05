"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { storeSchema } from "@/lib/validators/store";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/app/admin/staff/actions";

export async function createStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const companyId = ctx.companyId;
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = storeSchema.safeParse({
    ...raw,
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("stores").insert({
    company_id: companyId,
    ...parsed.data,
  });

  if (error) {
    if (error.code === "23505") return { error: "この店舗コードは既に使用されています" };
    return { error: "店舗の登録に失敗しました" };
  }

  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function updateStore(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = storeSchema.safeParse({
    ...raw,
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("stores").update(parsed.data).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "この店舗コードは既に使用されています" };
    return { error: "店舗の更新に失敗しました" };
  }

  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function deleteStore(id: string): Promise<ActionState> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const supabase = await createClient();
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) return { error: "店舗の削除に失敗しました" };
  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}
