"use server";

import { createClient } from "@/lib/supabase/server";
import { staffSchema } from "@/lib/validators/staff";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createStaff(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("company_id")
    .single();

  if (!adminUser) return { error: "権限がありません" };

  const raw = Object.fromEntries(formData);
  const parsed = staffSchema.safeParse({
    ...raw,
    is_public: formData.get("is_public") === "true",
    career_years: raw.career_years || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("staff_members").insert({
    company_id: adminUser.company_id,
    ...parsed.data,
    main_image_url: formData.get("main_image_url") as string || null,
    sub_image_url: formData.get("sub_image_url") as string || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "このスラッグは既に使用されています" };
    return { error: "担当者の登録に失敗しました" };
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const parsed = staffSchema.safeParse({
    ...raw,
    is_public: formData.get("is_public") === "true",
    career_years: raw.career_years || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("staff_members")
    .update({
      ...parsed.data,
      main_image_url: formData.get("main_image_url") as string || null,
      sub_image_url: formData.get("sub_image_url") as string || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "このスラッグは既に使用されています" };
    return { error: "担当者の更新に失敗しました" };
  }

  revalidatePath("/admin/staff");
  revalidatePath(`/staff/${parsed.data.slug}`);
  redirect("/admin/staff");
}

export async function deleteStaff(id: string): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("staff_members").delete().eq("id", id);

  if (error) return { error: "担当者の削除に失敗しました" };

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateBadges(
  staffId: string,
  badges: { label: string; sort_order: number }[]
) {
  const supabase = await createClient();

  // 既存バッジを全削除して再作成
  await supabase.from("staff_badges").delete().eq("staff_member_id", staffId);

  if (badges.length > 0) {
    await supabase.from("staff_badges").insert(
      badges.map((b) => ({ staff_member_id: staffId, ...b }))
    );
  }

  revalidatePath("/admin/staff");
}

export async function updateGalleries(
  staffId: string,
  galleries: { image_url: string; caption: string | null; sort_order: number }[]
) {
  const supabase = await createClient();

  await supabase.from("galleries").delete().eq("staff_member_id", staffId);

  if (galleries.length > 0) {
    await supabase.from("galleries").insert(
      galleries.map((g) => ({ staff_member_id: staffId, ...g }))
    );
  }

  revalidatePath("/admin/staff");
}
