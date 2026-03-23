-- ============================================
-- NFC x LINE x LP 営業支援SaaS - 初期スキーマ
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_name_en TEXT,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1a1a2e',
  secondary_color TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  store_code TEXT NOT NULL,
  store_name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  business_hours TEXT,
  regular_holiday TEXT,
  google_map_embed_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, store_code)
);
CREATE INDEX idx_stores_company_id ON stores(company_id);
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  staff_code TEXT,
  slug TEXT NOT NULL UNIQUE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name_en TEXT,
  first_name_en TEXT,
  display_name TEXT,
  position TEXT,
  career_years INTEGER,
  profile_text TEXT,
  specialties_text TEXT,
  main_image_url TEXT,
  sub_image_url TEXT,
  staff_line_url TEXT,
  company_mobile_number TEXT,
  youtube_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_staff_members_company_id ON staff_members(company_id);
CREATE INDEX idx_staff_members_store_id ON staff_members(store_id);
CREATE INDEX idx_staff_members_public_list ON staff_members(company_id, is_public, sort_order);
CREATE TRIGGER trg_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE staff_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_staff_badges_staff_member_id ON staff_badges(staff_member_id);

CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_galleries_staff_member_id ON galleries(staff_member_id);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  link_url TEXT,
  start_date DATE,
  end_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX idx_campaigns_public_list ON campaigns(company_id, is_public, sort_order);
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE nfc_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nfc_tokens_company_id ON nfc_tokens(company_id);
CREATE INDEX idx_nfc_tokens_staff_member_id ON nfc_tokens(staff_member_id);
CREATE TRIGGER trg_nfc_tokens_updated_at BEFORE UPDATE ON nfc_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE lp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  hero_catch TEXT,
  hero_subcatch TEXT,
  cta_label TEXT NOT NULL DEFAULT 'LINEで相談する',
  footer_text TEXT,
  theme_type TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_lp_settings_updated_at BEFORE UPDATE ON lp_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_users_company_id ON admin_users(company_id);
CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
