import type { Project } from '../types/Project'

interface ProjectListProps {
  projects: Project[]
  onDeleteProject: (id: string) => void
  onEditProject: (project: Project) => void
  onSelectedProject: (project: Project) => void
}

function ProjectList({ projects, onDeleteProject, onEditProject, onSelectedProject }: ProjectListProps) {
  return (
    <ul className="project-list">
      {projects.map(project => (
        <li key={project.id}>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          <button onClick={() => onDeleteProject(project.id)}>
            Delete
          </button>
          <button onClick={() => onEditProject(project)}>
            Edit
          </button>
          <button onClick={() => onSelectedProject(project)}>
            View Issues
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ProjectList