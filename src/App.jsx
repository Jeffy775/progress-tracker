import React, { useState } from 'react'
import { useAppData } from './hooks/useAppData.js'
import Header        from './components/Header.jsx'
import Dashboard     from './components/Dashboard.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import GanttChart    from './components/GanttChart.jsx'
import { TaskModal, ProjectModal } from './components/Modal.jsx'
import Login         from './components/Login.jsx'

export default function App() {
  const {
    projects, tasks, loading,
    user, authLoading,
    signIn, signUp, signOut,
    addProject, editProject, deleteProject,
    addTask,    editTask,    deleteTask,
  } = useAppData()

  const [view, setView]                         = useState('dashboard')
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [modal, setModal]                       = useState(null)

  const closeModal = () => setModal(null)

  const handleAddClick = () => {
    if (view === 'detail') {
      setModal({ type: 'task', task: null, defaultProjectId: currentProjectId })
    } else {
      setModal({ type: 'project', project: null })
    }
  }

  const handleProjectClick = (id) => {
    setCurrentProjectId(id)
    setView('detail')
  }

  const handleTaskClick = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) setModal({ type: 'task', task })
  }

  const handleProjectSave = (form) => {
    if (modal.project) editProject({ ...modal.project, ...form })
    else               addProject(form)
    closeModal()
  }

  const handleProjectDelete = () => {
    deleteProject(modal.project.id)
    closeModal()
    setView('dashboard')
  }

  const handleTaskSave = (form) => {
    if (modal.task) editTask({ ...modal.task, ...form })
    else            addTask(form)
    closeModal()
  }

  const handleTaskDelete = () => {
    deleteTask(modal.task.id)
    closeModal()
  }

  const currentProject = projects.find((p) => p.id === currentProjectId)
  const currentTasks   = tasks.filter((t)   => t.projectId === currentProjectId)

  // 認証確認中
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text2)',
        fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em',
      }}>
        LOADING...
      </div>
    )
  }

  // 未ログイン
  if (!user) {
    return <Login onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <>
      <Header
        currentView={view}
        onViewChange={(v) => setView(v)}
        onAddClick={handleAddClick}
        userEmail={user.email}
        onSignOut={signOut}
      />

      {loading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 60px)', color: 'var(--text2)',
          fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em',
        }}>
          LOADING...
        </div>
      ) : (
        <>
          {view === 'dashboard' && (
            <Dashboard
              projects={projects}
              tasks={tasks}
              onProjectClick={handleProjectClick}
              onTaskClick={handleTaskClick}
              onEditProject={(project) => setModal({ type: 'project', project })}
            />
          )}

          {view === 'detail' && currentProject && (
            <ProjectDetail
              project={currentProject}
              tasks={currentTasks}
              onBack={() => setView('dashboard')}
              onTaskClick={handleTaskClick}
              onAddTask={() => setModal({ type: 'task', task: null, defaultProjectId: currentProjectId })}
            />
          )}

          {view === 'gantt' && (
            <GanttChart
              projects={projects}
              tasks={tasks}
              onTaskClick={handleTaskClick}
            />
          )}

          {modal?.type === 'project' && (
            <ProjectModal
              project={modal.project}
              onSave={handleProjectSave}
              onDelete={handleProjectDelete}
              onClose={closeModal}
            />
          )}

          {modal?.type === 'task' && (
            <TaskModal
              task={modal.task}
              projects={projects}
              onSave={handleTaskSave}
              onDelete={handleTaskDelete}
              onClose={closeModal}
            />
          )}
        </>
      )}
    </>
  )
}
