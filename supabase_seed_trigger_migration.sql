-- =====================================================
-- 新規ユーザー登録時にサンプルデータを自動投入するトリガー
-- Supabase の SQL Editor で実行してください
-- ※ supabase_auth_migration.sql を先に実行しておく必要があります
-- =====================================================

-- 1. トリガー関数を作成
--    SECURITY DEFINER: postgres ロールで実行し RLS をバイパスしてサンプルを挿入
--    SET search_path = public: 意図しないスキーマ参照を防ぐ
CREATE OR REPLACE FUNCTION public.handle_new_user_sample_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid   UUID;
  p1_id TEXT;
  p2_id TEXT;
  p3_id TEXT;
BEGIN
  -- BEGIN ブロック内で gen_random_uuid() を呼び出すことで、
  -- 関数の呼び出しごとに必ず新しい UUID が生成される
  uid   := NEW.id;
  p1_id := gen_random_uuid()::text;
  p2_id := gen_random_uuid()::text;
  p3_id := gen_random_uuid()::text;

  -- サンプルプロジェクトを挿入（日付は登録日基準で相対計算）
  INSERT INTO public.projects (id, name, start_date, end_date, status, user_id) VALUES
    (p1_id, 'XR-7 アナログ回路設計', CURRENT_DATE - 30, CURRENT_DATE + 60, 'active', uid),
    (p2_id, 'メモリセル 信頼性評価', CURRENT_DATE - 14, CURRENT_DATE + 90, 'active', uid),
    (p3_id, '試作チップ 外注手配',   CURRENT_DATE - 7,  CURRENT_DATE + 45, 'hold',   uid);

  -- サンプルタスクを挿入（各行ごとに gen_random_uuid() で独立した ID を生成）
  INSERT INTO public.tasks
    (id, project_id, name, assignee, category, start_date, end_date, status, priority, progress, memo, user_id)
  VALUES
    (gen_random_uuid()::text, p1_id, 'トランジスタ特性 SPICEシミュレーション', '鈴木', 'verify',
      CURRENT_DATE - 28, CURRENT_DATE + 7,  'wip',  'high', 75,  'VTH変動の検証が残っている', uid),
    (gen_random_uuid()::text, p1_id, '電源ノイズ解析',                          '田中', 'verify',
      CURRENT_DATE - 14, CURRENT_DATE + 14, 'wip',  'mid',  40,  '', uid),
    (gen_random_uuid()::text, p1_id, '回路図レビュー（第1回）',                 '鈴木', 'eval',
      CURRENT_DATE - 21, CURRENT_DATE - 7,  'done', 'high', 100, '指摘事項5件、対応済み', uid),
    (gen_random_uuid()::text, p1_id, '熱解析シミュレーション',                  '佐藤', 'verify',
      CURRENT_DATE + 7,  CURRENT_DATE + 28, 'todo', 'mid',  0,   '', uid),
    (gen_random_uuid()::text, p2_id, 'エンデュランス試験（1000回）',            '田中', 'verify',
      CURRENT_DATE - 10, CURRENT_DATE + 20, 'wip',  'high', 50,  'サンプル数: 50個', uid),
    (gen_random_uuid()::text, p2_id, 'データ保持特性 評価',                     '鈴木', 'eval',
      CURRENT_DATE + 21, CURRENT_DATE + 49, 'todo', 'mid',  0,   '', uid),
    (gen_random_uuid()::text, p2_id, '故障解析レポート作成',                    '佐藤', 'eval',
      CURRENT_DATE + 50, CURRENT_DATE + 70, 'todo', 'low',  0,   '', uid),
    (gen_random_uuid()::text, p3_id, 'マスクデータ作成・確認',                  '鈴木', 'mfg',
      CURRENT_DATE - 5,  CURRENT_DATE + 5,  'wip',  'high', 80,  'ITAR確認が必要', uid),
    (gen_random_uuid()::text, p3_id, '外注先見積もり取得',                      '田中', 'mfg',
      CURRENT_DATE - 7,  CURRENT_DATE + 3,  'wip',  'high', 60,  'A社・B社 2社から取得中', uid);

  RETURN NEW;
END;
$$;

-- 2. auth.users への INSERT トリガーを登録（冪等）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_sample_data();

-- 3. 確認クエリ
SELECT trigger_name, event_object_schema, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
