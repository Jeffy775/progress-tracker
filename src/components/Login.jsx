import React, { useState } from 'react'
import './Login.css'

export default function Login({ onSignIn, onSignUp }) {
  const [mode,     setMode]     = useState('signin') // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)   // サインアップ確認メール送信後

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signin') {
      const err = await onSignIn(email, password)
      if (err) setError(err.message || err.error_description || 'ログインに失敗しました')
    } else {
      const err = await onSignUp(email, password)
      if (err) {
        setError(err.message || err.error_description || 'アカウント作成に失敗しました')
      } else {
        setDone(true)
      }
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-dot" />
            PROGRESS TRACKER
          </div>
          <p className="login-done-msg">
            確認メールを送信しました。<br />
            メール内のリンクをクリックしてからログインしてください。
          </p>
          <button
            className="btn-login"
            onClick={() => { setDone(false); setMode('signin') }}
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-dot" />
          PROGRESS TRACKER
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(null) }}
          >
            ログイン
          </button>
          <button
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(null) }}
          >
            新規登録
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            メールアドレス
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team@example.com"
              required
              autoFocus
            />
          </label>

          <label className="login-label">
            パスワード
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              minLength={6}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>
      </div>
    </div>
  )
}
