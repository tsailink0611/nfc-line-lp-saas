CREATE OR REPLACE FUNCTION is_admin_of(_company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
      AND company_id = _company_id
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_public_select" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "companies_admin_all" ON companies FOR ALL USING (is_admin_of(id));

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_public_select" ON stores FOR SELECT USING (is_active = true);
CREATE POLICY "stores_admin_all" ON stores FOR ALL USING (is_admin_of(company_id));

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_members_public_select" ON staff_members FOR SELECT USING (is_public = true);
CREATE POLICY "staff_members_admin_all" ON staff_members FOR ALL USING (is_admin_of(company_id));

ALTER TABLE staff_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_badges_public_select" ON staff_badges FOR SELECT USING (EXISTS (SELECT 1 FROM staff_members WHERE staff_members.id = staff_badges.staff_member_id AND staff_members.is_public = true));
CREATE POLICY "staff_badges_admin_all" ON staff_badges FOR ALL USING (EXISTS (SELECT 1 FROM staff_members WHERE staff_members.id = staff_badges.staff_member_id AND is_admin_of(staff_members.company_id)));

ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "galleries_public_select" ON galleries FOR SELECT USING (EXISTS (SELECT 1 FROM staff_members WHERE staff_members.id = galleries.staff_member_id AND staff_members.is_public = true));
CREATE POLICY "galleries_admin_all" ON galleries FOR ALL USING (EXISTS (SELECT 1 FROM staff_members WHERE staff_members.id = galleries.staff_member_id AND is_admin_of(staff_members.company_id)));

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_public_select" ON campaigns FOR SELECT USING (is_public = true);
CREATE POLICY "campaigns_admin_all" ON campaigns FOR ALL USING (is_admin_of(company_id));

ALTER TABLE nfc_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nfc_tokens_public_select" ON nfc_tokens FOR SELECT USING (is_active = true);
CREATE POLICY "nfc_tokens_admin_all" ON nfc_tokens FOR ALL USING (is_admin_of(company_id));

ALTER TABLE lp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_settings_public_select" ON lp_settings FOR SELECT USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = lp_settings.company_id AND companies.is_active = true));
CREATE POLICY "lp_settings_admin_all" ON lp_settings FOR ALL USING (is_admin_of(company_id));

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_users_self_select" ON admin_users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "admin_users_admin_all" ON admin_users FOR ALL USING (is_admin_of(company_id));

INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_assets_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'public-assets');
CREATE POLICY "public_assets_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-assets' AND auth.role() = 'authenticated');
CREATE POLICY "public_assets_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'public-assets' AND auth.role() = 'authenticated');
CREATE POLICY "public_assets_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'public-assets' AND auth.role() = 'authenticated');
