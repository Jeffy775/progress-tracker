// 通知計算ユーティリティ
// overdue: 期限超過（status !== done かつ end < today）
// soon:    期限間近（status !== done かつ 0 ≤ days ≤ 7）

export function computeNotifications(tasks, projects) {
  const t0 = new Date().toISOString().slice(0, 10)
  return tasks
    .filter((t) => t.status !== 'done' && t.end)
    .map((t) => {
      const proj = projects.find((p) => p.id === t.projectId)
      const days = Math.ceil((new Date(t.end) - new Date(t0)) / 86400000)
      if (days < 0)  return { task: t, project: proj, type: 'overdue', days }
      if (days <= 7) return { task: t, project: proj, type: 'soon',    days }
      return null
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'overdue' ? -1 : 1
      return a.task.end.localeCompare(b.task.end)
    })
}
