-- =====================================================
-- プロジェクトスキーマ変更マイグレーション（冪等・再実行可能）
-- Supabase の SQL Editor で実行してください
-- =====================================================

-- 1. end_date の NOT NULL 制約を削除（「無期限」チェックで NULL を許容）
--    制約がない場合は何も起きないため再実行しても安全
ALTER TABLE projects ALTER COLUMN end_date DROP NOT NULL;

-- 2. 確認クエリ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN ('start_date', 'end_date')
ORDER BY column_name;
