-- supabase/migrations/004_super_admin_rls.sql
-- =============================================
-- super_admin ロール用 RLS ポリシー追加
-- 既存ポリシーは変更しない。新ポリシーを追加するだけ。
-- =============================================

-- super_admin 判定関数
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- companies: super_admin は全社を操作可能
CREATE POLICY "companies_super_admin_all" ON companies
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- lp_settings: super_admin は全社の LP 設定を操作可能
CREATE POLICY "lp_settings_super_admin_all" ON lp_settings
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- admin_users: super_admin は全管理者レコードを参照可能
CREATE POLICY "admin_users_super_admin_select" ON admin_users
  FOR SELECT TO authenticated
  USING (is_super_admin());
