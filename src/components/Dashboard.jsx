import React, { useState } from 'react'
import { today, daysLeft, isOverdue, calcProgress, STATUS_MAP, PROJECT_STATUS_MAP } from '../data/store.js'
import './Dashboard.css'

export default function Dashboard({ projects, tasks, onProjectClick, onTaskClick, onEditProject }) {
  const [dlFilter,   setDlFilter]   = useState('all')
  const [dlAssignee, setDlAssignee] = useState('all')
  const [dlSearch,   setDlSearch]   = useState('')

  // ── サマリー集計 ──────────────────────────
  const doneCount    = tasks.filter((t) => t.status === 'done').length
  const wipCount     = tasks.filter((t) => t.status === 'wip').length
  const overdueCount = tasks.filter((t) => isOverdue(t)).length
  const avgProgress  = calcProgress(tasks)

  // ── 直近期限タスク（未完了・期限あり・昇順） ──
  const allUpcoming = [...tasks]
    .filter((t) => t.status !== 'done' && t.end)
    .sort((a, b) => a.end.localeCompare(b.end))

  const overdueUpcomingCount = allUpcoming.filter((t) => isOverdue(t)).length
  const assignees = [...new Set(allUpcoming.map((t) => t.assignee).filter(Boolean))]

  const searchLower = dlSearch.toLowerCase()
  const upcomingTasks = allUpcoming
    .filter((t) => dlFilter   === 'all' || t.status   === dlFilter)
    .filter((t) => dlAssignee === 'all' || t.assignee === dlAssignee)
    .filter((t) => !searchLower ||
      t.name.toLowerCase().includes(searchLower) ||
      (projects.find((p) => p.id === t.projectId)?.name ?? '').toLowerCase().includes(searchLower)
    )
    .slice(0, 8)

  return (
    <div className="dashboard">
      {/* サマリーカード */}
      <div className="summary-grid">
        <StatCard color="cyan"   label="PROJECTS"    value={projects.length}  sub={`${projects.filter((p) => p.status === 'active').length} 進行中`} />
        <StatCard color="green"  label="TASKS DONE"  value={doneCount}        sub={`全 ${tasks.length} タスク`} />
        <StatCard color="yellow" label="IN PROGRESS" value={wipCount}         sub={`${overdueCount} 件 期限超過`} />
        <StatCard color="purple" label="AVG PROGRESS" value={<>{avgProgress}<span>%</span></>} sub="全タスク平均" />
      </div>

      {/* プロジェクト一覧 */}
      <div className="section-title">プロジェクト一覧</div>
      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state"><div className="icon">📁</div>プロジェクトがありません</div>
        ) : (
          projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              tasks={tasks.filter((t) => t.projectId === p.id)}
              onClick={() => onProjectClick(p.id)}
              onEdit={(e) => { e.stopPropagation(); onEditProject(p) }}
            />
          ))
        )}
      </div>

      {/* 直近の期限タスク */}
      <div className="section-title">直近の期限タスク</div>

      {overdueUpcomingCount > 0 && (
        <div className="deadline-warning">
          ⚠️ {overdueUpcomingCount} 件のタスクが期限を超過しています
        </div>
      )}

      {/* フィルター・検索 */}
      <div className="deadline-controls">
        <div className="dl-filter-group">
          {['all', 'wip', 'todo', 'hold'].map((key) => {
            const labels = { all: 'すべて', wip: '進行中', todo: '未着手', hold: '保留' }
            return (
              <button
                key={key}
                className={`dl-filter-chip ${dlFilter === key ? 'active' : ''}`}
                onClick={() => setDlFilter(key)}
              >
                {labels[key]}
              </button>
            )
          })}
        </div>
        {assignees.length > 0 && (
          <select
            className="dl-assignee-select"
            value={dlAssignee}
            onChange={(e) => setDlAssignee(e.target.value)}
          >
            <option value="all">担当者: 全て</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <div className="dl-search-wrap">
          <input
            className="dl-search"
            type="text"
            placeholder="タスク名・プロジェクト名で検索…"
            value={dlSearch}
            onChange={(e) => setDlSearch(e.target.value)}
          />
          {dlSearch && (
            <button className="dl-search-clear" onClick={() => setDlSearch('')}>×</button>
          )}
        </div>
      </div>

      <div className="deadline-list">
        {upcomingTasks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{allUpcoming.length === 0 ? '🎉' : '🔍'}</div>
            {allUpcoming.length === 0 ? '期限が迫っているタスクはありません' : '検索・フィルターに一致するタスクがありません'}
          </div>
        ) : (
          upcomingTasks.map((t) => (
            <DeadlineItem
              key={t.id}
              task={t}
              project={projects.find((p) => p.id === t.projectId)}
              onClick={() => onTaskClick(t.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── サブコンポーネント ────────────────────────

function StatCard({ color, label, value, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

function ProjectCard({ project, tasks, onClick, onEdit }) {
  const progress = calcProgress(tasks)
  const { label, cls } = PROJECT_STATUS_MAP[project.status] || PROJECT_STATUS_MAP.active
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const wipCount  = tasks.filter((t) => t.status === 'wip').length
  const holdCount = tasks.filter((t) => t.status === 'hold').length

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-header">
        <div className="project-name">{project.name}</div>
        <div className="project-header-right">
          <div className={`project-status-badge ${cls}`}>{label}</div>
          <button className="btn-project-edit" onClick={onEdit}>編集</button>
        </div>
      </div>
      <div className="project-meta">{project.start} → {project.end ?? <span className="meta-unlimited">無期限</span>}</div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-label">
          <span>全体進捗</span><span>{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="project-task-summary">
        <div className="task-count"><span className="c-done">{doneCount}</span> 完了</div>
        <div className="task-count"><span className="c-wip">{wipCount}</span> 進行中</div>
        <div className="task-count"><span className="c-hold">{holdCount}</span> 保留</div>
        <div className="task-count">計 <span>{tasks.length}</span></div>
      </div>
    </div>
  )
}

function DeadlineItem({ task, project, onClick }) {
  const days = daysLeft(task.end)
  let dateCls = ''
  let dateLabel = task.end
  if (days < 0)      { dateCls = 'overdue'; dateLabel = `${task.end} (${Math.abs(days)}日超過)` }
  else if (days <= 7){ dateCls = 'soon';    dateLabel = `${task.end} (${days}日後)` }

  const { label, cls } = STATUS_MAP[task.status] || STATUS_MAP.todo

  return (
    <div className="deadline-item" onClick={onClick}>
      <div className={`deadline-date ${dateCls}`}>{dateLabel}</div>
      <div>
        <div className="deadline-task">{task.name}</div>
        <div className="deadline-project">{project?.name ?? ''}</div>
      </div>
      <div className="deadline-project">
        <span className={`status-dot ${cls}`}>{label}</span>
      </div>
      <div className="deadline-assignee">{task.assignee}</div>
    </div>
  )
}
