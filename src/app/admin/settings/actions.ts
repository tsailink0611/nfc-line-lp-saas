"use server";

import { createClient } from "@/lib/supabase/server";
import { companySettingsSchema, lpSettingsSchema } from "@/lib/validators/settings";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

export async function updateCompanySettings(
  companyId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const raw = Object.fromEntries(formData);
  const parsed = companySettingsSchema.safeParse(raw);

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("companies")
    .update({
      ...parsed.data,
      logo_url: (formData.get("logo_url") as string) || null,
    })
    .eq("id", companyId);

  if (error) return { error: "会社情報の更新に失敗しました" };
  revalidatePath("/admin/settings");
  return {};
}

export async function updateLpSettings(
  companyId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const raw = Object.fromEntries(formData);
  const parsed = lpSettingsSchema.safeParse(raw);

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // 空文字列はnullに変換
  const upsertData = {
    company_id: companyId,
    ...parsed.data,
    hero_background_url: parsed.data.hero_background_url || null,
    webhook_url: parsed.data.webhook_url || null,
    webhook_secret: parsed.data.webhook_secret || null,
  };

  // upsert
  const { error } = await supabase
    .from("lp_settings")
    .upsert(upsertData, { onConflict: "company_id" });

  if (error) return { error: "LP設定の更新に失敗しました" };
  revalidatePath("/admin/settings");
  return {};
}
