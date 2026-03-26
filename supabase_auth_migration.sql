-- =====================================================
-- 認証対応マイグレーション
-- Supabase の SQL Editor で実行してください
-- =====================================================

-- 1. user_id カラムを追加（既存データは NULL のまま残す）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 既存データが残っている場合は削除（チームごとに新規データを使う）
-- ※ テスト用データを全削除したい場合のみ実行
-- DELETE FROM tasks;
-- DELETE FROM projects;

-- 3. Row Level Security を有効化
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;

-- 4. projects テーブルのポリシー
CREATE POLICY "projects: 自分のデータのみ参照" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects: 自分のデータのみ挿入" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: 自分のデータのみ更新" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects: 自分のデータのみ削除" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- 5. tasks テーブルのポリシー
CREATE POLICY "tasks: 自分のデータのみ参照" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ挿入" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ更新" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks: 自分のデータのみ削除" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
