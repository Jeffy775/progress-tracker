import React from 'react'
import NotificationBell from './NotificationBell.jsx'
import './Header.css'

export default function Header({
  currentView, onViewChange, onAddClick,
  userEmail, onSignOut,
  tasks = [], projects = [], onShowNotifications,
}) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-dot" />
        PROGRESS TRACKER
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          ダッシュボード
        </button>
        <button
          className={`nav-tab ${currentView === 'gantt' ? 'active' : ''}`}
          onClick={() => onViewChange('gantt')}
        >
          ガントチャート
        </button>
      </nav>

      <div className="header-right">
        <NotificationBell
          tasks={tasks}
          projects={projects}
          onShowAll={onShowNotifications}
        />
        {userEmail && (
          <span className="header-user">{userEmail}</span>
        )}
        <button className="btn-primary" onClick={onAddClick}>
          ＋ 新規追加
        </button>
        {onSignOut && (
          <button className="btn-signout" onClick={onSignOut} title="ログアウト">
            ログアウト
          </button>
        )}
      </div>
    </header>
  )
}
