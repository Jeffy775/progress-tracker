import React, { useState, useEffect } from 'react'
import { today } from '../data/store.js'
import './Modal.css'

// ─────────────────────────────────────────────
// タスクモーダル
// ─────────────────────────────────────────────
export function TaskModal({ task, projects, onSave, onDelete, onClose }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    projectId: projects[0]?.id ?? '',
    name:      '',
    assignee:  '',
    category:  'verify',
    start:     today(),
    end:       today(),
    status:    'todo',
    important: false,
    progress:  0,
    memo:      '',
    ...(task ?? {}),
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // ステータス変更時に進捗率を自動スナップ
  const handleStatusChange = (val) => {
    set('status', val)
    if (val === 'done') set('progress', 100)
    if (val === 'todo') set('progress', 0)
  }

  const handleSave = () => {
    if (!form.name.trim()) { alert('タスク名を入力してください'); return }
    if (!form.projectId)   { alert('プロジェクトを選択してください'); return }
    onSave(form)
  }

  return (
    <ModalShell title={isEdit ? 'タスク編集' : 'タスク追加'} onClose={onClose}>
      <div className="form-group">
        <label>プロジェクト</label>
        <select value={form.projectId} onChange={(e) => set('projectId', e.target.value)}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>タスク名</label>
        <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
          placeholder="例: トランジスタ特性シミュレーション" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>担当者</label>
          <input type="text" value={form.assignee} onChange={(e) => set('assignee', e.target.value)}
            placeholder="例: 鈴木" />
        </div>
        <div className="form-group">
          <label>カテゴリ</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="verify">検証</option>
            <option value="eval">評価</option>
            <option value="mfg">製造・外注</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <div className="form-label-row">
            <span>開始日</span>
            <label className="checkbox-tbd">
              <input type="checkbox" checked={form.start === null}
                onChange={(e) => set('start', e.target.checked ? null : today())} />
              未定
            </label>
          </div>
          <input type="date" value={form.start ?? ''} disabled={form.start === null}
            onChange={(e) => set('start', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label-row">
            <span>期限</span>
            <label className="checkbox-tbd">
              <input type="checkbox" checked={form.end === null}
                onChange={(e) => set('end', e.target.checked ? null : today())} />
              未定
            </label>
          </div>
          <input type="date" value={form.end ?? ''} disabled={form.end === null}
            onChange={(e) => set('end', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ステータス</label>
          <select value={form.status} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="todo">未着手</option>
            <option value="wip">進行中</option>
            <option value="done">完了</option>
            <option value="hold">保留</option>
          </select>
        </div>
        <div className="form-group">
          <label>重要</label>
          <label className="checkbox-important">
            <input type="checkbox" checked={form.important}
              onChange={(e) => set('important', e.target.checked)} />
            重要タスクとしてマーク
          </label>
        </div>
      </div>

      {/* 進捗率スライダー（将来再導入予定）
      <div className="form-group">
        <label>進捗率</label>
        <div className="progress-input-wrap">
          <input type="range" min="0" max="100" value={form.progress}
            onChange={(e) => set('progress', Number(e.target.value))} />
          <div className="progress-display">{form.progress}%</div>
        </div>
      </div>
      */}

      <div className="form-group">
        <label>メモ</label>
        <textarea rows={2} value={form.memo} onChange={(e) => set('memo', e.target.value)}
          placeholder="補足・注意事項など" style={{ resize: 'vertical' }} />
      </div>

      <ModalFooter
        showDelete={isEdit}
        onDelete={() => { if (window.confirm('削除しますか？')) onDelete() }}
        onCancel={onClose}
        onSave={handleSave}
      />
    </ModalShell>
  )
}

// ─────────────────────────────────────────────
// プロジェクトモーダル
// ─────────────────────────────────────────────
export function ProjectModal({ project, onSave, onDelete, onClose }) {
  const isEdit = !!project

  const [form, setForm] = useState({
    name:   '',
    start:  today(),
    end:    today(),
    status: 'active',
    ...(project ?? {}),
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    if (!form.name.trim()) { alert('プロジェクト名を入力してください'); return }
    onSave(form)
  }

  return (
    <ModalShell title={isEdit ? 'プロジェクト編集' : 'プロジェクト追加'} onClose={onClose}>
      <div className="form-group">
        <label>プロジェクト名</label>
        <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
          placeholder="例: ○○チップ 設計レビュー" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>開始日</label>
          <input type="date" value={form.start} onChange={(e) => set('start', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label-row">
            <span>終了日（目標）</span>
            <label className="checkbox-tbd">
              <input type="checkbox" checked={form.end === null}
                onChange={(e) => set('end', e.target.checked ? null : today())} />
              無期限
            </label>
          </div>
          <input type="date" value={form.end ?? ''} disabled={form.end === null}
            onChange={(e) => set('end', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>ステータス</label>
        <select value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="active">進行中</option>
          <option value="hold">保留</option>
          <option value="done">完了</option>
        </select>
      </div>

      <ModalFooter
        showDelete={isEdit}
        onDelete={() => { if (window.confirm('削除しますか？（関連タスクも削除されます）')) onDelete() }}
        onCancel={onClose}
        onSave={handleSave}
      />
    </ModalShell>
  )
}

// ─────────────────────────────────────────────
// 共通シェル
// ─────────────────────────────────────────────
function ModalShell({ title, onClose, children }) {
  // オーバーレイクリックで閉じる
  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose() }

  // ESCキーで閉じる
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-title">
          <span>{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalFooter({ showDelete, onDelete, onCancel, onSave }) {
  return (
    <div className="modal-footer">
      {showDelete
        ? <button className="btn-danger" onClick={onDelete}>削除</button>
        : <span />
      }
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onCancel}>キャンセル</button>
        <button className="btn-primary"   onClick={onSave}>保存</button>
      </div>
    </div>
  )
}
