import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/Project'
import ProjectList from '../components/ProjectList'
import CreateProjectForm from '../components/CreateProjectForm'
import EditProjectForm from '../components/EditProjectForm'
import AppLayout from '../components/AppLayout'
import { API_BASE_URL } from '../config'

function ProjectsPage() {
  const navigate = useNavigate()

  const [projects, setProjects] =
    useState<Project[]>([])

  const [editingProject, setEditingProject] =
    useState<Project | null>(null)

  const [isProjectLoading, setIsProjectLoading] =
    useState(true)

  const [projectLoadError, setProjectLoadError] =
    useState<string | null>(null)

  const [projectActionError, setProjectActionError] =
    useState<string | null>(null)

  const recentProjects = [...projects]
    .sort(
      (firstProject, secondProject) =>
        new Date(secondProject.createdAt).getTime() -
        new Date(firstProject.createdAt).getTime()
    )
    .slice(0, 3)

  const now = new Date()
  const projectsAddedThisMonth = projects.filter(project => {
    const createdAt = new Date(project.createdAt)

    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    )
  }).length

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsProjectLoading(true)
        setProjectLoadError(null)

        const response = await fetch(
          `${API_BASE_URL}/projects`,
          {
            credentials: 'include'
          }
        )

        if (response.status === 401) {
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load projects')
        }

        const data: Project[] =
          await response.json()

        setProjects(data)
      } catch {
        setProjectLoadError(
          'Could not load projects'
        )
      } finally {
        setIsProjectLoading(false)
      }
    }

    loadProjects()
  }, [navigate])

  async function handleDeleteProject(id: string) {
    const confirmed = window.confirm(
      'Delete this project and all its issues?'
    )

    if (!confirmed) {
      return
    }

    setProjectActionError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to delete project'
        )
      }

      setProjects(currentProjects =>
        currentProjects.filter(
          project => project.id !== id
        )
      )

      if (editingProject?.id === id) {
        setEditingProject(null)
      }
    } catch {
      setProjectActionError(
        'Could not delete project'
      )
    }
  }

  return (
    <AppLayout>
      <section className="board-overview-layout">
        <aside className="board-note board-stats-note">
          <span className="board-pin" aria-hidden="true" />
          <p className="board-note-label">Board overview</p>
          <h2>At a glance</h2>
          <dl className="board-stats-list">
            <div>
              <dt>Total projects</dt>
              <dd>{projects.length}</dd>
            </div>
            <div>
              <dt>Added this month</dt>
              <dd>{projectsAddedThisMonth}</dd>
            </div>
          </dl>
        </aside>

        <section className="page-heading">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h1>Projects</h1>
            <p>
              Pin your projects to the board and keep track of
              the work that moves them forward.
            </p>
          </div>

          <div className="project-count">
            <strong>{projects.length}</strong>
            <span>Total projects</span>
          </div>
        </section>

        <aside className="board-note recent-projects-note">
          <span className="board-pin" aria-hidden="true" />
          <p className="board-note-label">Recently pinned</p>
          {recentProjects.length === 0 ? (
            <p className="recent-empty">New projects will appear here.</p>
          ) : (
            <ol className="recent-projects-list">
              {recentProjects.map(project => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/projects/${project.id}/issues`)
                    }
                  >
                    <strong>{project.name}</strong>
                    <time dateTime={project.createdAt}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </time>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </section>

      {isProjectLoading && (
        <p className="status-message">
          Loading projects...
        </p>
      )}

      {projectLoadError && (
        <p className="error-message">
          {projectLoadError}
        </p>
      )}

      {projectActionError && (
        <p className="error-message">
          {projectActionError}
        </p>
      )}

            <CreateProjectForm
        onProjectCreated={newProject => {
          setProjects(currentProjects => [
            ...currentProjects,
            newProject
          ])
        }}
      />

      {editingProject && (
        <div
          className="project-edit-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setEditingProject(null)
            }
          }}
        >
          <section className="project-edit-dialog">
            <div className="project-edit-dialog-header">
              <div>
                <p className="member-invite-eyebrow">
                  PROJECT DETAILS
                </p>
                <h2>Edit project</h2>
              </div>

              <button
                className="project-edit-close"
                type="button"
                onClick={() => setEditingProject(null)}
                aria-label="Close edit project form"
              >
                ×
              </button>
            </div>

            <EditProjectForm
              key={editingProject.id}
              project={editingProject}
              onProjectUpdated={updatedProject => {
                setProjects(currentProjects =>
                  currentProjects.map(project =>
                    project.id === updatedProject.id
                      ? updatedProject
                      : project
                  )
                )

                setEditingProject(null)
              }}
              onCancel={() => setEditingProject(null)}
            />
          </section>
        </div>
      )}

      {!isProjectLoading &&
        !projectLoadError &&
        projects.length === 0 && (
          <p className="empty-board-message">
            Your board is empty. Create your
            first project above.
          </p>
        )}

      {!isProjectLoading &&
        !projectLoadError && (
          <aside className="board-legend" aria-label="Project note color guide">
            <strong>Note colors</strong>
            <span><i className="legend-swatch legend-yellow" />Planning</span>
            <span><i className="legend-swatch legend-pink" />Creative</span>
            <span><i className="legend-swatch legend-green" />In motion</span>
            <span><i className="legend-swatch legend-blue" />Reference</span>
          </aside>
        )}

      {!isProjectLoading &&
        !projectLoadError && (
          <ProjectList
            projects={projects}
            onDeleteProject={
              handleDeleteProject
            }
            onEditProject={
              setEditingProject
            }
            onSelectedProject={project =>
              navigate(
                `/projects/${project.id}/issues`
              )
            }
          />
        )}
    </AppLayout>
  )
}

export default ProjectsPage
