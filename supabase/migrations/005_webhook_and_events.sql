-- ============================================================
-- Migration 005: webhook連携 + イベント基盤拡張
-- ============================================================

-- =============================================
-- lp_settings に webhook設定カラムを追加
-- =============================================
ALTER TABLE lp_settings
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- =============================================
-- nfc_resolutions にイベント基盤カラムを追加
-- =============================================
ALTER TABLE nfc_resolutions
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'tag_tapped',
  ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_nfc_resolutions_company_id ON nfc_resolutions(company_id);
CREATE INDEX IF NOT EXISTS idx_nfc_resolutions_event_type ON nfc_resolutions(event_type);

-- =============================================
-- page_visits にイベント基盤カラムを追加
-- =============================================
ALTER TABLE page_visits
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'page_opened',
  ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_page_visits_company_id ON page_visits(company_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_event_type ON page_visits(event_type);
