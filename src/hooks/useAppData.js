import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { defaultData } from '../data/store.js'

// ── ローカル形式 ↔ DBカラム名の変換 ──────────────
const toDbProject = (p, userId) => ({
  id:         p.id,
  name:       p.name,
  start_date: p.start,
  end_date:   p.end,
  status:     p.status,
  user_id:    userId,
})

const toDbTask = (t, userId) => ({
  id:         t.id,
  project_id: t.projectId,
  name:       t.name,
  assignee:   t.assignee,
  category:   t.category,
  start_date: t.start,
  end_date:   t.end,
  status:     t.status,
  priority:   t.priority,
  progress:   t.progress,
  memo:       t.memo,
  user_id:    userId,
})

const fromDbProject = (row) => ({
  id:     row.id,
  name:   row.name,
  start:  row.start_date,
  end:    row.end_date,
  status: row.status,
})

const fromDbTask = (row) => ({
  id:        row.id,
  projectId: row.project_id,
  name:      row.name,
  assignee:  row.assignee  ?? '',
  category:  row.category  ?? 'other',
  start:     row.start_date,
  end:       row.end_date,
  status:    row.status    ?? 'todo',
  priority:  row.priority  ?? 'mid',
  progress:  row.progress  ?? 0,
  memo:      row.memo      ?? '',
})

export function useAppData() {
  const [projects,    setProjects]    = useState([])
  const [tasks,       setTasks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── 認証状態の監視 ──────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── データ読み込み（ログイン時のみ）──────────────
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setProjects([])
      setTasks([])
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      const [{ data: pRows }, { data: tRows }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('tasks').select('*').order('created_at'),
      ])

      // DBが空ならサンプルデータを投入
      if (!pRows?.length) {
        const { projects: ps, tasks: ts } = defaultData
        await supabase.from('projects').insert(ps.map((p) => toDbProject(p, user.id)))
        await supabase.from('tasks').insert(ts.map((t) => toDbTask(t, user.id)))
        const [{ data: p2 }, { data: t2 }] = await Promise.all([
          supabase.from('projects').select('*').order('created_at'),
          supabase.from('tasks').select('*').order('created_at'),
        ])
        setProjects((p2 ?? []).map(fromDbProject))
        setTasks((t2 ?? []).map(fromDbTask))
      } else {
        setProjects((pRows ?? []).map(fromDbProject))
        setTasks((tRows ?? []).map(fromDbTask))
      }
      setLoading(false)
    }
    load()
  }, [user, authLoading])

  // ── 認証 ──────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // ── プロジェクト ──────────────────────────────
  const addProject = useCallback(async (proj) => {
    const newProj = { ...proj, id: 'p' + Date.now() }
    await supabase.from('projects').insert(toDbProject(newProj, user.id))
    setProjects((prev) => [...prev, newProj])
  }, [user])

  const editProject = useCallback(async (proj) => {
    await supabase.from('projects').update(toDbProject(proj, user.id)).eq('id', proj.id)
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? proj : p)))
  }, [user])

  const deleteProject = useCallback(async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
  }, [])

  // ── タスク ────────────────────────────────────
  const addTask = useCallback(async (task) => {
    const newTask = { ...task, id: 't' + Date.now() }
    await supabase.from('tasks').insert(toDbTask(newTask, user.id))
    setTasks((prev) => [...prev, newTask])
  }, [user])

  const editTask = useCallback(async (task) => {
    await supabase.from('tasks').update(toDbTask(task, user.id)).eq('id', task.id)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
  }, [user])

  const deleteTask = useCallback(async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    projects, tasks, loading,
    user, authLoading,
    signIn, signUp, signOut,
    addProject, editProject, deleteProject,
    addTask,    editTask,    deleteTask,
  }
}
