-- =====================================================
-- 認証対応マイグレーション（冪等・再実行可能）
-- Supabase の SQL Editor で実行してください
-- =====================================================

-- 1. user_id カラムを追加
--    DEFAULT auth.uid() により、コードで明示しなくても自動でログインユーザーのIDがセットされる
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- 既存カラムにも DEFAULT を追加（カラムが既に存在していた場合）
ALTER TABLE projects ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tasks    ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Row Level Security を有効化
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;

-- 3. 既存ポリシーを削除（重複エラーを防ぐため再実行可能にする）
DROP POLICY IF EXISTS "projects: 自分のデータのみ参照" ON projects;
DROP POLICY IF EXISTS "projects: 自分のデータのみ挿入" ON projects;
DROP POLICY IF EXISTS "projects: 自分のデータのみ更新" ON projects;
DROP POLICY IF EXISTS "projects: 自分のデータのみ削除" ON projects;

DROP POLICY IF EXISTS "tasks: 自分のデータのみ参照" ON tasks;
DROP POLICY IF EXISTS "tasks: 自分のデータのみ挿入" ON tasks;
DROP POLICY IF EXISTS "tasks: 自分のデータのみ更新" ON tasks;
DROP POLICY IF EXISTS "tasks: 自分のデータのみ削除" ON tasks;

-- 4. projects テーブルのポリシーを作成
CREATE POLICY "projects: 自分のデータのみ参照" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects: 自分のデータのみ挿入" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE は既存行の user_id が一致すること、かつ更新後も変わらないことを保証
CREATE POLICY "projects: 自分のデータのみ更新" ON projects
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: 自分のデータのみ削除" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- 5. tasks テーブルのポリシーを作成
CREATE POLICY "tasks: 自分のデータのみ参照" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ挿入" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ更新" ON tasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ削除" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 設定確認クエリ（実行後にポリシー一覧を確認できます）
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('projects', 'tasks')
ORDER BY tablename, cmd;
