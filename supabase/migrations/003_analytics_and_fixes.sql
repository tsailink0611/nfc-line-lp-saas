-- ============================================================
-- Migration 003: アナリティクステーブル追加 + lp_settings修正
-- ============================================================

-- lp_settings に不足カラムを追加
ALTER TABLE lp_settings ADD COLUMN IF NOT EXISTS industry_type TEXT DEFAULT 'real_estate';
ALTER TABLE lp_settings ADD COLUMN IF NOT EXISTS hero_background_url TEXT;

-- =============================================
-- アナリティクス: ページ訪問ログ
-- =============================================
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT
);
CREATE INDEX IF NOT EXISTS idx_page_visits_staff_member_id ON page_visits(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);

-- =============================================
-- アナリティクス: NFCスキャンログ
-- =============================================
CREATE TABLE IF NOT EXISTS nfc_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfc_token_id UUID NOT NULL REFERENCES nfc_tokens(id) ON DELETE CASCADE,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_nfc_resolutions_token_id ON nfc_resolutions(nfc_token_id);
CREATE INDEX IF NOT EXISTS idx_nfc_resolutions_resolved_at ON nfc_resolutions(resolved_at);

-- =============================================
-- RLS ポリシー
-- =============================================
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_resolutions ENABLE ROW LEVEL SECURITY;

-- page_visits: 匿名・認証済みユーザーのINSERT可、管理者のSELECT可
CREATE POLICY "anon_insert_page_visits"
  ON page_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_select_page_visits"
  ON page_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.id = page_visits.staff_member_id
        AND is_admin_of(sm.company_id)
    )
  );

-- nfc_resolutions: 匿名・認証済みユーザーのINSERT可、管理者のSELECT可
CREATE POLICY "anon_insert_nfc_resolutions"
  ON nfc_resolutions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_select_nfc_resolutions"
  ON nfc_resolutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nfc_tokens nt
      WHERE nt.id = nfc_resolutions.nfc_token_id
        AND is_admin_of(nt.company_id)
    )
  );

-- =============================================
-- スタッフ別訪問数ランキング関数
-- =============================================
CREATE OR REPLACE FUNCTION get_staff_visit_ranking(since TIMESTAMPTZ)
RETURNS TABLE (
  staff_member_id UUID,
  last_name TEXT,
  first_name TEXT,
  slug TEXT,
  visit_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    sm.id AS staff_member_id,
    sm.last_name,
    sm.first_name,
    sm.slug,
    COUNT(pv.id) AS visit_count
  FROM staff_members sm
  JOIN admin_users au ON au.company_id = sm.company_id
  JOIN page_visits pv ON pv.staff_member_id = sm.id AND pv.visited_at >= since
  WHERE au.auth_user_id = auth.uid()
  GROUP BY sm.id, sm.last_name, sm.first_name, sm.slug
  ORDER BY visit_count DESC
  LIMIT 10;
$$;
