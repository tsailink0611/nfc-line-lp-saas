"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminContext } from "@/lib/admin-context";
import { campaignSchema } from "@/lib/validators/campaign";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/actions";

export async function createCampaign(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const companyId = ctx.companyId;
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = campaignSchema.safeParse({
    ...raw,
    is_public: formData.get("is_public") === "true",
    store_id: raw.store_id || null,
    start_date: raw.start_date || null,
    end_date: raw.end_date || null,
  });

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { error } = await supabase.from("campaigns").insert({
    company_id: companyId,
    ...parsed.data,
    image_url: (formData.get("image_url") as string) || null,
  });

  if (error) return { error: "キャンペーンの登録に失敗しました" };
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

export async function updateCampaign(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = campaignSchema.safeParse({
    ...raw,
    is_public: formData.get("is_public") === "true",
    store_id: raw.store_id || null,
    start_date: raw.start_date || null,
    end_date: raw.end_date || null,
  });

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("campaigns")
    .update({
      ...parsed.data,
      image_url: (formData.get("image_url") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: "キャンペーンの更新に失敗しました" };
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const ctx = await getCurrentAdminContext();
  if (!ctx) return { error: "権限がありません" };
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return { error: "キャンペーンの削除に失敗しました" };
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}
