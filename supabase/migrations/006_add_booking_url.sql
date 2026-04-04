-- ============================================================
-- Migration 006: staff_members に booking_url カラムを追加
-- ============================================================
-- 型定義(src/types/database.ts)・Zodバリデータ・UIフォームには
-- 既に booking_url が存在するが、DBカラムが未作成だったため追加。

ALTER TABLE staff_members
  ADD COLUMN IF NOT EXISTS booking_url TEXT;
