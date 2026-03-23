import { useState, useCallback } from 'react'
import { loadData, saveData, today } from '../data/store.js'

export function useAppData() {
  const [data, setData] = useState(() => loadData())

  const update = useCallback((newData) => {
    setData(newData)
    saveData(newData)
  }, [])

  // ── プロジェクト ──────────────────────────
  const addProject = useCallback((proj) => {
    const newProj = { ...proj, id: 'p' + Date.now() }
    update({ ...data, projects: [...data.projects, newProj] })
  }, [data, update])

  const editProject = useCallback((proj) => {
    update({
      ...data,
      projects: data.projects.map((p) => (p.id === proj.id ? proj : p)),
    })
  }, [data, update])

  const deleteProject = useCallback((id) => {
    update({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
      tasks:    data.tasks.filter((t) => t.projectId !== id),
    })
  }, [data, update])

  // ── タスク ────────────────────────────────
  const addTask = useCallback((task) => {
    const newTask = { ...task, id: 't' + Date.now() }
    update({ ...data, tasks: [...data.tasks, newTask] })
  }, [data, update])

  const editTask = useCallback((task) => {
    update({
      ...data,
      tasks: data.tasks.map((t) => (t.id === task.id ? task : t)),
    })
  }, [data, update])

  const deleteTask = useCallback((id) => {
    update({ ...data, tasks: data.tasks.filter((t) => t.id !== id) })
  }, [data, update])

  return {
    projects: data.projects,
    tasks:    data.tasks,
    addProject, editProject, deleteProject,
    addTask,    editTask,    deleteTask,
  }
}
