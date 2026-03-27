import React, { useState } from 'react'
import { calcProgress, CATEGORY_MAP, STATUS_MAP, isOverdue } from '../data/store.js'
import './ProjectDetail.css'

const FILTERS = [
  { key: 'all',    label: 'すべて'    },
  { key: 'wip',    label: '進行中'    },
  { key: 'todo',   label: '未着手'    },
  { key: 'done',   label: '完了'      },
  { key: 'hold',   label: '保留'      },
  { key: 'verify', label: '検証'      },
  { key: 'eval',   label: '評価'      },
  { key: 'mfg',    label: '製造・外注' },
]

export default function ProjectDetail({ project, tasks, onBack, onTaskClick, onAddTask }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filter || t.category === filter)

  const progress = calcProgress(tasks)

  return (
    <div className="project-detail">
      <div className="detail-header">
        <button className="btn-secondary" onClick={onBack}>← 戻る</button>
        <div className="detail-title">{project.name}</div>
        <div className="detail-progress-label">全体 {progress}%</div>
      </div>

      {/* フィルター */}
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* タスクテーブル */}
      <div className="task-table-wrap">
        <table className="task-table">
          <thead>
            <tr>
              <th>タスク名</th>
              <th>カテゴリ</th>
              <th>担当者</th>
              <th>期限</th>
              <th>重要</th>
              <th>ステータス</th>
              <th>進捗</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state"><div className="icon">✅</div>タスクがありません</div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <TaskRow key={t.id} task={t} onClick={() => onTaskClick(t.id)} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn-primary" onClick={onAddTask}>＋ タスク追加</button>
      </div>
    </div>
  )
}

function TaskRow({ task, onClick }) {
  const { label: catLabel, cls: catCls } = CATEGORY_MAP[task.category] || CATEGORY_MAP.other
  const { label: statusLabel, cls: statusCls } = STATUS_MAP[task.status] || STATUS_MAP.todo

  return (
    <tr className="task-row" onClick={onClick}>
      <td className="task-name-cell">{task.name}</td>
      <td><span className={`category-tag ${catCls}`}>{catLabel}</span></td>
      <td className="cell-mono">{task.assignee}</td>
      <td className={`cell-mono ${isOverdue(task) ? 'text-red' : ''}`}>
        {task.end ?? <span className="text-tbd">未定</span>}
      </td>
      <td>{task.important && <span className="important-badge">重要</span>}</td>
      <td><span className={`status-dot ${statusCls}`}>{statusLabel}</span></td>
      <td>
        <div className="mini-progress">
          <div className="mini-bar">
            <div className="mini-bar-fill" style={{ width: `${task.progress}%` }} />
          </div>
          <div className="mini-pct">{task.progress}%</div>
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <button className="btn-edit-row" onClick={onClick}>編集</button>
      </td>
    </tr>
  )
}
