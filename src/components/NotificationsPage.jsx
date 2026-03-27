import React from 'react'
import { computeNotifications } from '../utils/notifications.js'
import './NotificationsPage.css'

export default function NotificationsPage({ tasks, projects, onBack }) {
  const notifications = computeNotifications(tasks, projects)
  const overdueList   = notifications.filter((n) => n.type === 'overdue')
  const soonList      = notifications.filter((n) => n.type === 'soon')

  return (
    <div className="np-page">
      <div className="np-header">
        <button className="btn-secondary" onClick={onBack}>← 戻る</button>
        <h1 className="np-title">通知一覧</h1>
        {notifications.length > 0 && (
          <span className="np-total">{notifications.length} 件</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎉</div>
          期限超過・期限間近のタスクはありません
        </div>
      ) : (
        <>
          {overdueList.length > 0 && (
            <section className="np-section">
              <div className="np-section-title overdue">
                🚨 期限超過（{overdueList.length}件）— 早急に対応してください
              </div>
              <div className="np-list">
                {overdueList.map((n, i) => <NotifRow key={i} n={n} />)}
              </div>
            </section>
          )}

          {soonList.length > 0 && (
            <section className="np-section">
              <div className="np-section-title soon">
                ⚠️ 期限間近 7日以内（{soonList.length}件）
              </div>
              <div className="np-list">
                {soonList.map((n, i) => <NotifRow key={i} n={n} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function NotifRow({ n }) {
  const warnText = n.type === 'overdue'
    ? `${Math.abs(n.days)}日超過 — 早急に対応してください`
    : n.days === 0 ? '本日が期限です'
    : `あと${n.days}日`

  return (
    <div className={`np-item ${n.type}`}>
      <div className="np-item-proj">{n.project?.name ?? '—'}</div>
      <div className="np-item-task">{n.task.name}</div>
      <div className="np-item-footer">
        <span className="np-item-date">期限: {n.task.end}</span>
        <span className={`np-item-warn ${n.type}`}>{warnText}</span>
      </div>
    </div>
  )
}
