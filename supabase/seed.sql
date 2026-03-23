-- ============================================================
-- Seed Data: デモ用初期データ
-- ============================================================
-- 使い方:
-- 1. Supabase ダッシュボード > SQL Editor で実行
-- 2. admin_users は Supabase Auth でユーザーを作成してから手動追加:
--    INSERT INTO admin_users (company_id, auth_user_id, name, email, role)
--    VALUES ('<companies.id>', '<auth.users.id>', '管理者', 'admin@example.com', 'admin');

DO $$
DECLARE
  v_company_id UUID;
  v_store_id UUID;
  v_staff_id UUID;
BEGIN

-- =============================================
-- 1. 会社
-- =============================================
INSERT INTO companies (
  company_code,
  company_name,
  company_name_en,
  primary_color,
  secondary_color,
  description,
  is_active
) VALUES (
  'DEMO',
  '株式会社デモ不動産',
  'Demo Real Estate Co., Ltd.',
  '#1a1a2e',
  '#e8a87c',
  '地域密着型の不動産会社です。お客様の理想の住まい探しをサポートします。',
  true
)
ON CONFLICT (company_code) DO UPDATE
  SET company_name = EXCLUDED.company_name
RETURNING id INTO v_company_id;

-- =============================================
-- 2. LP設定
-- =============================================
INSERT INTO lp_settings (
  company_id,
  hero_catch,
  hero_subcatch,
  cta_label,
  footer_text,
  theme_type,
  industry_type
) VALUES (
  v_company_id,
  'あなたの理想の住まいを、一緒に探しましょう',
  '地域No.1の不動産プロフェッショナルにお任せください',
  'LINEで無料相談する',
  '© 株式会社デモ不動産 All Rights Reserved.',
  'default',
  'real_estate'
)
ON CONFLICT (company_id) DO UPDATE
  SET hero_catch = EXCLUDED.hero_catch;

-- =============================================
-- 3. 店舗
-- =============================================
INSERT INTO stores (
  company_id,
  store_code,
  store_name,
  postal_code,
  address,
  phone,
  business_hours,
  regular_holiday,
  is_active
) VALUES (
  v_company_id,
  'MAIN',
  'デモ不動産 本店',
  '100-0001',
  '東京都千代田区千代田1-1-1',
  '03-0000-0000',
  '10:00〜18:00',
  '毎週水曜日・年末年始',
  true
)
ON CONFLICT (company_id, store_code) DO UPDATE
  SET store_name = EXCLUDED.store_name
RETURNING id INTO v_store_id;

-- =============================================
-- 4. 担当者（スラッグはLPのURLになります）
-- =============================================
INSERT INTO staff_members (
  company_id,
  store_id,
  slug,
  last_name,
  first_name,
  last_name_en,
  first_name_en,
  position,
  career_years,
  profile_text,
  specialties_text,
  is_public,
  sort_order
) VALUES (
  v_company_id,
  v_store_id,
  'tanaka-taro',
  '田中',
  '太郎',
  'Tanaka',
  'Taro',
  '上級営業スタッフ',
  8,
  '不動産業界歴8年。マンション・一戸建てを中心に、お客様のライフスタイルに合った物件をご提案します。お気軽にLINEでご相談ください！',
  '新築マンション, 中古一戸建て, 住宅ローン相談, リノベーション提案',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE
  SET last_name = EXCLUDED.last_name,
      first_name = EXCLUDED.first_name
RETURNING id INTO v_staff_id;

-- =============================================
-- 5. バッジ
-- =============================================
INSERT INTO staff_badges (staff_member_id, label, sort_order)
VALUES
  (v_staff_id, '宅地建物取引士', 1),
  (v_staff_id, 'ファイナンシャルプランナー', 2),
  (v_staff_id, '住宅ローンアドバイザー', 3)
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. キャンペーン
-- =============================================
INSERT INTO campaigns (
  company_id,
  store_id,
  title,
  summary,
  is_public,
  sort_order
) VALUES (
  v_company_id,
  v_store_id,
  '春の住まい探しキャンペーン',
  '期間中にご成約のお客様に引っ越し費用をサポート！まずはお気軽にご相談ください。',
  true,
  1
)
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ Seed data inserted. company_id: %', v_company_id;
RAISE NOTICE '📌 次のステップ: Supabase Auth でメール/パスワードユーザーを作成し、auth_user_id を使って admin_users テーブルに管理者レコードを挿入してください。';

END $$;
