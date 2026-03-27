-- =====================================================
-- タスクスキーマ変更マイグレーション（冪等・再実行可能）
-- Supabase の SQL Editor で実行してください
-- =====================================================

-- 1. important カラムを追加（優先度の代替：重要フラグ）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS important BOOLEAN NOT NULL DEFAULT false;

-- 2. start_date / end_date の NOT NULL 制約を削除（「未定」チェックで NULL を許容）
--    制約がない場合は何も起きないため再実行しても安全
ALTER TABLE tasks ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN end_date   DROP NOT NULL;

-- 3. 確認クエリ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN ('important', 'start_date', 'end_date', 'priority')
ORDER BY column_name;
