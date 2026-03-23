import React from 'react'
import './Header.css'

export default function Header({ currentView, onViewChange, onAddClick }) {
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

      <button className="btn-primary" onClick={onAddClick}>
        ＋ 新規追加
      </button>
    </header>
  )
}
