import React, { useState, useRef, useEffect } from 'react'
import { computeNotifications } from '../utils/notifications.js'
import './NotificationBell.css'

export default function NotificationBell({ tasks, projects, onShowAll }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const notifications = computeNotifications(tasks, projects)
  const count  = notifications.length
  const recent = notifications.slice(0, 5)

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="bell-wrap" ref={ref}>
      <button
        className={`bell-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="通知"
      >
        🔔
        {count > 0 && (
          <span className="bell-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {open && (
        <div className="bell-dropdown">
          <div className="bell-dd-header">通知</div>

          {notifications.length === 0 ? (
            <div className="bell-dd-empty">通知はありません</div>
          ) : (
            <div className="bell-dd-list">
              {recent.map((n, i) => (
                <div key={i} className={`bell-dd-item ${n.type}`}>
                  <div className="bell-dd-proj">{n.project?.name ?? '—'}</div>
                  <div className="bell-dd-task">{n.task.name}</div>
                  <div className="bell-dd-meta">
                    <span className="bell-dd-date">期限: {n.task.end}</span>
                    <span className={`bell-dd-warn ${n.type}`}>
                      {n.type === 'overdue'
                        ? `${Math.abs(n.days)}日超過`
                        : n.days === 0 ? '本日期限' : `あと${n.days}日`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="bell-dd-more"
            onClick={() => { setOpen(false); onShowAll() }}
          >
            もっと見る {count > 0 ? `（${count}件）` : ''}
          </button>
        </div>
      )}
    </div>
  )
}
