// ─────────────────────────────────────────
// 日付ユーティリティ
// ─────────────────────────────────────────
const fmt  = (d) => d.toISOString().slice(0, 10)
const add  = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const sub  = (d, n) => add(d, -n)
const now  = new Date()

// ─────────────────────────────────────────
// デフォルトデータ（半導体開発サンプル）
// ─────────────────────────────────────────
export const defaultData = {
  projects: [
    {
      id: 'p1',
      name: 'XR-7 アナログ回路設計',
      start: fmt(sub(now, 30)),
      end:   fmt(add(now, 60)),
      status: 'active',
    },
    {
      id: 'p2',
      name: 'メモリセル 信頼性評価',
      start: fmt(sub(now, 14)),
      end:   fmt(add(now, 90)),
      status: 'active',
    },
    {
      id: 'p3',
      name: '試作チップ 外注手配',
      start: fmt(sub(now, 7)),
      end:   fmt(add(now, 45)),
      status: 'hold',
    },
  ],
  tasks: [
    {
      id: 't1', projectId: 'p1',
      name: 'トランジスタ特性 SPICEシミュレーション',
      assignee: '鈴木', category: 'verify',
      start: fmt(sub(now, 28)), end: fmt(add(now, 7)),
      status: 'wip', priority: 'high', progress: 75,
      memo: 'VTH変動の検証が残っている',
    },
    {
      id: 't2', projectId: 'p1',
      name: '電源ノイズ解析',
      assignee: '田中', category: 'verify',
      start: fmt(sub(now, 14)), end: fmt(add(now, 14)),
      status: 'wip', priority: 'mid', progress: 40,
      memo: '',
    },
    {
      id: 't3', projectId: 'p1',
      name: '回路図レビュー（第1回）',
      assignee: '鈴木', category: 'eval',
      start: fmt(sub(now, 21)), end: fmt(sub(now, 7)),
      status: 'done', priority: 'high', progress: 100,
      memo: '指摘事項5件、対応済み',
    },
    {
      id: 't4', projectId: 'p1',
      name: '熱解析シミュレーション',
      assignee: '佐藤', category: 'verify',
      start: fmt(add(now, 7)), end: fmt(add(now, 28)),
      status: 'todo', priority: 'mid', progress: 0,
      memo: '',
    },
    {
      id: 't5', projectId: 'p2',
      name: 'エンデュランス試験（1000回）',
      assignee: '田中', category: 'verify',
      start: fmt(sub(now, 10)), end: fmt(add(now, 20)),
      status: 'wip', priority: 'high', progress: 50,
      memo: 'サンプル数: 50個',
    },
    {
      id: 't6', projectId: 'p2',
      name: 'データ保持特性 評価',
      assignee: '鈴木', category: 'eval',
      start: fmt(add(now, 21)), end: fmt(add(now, 49)),
      status: 'todo', priority: 'mid', progress: 0,
      memo: '',
    },
    {
      id: 't7', projectId: 'p2',
      name: '故障解析レポート作成',
      assignee: '佐藤', category: 'eval',
      start: fmt(add(now, 50)), end: fmt(add(now, 70)),
      status: 'todo', priority: 'low', progress: 0,
      memo: '',
    },
    {
      id: 't8', projectId: 'p3',
      name: 'マスクデータ作成・確認',
      assignee: '鈴木', category: 'mfg',
      start: fmt(sub(now, 5)), end: fmt(add(now, 5)),
      status: 'wip', priority: 'high', progress: 80,
      memo: 'ITAR確認が必要',
    },
    {
      id: 't9', projectId: 'p3',
      name: '外注先見積もり取得',
      assignee: '田中', category: 'mfg',
      start: fmt(sub(now, 7)), end: fmt(add(now, 3)),
      status: 'wip', priority: 'high', progress: 60,
      memo: 'A社・B社 2社から取得中',
    },
  ],
}

// ─────────────────────────────────────────
// LocalStorage CRUD
// ─────────────────────────────────────────
const STORAGE_KEY = 'progress_tracker_v1'

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultData
  } catch {
    return defaultData
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─────────────────────────────────────────
// 定数マップ（ラベル・クラス名）
// ─────────────────────────────────────────
export const STATUS_MAP = {
  todo: { label: '未着手', cls: 's-todo' },
  wip:  { label: '進行中', cls: 's-wip'  },
  done: { label: '完了',   cls: 's-done' },
  hold: { label: '保留',   cls: 's-hold' },
}

export const CATEGORY_MAP = {
  // barColor: ガントチャートのバー色。自由に変更してOK（CSSカラーコードまたはCSS変数）
  verify: { label: '検証',       cls: 'cat-verify', barColor: '#00d4ff' }, // シアン
  eval:   { label: '評価',       cls: 'cat-eval',   barColor: '#ffd740' }, // イエロー
  mfg:    { label: '製造・外注', cls: 'cat-mfg',    barColor: '#00e676' }, // グリーン
  other:  { label: 'その他',     cls: 'cat-other',  barColor: '#8890a0' }, // グレー
}

export const PRIORITY_MAP = {
  high: { label: '高', cls: 'p-high' },
  mid:  { label: '中', cls: 'p-mid'  },
  low:  { label: '低', cls: 'p-low'  },
}

export const PROJECT_STATUS_MAP = {
  active: { label: '進行中', cls: 'badge-active' },
  hold:   { label: '保留',   cls: 'badge-hold'   },
  done:   { label: '完了',   cls: 'badge-done'   },
}

// ─────────────────────────────────────────
// 日付ヘルパー
// ─────────────────────────────────────────
export const today = () => new Date().toISOString().slice(0, 10)

export const daysLeft = (endDate) =>
  Math.ceil((new Date(endDate) - new Date(today())) / 86400000)

export const isOverdue = (task) =>
  task.status !== 'done' && task.end < today()

// 完了タスク数 ÷ 全タスク数 × 100 で進捗率を計算
export const calcProgress = (tasks) =>
  tasks.length
    ? Math.round(tasks.filter((t) => t.status === 'done').length / tasks.length * 100)
    : 0
