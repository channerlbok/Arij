import { useEffect, useState } from 'react'
import type { Project } from './types/Project'
import ProjectList from './components/ProjectList'
import CreateProjectForm from './components/CreateProjectForm'

function App() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    async function loadProjects() {
      const response = await fetch('http://localhost:5244/projects')
      const data: Project[] = await response.json()
      setProjects(data)
    }
    loadProjects()
  }, [])
  return (
  <>
    <h1>Ajir</h1>
    <p>{projects.length} projects</p>
    <CreateProjectForm 
      onProjectCreated={project => 
        setProjects(currentProjects => [
          ...currentProjects,
          project
        ])
      }
    />
    <ProjectList projects={projects} />

  </>
)
}

export default App