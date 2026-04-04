import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type AdminContext = {
  /** 操作対象の会社ID（super_adminの会社切替を考慮済み） */
  companyId: string;
  /** ログイン中のadmin_usersレコード */
  adminUser: {
    id: string;
    company_id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
  };
  /** super_adminが別会社を閲覧中かどうか */
  isViewingOtherCompany: boolean;
};

/**
 * 現在のログインユーザーの管理コンテキストを取得する。
 *
 * - 通常admin → 自社の company_id
 * - super_admin → Cookie `super_viewing_company_id` があればその会社、なければ自社
 *
 * 認証されていない or admin_usersレコードがない場合は null を返す。
 */
export async function getCurrentAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, company_id, name, email, role, is_active")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminUser || !adminUser.is_active) return null;

  // super_admin のみ会社切替が可能
  let companyId = adminUser.company_id;
  let isViewingOtherCompany = false;

  if (adminUser.role === "super_admin") {
    const cookieStore = await cookies();
    const viewingId = cookieStore.get("super_viewing_company_id")?.value;

    if (viewingId && viewingId !== adminUser.company_id) {
      // 指定された会社が実在するか確認
      const { data: targetCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("id", viewingId)
        .single();

      if (targetCompany) {
        companyId = targetCompany.id;
        isViewingOtherCompany = true;
      }
    }
  }

  return { companyId, adminUser, isViewingOtherCompany };
}
