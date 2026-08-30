import type { Project } from '../types/Project'

interface ProjectListProps {
  projects: Project[]
  onDeleteProject: (id: string) => void
  onEditProject: (project: Project) => void
  onSelectedProject: (project: Project) => void
}

function ProjectList({
  projects,
  onDeleteProject,
  onEditProject,
  onSelectedProject
}: ProjectListProps) {
  return (
    <ul className="project-list">
      {projects.map(project => (
        <li
          className="project-card"
          key={project.id}
        >
          <div className="project-card-heading">
            <div className="project-icon">
              {project.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
            </div>
          </div>

          <div className="card-actions">
            <button
              className="button-danger"
              type="button"
              onClick={() =>
                onDeleteProject(project.id)
              }
            >
              Delete
            </button>

            <button
              className="button-secondary"
              type="button"
              onClick={() =>
                onEditProject(project)
              }
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectedProject(project)
              }
            >
              View issues
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ProjectList