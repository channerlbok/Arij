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

  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProjects] =
    useState<Project | null>(null)
  const [isProjectLoading, setProjectIsLoading] = useState(true)
  const [projectLoadError, setProjectLoadError] =
    useState<string | null>(null)
  const [projectActionError, setProjectActionError] =
    useState<string | null>(null)

  // Get all projects
  useEffect(() => {
    async function loadProjects() {
      try {
        setProjectIsLoading(true)
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

        const data: Project[] = await response.json()
        setProjects(data)
      } catch {
        setProjectLoadError('Could not load projects')
      } finally {
        setProjectIsLoading(false)
      }
    }

    loadProjects()
  }, [navigate])

  // Delete a project
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
        throw new Error('Failed to delete project')
      }

      setProjects(currentProjects =>
        currentProjects.filter(
          project => project.id !== id
        )
      )
    } catch {
      setProjectActionError('Could not delete project')
    }
  }

  return (
    <AppLayout>
      <section className="page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Projects</h1>
            <p>
              Create projects and organize the issues that move
              them forward.
            </p>
          </div>

          <div className="project-count">
            <strong>{projects.length}</strong>
            <span>Total projects</span>
          </div>
        </section>

        {isProjectLoading && (
          <p>Loading projects...</p>
        )}

        {projectLoadError && (
          <p className="error-message">
            {projectLoadError}
          </p>
        )}

        <CreateProjectForm
          onProjectCreated={project =>
            setProjects(currentProjects => [
              ...currentProjects,
              project
            ])
          }
        />

        {editingProject && (
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

              setEditingProjects(null)
            }}
            onCancel={() => setEditingProjects(null)}
          />
        )}

        {projectActionError && (
          <p className="error-message">
            {projectActionError}
          </p>
        )}

        {!isProjectLoading && !projectLoadError && (
          <ProjectList
            projects={projects}
            onDeleteProject={handleDeleteProject}
            onEditProject={setEditingProjects}
            onSelectedProject={project =>
              navigate(`/projects/${project.id}/issues`)
            }
          />
        )}
      </section>
    </AppLayout>
  )
}

export default ProjectsPage