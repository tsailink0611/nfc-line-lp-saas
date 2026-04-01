"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { companySchema } from "@/lib/validators/company";
import { adminAccountSchema } from "@/lib/validators/admin-account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ActionState } from "@/app/admin/staff/actions";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未認証");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();
  if (!adminUser || adminUser.role !== "super_admin") {
    throw new Error("権限がありません");
  }
  return supabase;
}

export async function createCompany(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let supabase;
  try {
    supabase = await assertSuperAdmin();
  } catch {
    return { error: "権限がありません" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = companySchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      company_code: parsed.data.company_code,
      company_name: parsed.data.company_name,
      company_name_en: parsed.data.company_name_en ?? null,
      primary_color: parsed.data.primary_color,
      secondary_color: parsed.data.secondary_color,
      description: parsed.data.description ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (companyError) {
    if (companyError.code === "23505")
      return { error: "この会社コードは既に使用されています" };
    return { error: "会社の登録に失敗しました" };
  }

  // LP設定を業種テンプレートのデフォルト値で作成
  await supabase.from("lp_settings").insert({
    company_id: company.id,
    industry_type: parsed.data.industry_type,
    theme_type: "default",
    cta_label: "LINEで相談する",
  });

  revalidatePath("/admin/super");
  redirect("/admin/super");
}

export async function createAdminAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await assertSuperAdmin();
  } catch {
    return { error: "権限がありません" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = adminAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const adminClient = createAdminClient();

  // Supabase Auth にユーザーを作成
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already registered"))
      return { error: "このメールアドレスは既に使用されています" };
    return { error: `アカウント作成に失敗しました: ${authError.message}` };
  }

  // admin_users テーブルにレコードを作成
  const { error: dbError } = await adminClient.from("admin_users").insert({
    auth_user_id: authData.user.id,
    company_id: parsed.data.company_id,
    name: parsed.data.name,
    email: parsed.data.email,
    role: "admin",
    is_active: true,
  });

  if (dbError) {
    // Auth ユーザーをロールバック
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: "管理者情報の保存に失敗しました" };
  }

  revalidatePath("/admin/super");
  redirect(`/admin/super?created=1`);
}

export async function switchViewingCompany(companyId: string) {
  // super_admin のみ実行可能
  try {
    await assertSuperAdmin();
  } catch {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  cookieStore.set("super_viewing_company_id", companyId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8時間
  });
  redirect("/admin");
}
