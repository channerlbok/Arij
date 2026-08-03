import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom'
import type { Issue } from '../types/Issue'
import type { Project } from '../types/Project'
import IssueList from '../components/IssuesList'
import CreateIssueForm from '../components/CreateIssueForm'
import EditIssueForm from '../components/EditIssueForm'
import AppLayout from '../components/AppLayout'
import { API_BASE_URL } from '../config'

function ProjectIssuesPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [issues, setIssues] = useState<Issue[]>([])
  const [project, setProject] =
    useState<Project | null>(null)
  const [editingIssue, setEditingIssue] =
    useState<Issue | null>(null)
  const [isIssueLoading, setIsIssueLoading] =
    useState(true)
  const [issueLoadError, setIssueLoadError] =
    useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] =
    useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [issueActionError, setIssueActionError] =
    useState<string | null>(null)
  const [isCreatingIssue, setIsCreatingIssue] =
  useState(false)

  useEffect(() => {
    async function loadIssues() {
      const queryParameters = new URLSearchParams()

      if (typeFilter !== '') {
        queryParameters.set('type', typeFilter)
      }

      if (priorityFilter !== '') {
        queryParameters.set(
          'priority',
          priorityFilter
        )
      }

      if (statusFilter !== '') {
        queryParameters.set('status', statusFilter)
      }

      const queryString = queryParameters.toString()

      try {
        setIsIssueLoading(true)
        setIssueLoadError(null)

        if (projectId === undefined) {
          return
        }

        const issueUrl =
          `${API_BASE_URL}/projects/${projectId}/issues` +
          (
            queryString === ''
              ? ''
              : `?${queryString}`
          )

        const response = await fetch(issueUrl, {
          credentials: 'include'
        })

        if (response.status === 401) {
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load issues')
        }

        const data: Issue[] = await response.json()
        setIssues(data)

        const projectResponse = await fetch(
          `${API_BASE_URL}/projects/${projectId}`,
          {
            credentials: 'include'
          }
        )

        if (projectResponse.status === 401) {
          navigate('/login')
          return
        }

        if (!projectResponse.ok) {
          throw new Error('Failed to load project')
        }

        const projectData: Project =
          await projectResponse.json()

        setProject(projectData)
      } catch {
        setIssueLoadError('Issues failed to load')
      } finally {
        setIsIssueLoading(false)
      }
    }

    loadIssues()
  }, [
    projectId,
    typeFilter,
    priorityFilter,
    statusFilter,
    navigate
  ])

  async function handleDeleteIssue(issueId: string) {
    const confirmed =
      window.confirm('Delete this issue?')

    if (!confirmed) {
      return
    }

    if (projectId === undefined) {
      return
    }

    setIssueActionError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/issues/${issueId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete issue')
      }

      setIssues(currentIssues =>
        currentIssues.filter(
          issue => issue.id !== issueId
        )
      )

      if (editingIssue?.id === issueId) {
        setEditingIssue(null)
      }
    } catch {
      setIssueActionError(
        'Could not delete issue'
      )
    }
  }

  function matchesCurrentFilters(issue: Issue) {
    const matchesType =
      typeFilter === '' ||
      issue.type === typeFilter

    const matchesPriority =
      priorityFilter === '' ||
      issue.priority === priorityFilter

    const matchesStatus =
      statusFilter === '' ||
      issue.status === statusFilter

    return (
      matchesType &&
      matchesPriority &&
      matchesStatus
    )
  }

  return (
    <AppLayout>
      <section className="page">
        <Link className="back-link" to="/projects">
          &larr; Back to projects
        </Link>

        <section className="page-heading">
          <div>
            <p className="eyebrow">
              PROJECT WORKSPACE
            </p>

            <h1>
              {project?.name ?? 'Project issues'}
            </h1>

            <p>
              Track, filter, and update this project's
              issues.
            </p>
          </div>

          <button
            className="primary-action"
            type="button"
            onClick={() => setIsCreatingIssue(true)}
          >
            + New issue
          </button>
        </section>

        {isIssueLoading && (
          <p>Loading issues...</p>
        )}

        {issueLoadError && (
          <p className="error-message">
            {issueLoadError}
          </p>
        )}

        {issueActionError && (
          <p className="error-message">
            {issueActionError}
          </p>
        )}

        <div className="issue-filters">
          <label>
            Filter by type

            <select
              value={typeFilter}
              onChange={event =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="">All types</option>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
              <option value="Feature">Feature</option>
            </select>
          </label>

          <label>
            Filter by status

            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All statuses</option>
              <option value="ToDo">To do</option>
              <option value="InProgress">
                In progress
              </option>
              <option value="Done">Done</option>
            </select>
          </label>

          <label>
            Filter by priority

            <select
              value={priorityFilter}
              onChange={event =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        {!isIssueLoading &&
          !issueLoadError &&
          issues.length === 0 && (
            <p>This project has no matching issues.</p>
          )}

        {!isIssueLoading && !issueLoadError && (
          <IssueList
            issues={issues}
            onEditIssue={setEditingIssue}
            onDeleteIssue={handleDeleteIssue}
          />
        )}

        {project && editingIssue && (
          <EditIssueForm
            key={editingIssue.id}
            project={project}
            issue={editingIssue}
            onIssueUpdated={updatedIssue => {
              setIssues(currentIssues => {
                if (
                  !matchesCurrentFilters(updatedIssue)
                ) {
                  return currentIssues.filter(
                    issue =>
                      issue.id !== updatedIssue.id
                  )
                }

                return currentIssues.map(issue =>
                  issue.id === updatedIssue.id
                    ? updatedIssue
                    : issue
                )
              })

              setEditingIssue(null)
            }}
            onCancel={() => setEditingIssue(null)}
          />
        )}
        {project && isCreatingIssue && (
          <div
            className="modal-backdrop"
            onMouseDown={() => setIsCreatingIssue(false)}
          >
            <div
              className="modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-issue-title"
              onMouseDown={event => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <p className="eyebrow">NEW WORK ITEM</p>
                  <h2 id="create-issue-title">
                    Create an issue
                  </h2>
                </div>

                <button
                  className="modal-close"
                  type="button"
                  onClick={() => setIsCreatingIssue(false)}
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <CreateIssueForm
                project={project}
                onIssueCreated={newIssue => {
                  if (matchesCurrentFilters(newIssue)) {
                    setIssues(currentIssues => [
                      ...currentIssues,
                      newIssue
                    ])
                  }

                  setIsCreatingIssue(false)
                }}
              />
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  )
}

export default ProjectIssuesPage