import React, { useMemo } from 'react'
import { today, CATEGORY_MAP } from '../data/store.js'
import './GanttChart.css'

const WEEK_WIDTH  = 80  // px：週カラムの横幅
const LABEL_WIDTH = 200 // px：タスク名列の固定幅

export default function GanttChart({ projects, tasks, onTaskClick }) {
  const todayStr = today()

  const { weeks, minDate } = useMemo(() => {
    if (!tasks.length) return { weeks: [], minDate: null }

    // 期限未定タスクは日付計算から除外
    const datedTasks = tasks.filter((t) => t.start && t.end)
    if (!datedTasks.length) return { weeks: [], minDate: null }

    const allDates = datedTasks.flatMap((t) => [new Date(t.start), new Date(t.end)])
    let min = new Date(Math.min(...allDates))
    let max = new Date(Math.max(...allDates))

    // 週の開始（月曜）に揃える
    const dow = min.getDay()
    min.setDate(min.getDate() - (dow === 0 ? 6 : dow - 1))
    max.setDate(max.getDate() + 7)

    const weeks = []
    const cur = new Date(min)
    while (cur <= max) {
      weeks.push(new Date(cur))
      cur.setDate(cur.getDate() + 7)
    }
    return { weeks, minDate: min }
  }, [tasks])

  if (!tasks.length) {
    return (
      <div className="gantt-page">
        <div className="section-title">ガントチャート（週単位）</div>
        <div className="empty-state"><div className="icon">📅</div>タスクがありません</div>
      </div>
    )
  }

  const isCurrentWeek = (w) => {
    const next = new Date(w.getTime() + 7 * 86400000)
    return w <= new Date(todayStr) && new Date(todayStr) < next
  }

  return (
    <div className="gantt-page">
      <div className="section-title">ガントチャート（週単位）</div>
      <div className="gantt-container">
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

          {/* タスク行 */}
          {tasks.map((t) => {
            const proj    = projects.find((p) => p.id === t.projectId)
            const catInfo = CATEGORY_MAP[t.category] || CATEGORY_MAP.other

            // タスク名列（共通）
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

            // 期限未定タスク：バーなし・「期限未設定」ラベル表示
            if (!t.start || !t.end) {
              return (
                <div key={t.id} className="gantt-row" onClick={() => onTaskClick(t.id)}>
                  {labelCol}
                  <div className="gantt-bars">
                    {weeks.map((w, i) => (
                      <div key={i} className={`gantt-week-cell ${isCurrentWeek(w) ? 'current' : ''}`} />
                    ))}
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

            // バー色：完了=緑、保留=黄、重要=赤、それ以外=カテゴリ色
            const barBg = t.status === 'done'
              ? '#00e676'
              : t.status === 'hold'
              ? '#ffd740'
              : t.important
              ? '#ff4444'
              : catInfo.barColor

            const barTextColor = barBg === '#ffd740' ? '#0a0c10' : '#0a0c10'

            return (
              <div key={t.id} className="gantt-row" onClick={() => onTaskClick(t.id)}>
                {labelCol}

                {/* バー列 */}
                <div className="gantt-bars">
                  {weeks.map((w, i) => (
                    <div key={i} className={`gantt-week-cell ${isCurrentWeek(w) ? 'current' : ''}`} />
                  ))}
                  <div
                    className="gantt-bar"
                    style={{
                      left: barLeft,
                      width: barWidth,
                      background: barBg,
                      color: barTextColor,
                      opacity: t.status === 'todo' ? 0.5 : 1,
                      border: t.status === 'todo' ? '1px solid #363b47' : 'none',
                    }}
                    title={`${t.name}\n${t.start} → ${t.end}\n進捗: ${t.progress}%`}
                  >
                    {t.progress}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
