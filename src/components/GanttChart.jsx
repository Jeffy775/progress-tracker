import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { today, CATEGORY_MAP } from '../data/store.js'
import './GanttChart.css'

const WEEK_WIDTH  = 80
const LABEL_WIDTH = 200

const VIEW_MODES = [
  { key: 'all',      label: '全一覧'        },
  { key: 'project',  label: 'プロジェクト別' },
  { key: 'assignee', label: '担当者別'       },
  { key: 'month',    label: '月別'           },
]

// セッション中（SPA内ナビゲーション）でフィルター状態を保持。
// モジュール変数のためリロードでリセットされる（sessionStorage 不使用）。
let _savedViewMode = 'all'
let _savedSearch   = ''

export default function GanttChart({ projects, tasks, onTaskClick }) {
  const todayStr = today()

  const [viewMode, setViewMode] = useState(_savedViewMode)
  const [search,   setSearch]   = useState(_savedSearch)

  const containerRef = useRef(null)
  // isDragging / startX / scrollLeft / hasMoved をまとめて管理
  const drag = useRef({ isDragging: false, startX: 0, scrollLeft: 0, hasMoved: false })

  const handleViewMode = (mode) => { _savedViewMode = mode; setViewMode(mode) }
  const handleSearch   = (val)  => { _savedSearch   = val;  setSearch(val)   }

  // ── 検索フィルター ─────────────────────────────
  const searchLower = search.toLowerCase()
  const filteredTasks = useMemo(() => {
    if (!searchLower) return tasks
    return tasks.filter((t) => {
      const proj = projects.find((p) => p.id === t.projectId)
      return (
        t.name.toLowerCase().includes(searchLower) ||
        (proj?.name ?? '').toLowerCase().includes(searchLower) ||
        t.assignee.toLowerCase().includes(searchLower)
      )
    })
  }, [tasks, projects, searchLower])

  // ── 週範囲計算 ──────────────────────────────────
  const { weeks, minDate } = useMemo(() => {
    if (!filteredTasks.length) return { weeks: [], minDate: null }

    const datedTasks = filteredTasks.filter((t) => t.start && t.end)
    if (!datedTasks.length) return { weeks: [], minDate: null }

    const allDates = datedTasks.flatMap((t) => [new Date(t.start), new Date(t.end)])
    let min = new Date(Math.min(...allDates))
    let max = new Date(Math.max(...allDates))

    const dow = min.getDay()
    min.setDate(min.getDate() - (dow === 0 ? 6 : dow - 1))
    max.setDate(max.getDate() + 7)

    const ws = []
    const cur = new Date(min)
    while (cur <= max) { ws.push(new Date(cur)); cur.setDate(cur.getDate() + 7) }
    return { weeks: ws, minDate: min }
  }, [filteredTasks])

  // ── グループ化 ──────────────────────────────────
  const grouped = useMemo(() => {
    if (viewMode === 'all') return [{ key: '__all__', label: null, tasks: filteredTasks }]

    const buildGroups = (getKey, getLabel) => {
      const map = new Map()
      filteredTasks.forEach((t) => {
        const key   = getKey(t)
        const label = getLabel(t, key)
        if (!map.has(key)) map.set(key, { key, label, tasks: [] })
        map.get(key).tasks.push(t)
      })
      return [...map.values()]
    }

    if (viewMode === 'project') {
      return buildGroups(
        (t) => t.projectId ?? '__none__',
        (t) => projects.find((p) => p.id === t.projectId)?.name ?? '未設定',
      )
    }

    if (viewMode === 'assignee') {
      return buildGroups(
        (t) => t.assignee || '__none__',
        (t) => t.assignee || '未設定',
      )
    }

    if (viewMode === 'month') {
      const groups = buildGroups(
        (t) => {
          if (!t.start) return '__tbd__'
          const d = new Date(t.start)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        },
        (t, key) => {
          if (key === '__tbd__') return '日付未定'
          const [y, m] = key.split('-')
          return `${y}年 ${Number(m)}月`
        },
      )
      return groups.sort((a, b) => {
        if (a.key === '__tbd__') return 1
        if (b.key === '__tbd__') return -1
        return a.key.localeCompare(b.key)
      })
    }

    return [{ key: '__all__', label: null, tasks: filteredTasks }]
  }, [viewMode, filteredTasks, projects])

  // ── ドラッグスクロール ──────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    drag.current = {
      isDragging: true,
      startX:     e.clientX,
      scrollLeft: containerRef.current.scrollLeft,
      hasMoved:   false,
    }
    containerRef.current.classList.add('dragging')
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!drag.current.isDragging) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 3) {
      drag.current.hasMoved = true
      containerRef.current.scrollLeft = drag.current.scrollLeft - dx
    }
  }, [])

  const stopDrag = useCallback(() => {
    if (!drag.current.isDragging) return
    drag.current.isDragging = false
    containerRef.current?.classList.remove('dragging')
  }, [])

  // ウィンドウ外でマウスアップしても確実に停止
  useEffect(() => {
    window.addEventListener('mouseup', stopDrag)
    return () => window.removeEventListener('mouseup', stopDrag)
  }, [stopDrag])

  // クリックとドラッグを区別
  const handleTaskClick = useCallback((taskId) => {
    if (drag.current.hasMoved) return
    onTaskClick(taskId)
  }, [onTaskClick])

  // ── ユーティリティ ──────────────────────────────
  const isCurrentWeek = (w) => {
    const next = new Date(w.getTime() + 7 * 86400000)
    return w <= new Date(todayStr) && new Date(todayStr) < next
  }

  const weekCells = weeks.map((w, i) => (
    <div key={i} className={`gantt-week-cell ${isCurrentWeek(w) ? 'current' : ''}`} />
  ))

  // ── タスク行レンダリング ────────────────────────
  const renderTaskRow = (t) => {
    const proj    = projects.find((p) => p.id === t.projectId)
    const catInfo = CATEGORY_MAP[t.category] || CATEGORY_MAP.other

    const labelCol = (
      <div
        className="gantt-task-label"
        style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }}
      >
        <div className="gantt-task-name" title={t.name}>{t.name}</div>
        <div className="gantt-task-sub" title={`${proj?.name ?? ''} | ${t.assignee}`}>
          {proj?.name ?? ''} | {t.assignee}
        </div>
      </div>
    )

    if (!t.start || !t.end) {
      return (
        <div key={t.id} className="gantt-row" onClick={() => handleTaskClick(t.id)}>
          {labelCol}
          <div className="gantt-bars">
            {weekCells}
            <span className="gantt-tbd-label">期限未設定</span>
          </div>
        </div>
      )
    }

    const taskStart   = new Date(t.start)
    const taskEnd     = new Date(t.end)
    const startOffset = Math.round((taskStart - minDate) / (7 * 86400000))
    const duration    = Math.max(1, Math.round((taskEnd - taskStart) / (7 * 86400000)) + 1)
    const barLeft     = startOffset * WEEK_WIDTH + 4
    const barWidth    = Math.max(24, duration * WEEK_WIDTH - 8)

    const barBg = (t.important && t.status !== 'done') ? '#ff4444'
                : t.status === 'done'  ? '#00e676'
                : t.status === 'hold'  ? '#ffd740'
                : catInfo.barColor

    return (
      <div key={t.id} className="gantt-row" onClick={() => handleTaskClick(t.id)}>
        {labelCol}
        <div className="gantt-bars">
          {weekCells}
          <div
            className="gantt-bar"
            style={{
              left:       barLeft,
              width:      barWidth,
              background: barBg,
              color:      '#0a0c10',
              opacity:    t.status === 'todo' ? 0.5 : 1,
              border:     t.status === 'todo' ? '1px solid #363b47' : 'none',
            }}
            title={`${t.name}\n${t.start} → ${t.end}\n進捗: ${t.progress}%`}
          />
        </div>
      </div>
    )
  }

  // ── 空状態 ──────────────────────────────────────
  if (!tasks.length) {
    return (
      <div className="gantt-page">
        <div className="section-title">ガントチャート（週単位）</div>
        <div className="empty-state"><div className="icon">📅</div>タスクがありません</div>
      </div>
    )
  }

  // ── メインレンダリング ──────────────────────────
  return (
    <div className="gantt-page">
      <div className="section-title">ガントチャート（週単位）</div>

      {/* コントロールバー */}
      <div className="gantt-controls">
        <div className="gantt-view-tabs">
          {VIEW_MODES.map((m) => (
            <button
              key={m.key}
              className={`gantt-tab ${viewMode === m.key ? 'active' : ''}`}
              onClick={() => handleViewMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="gantt-search-wrap">
          <input
            className="gantt-search"
            type="text"
            placeholder="タスク名・プロジェクト・担当者で検索…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button className="gantt-search-clear" onClick={() => handleSearch('')}>×</button>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state"><div className="icon">🔍</div>検索結果がありません</div>
      ) : (
        <div
          className="gantt-container"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <div style={{ minWidth: LABEL_WIDTH + weeks.length * WEEK_WIDTH }}>

            {/* ヘッダー行 */}
            <div className="gantt-header">
              <div className="gantt-label-col" style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}>
                タスク / プロジェクト
              </div>
              <div className="gantt-weeks-header">
                {weeks.map((w, i) => (
                  <div key={i} className={`gantt-week-col ${isCurrentWeek(w) ? 'current' : ''}`}>
                    {w.getMonth() + 1}/{w.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {/* グループ＋タスク行 */}
            {grouped.map((group) => (
              <React.Fragment key={group.key}>
                {group.label && (
                  <div className="gantt-group-header">
                    <span>{group.label}</span>
                    <span className="gantt-group-count">{group.tasks.length} タスク</span>
                  </div>
                )}
                {group.tasks.map(renderTaskRow)}
              </React.Fragment>
            ))}

          </div>
        </div>
      )}

      {/* 凡例 */}
      <div className="gantt-legend">
        {Object.entries(CATEGORY_MAP).map(([key, { label, barColor }]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: barColor }} />
            {label}
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ffd740' }} />
          保留
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8890a0', opacity: 0.5 }} />
          未着手
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ff4444' }} />
          重要
        </div>
      </div>
    </div>
  )
}
