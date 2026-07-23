import { useEffect, useState } from 'react'
import type { Project } from './types/Project'
import ProjectList from './components/ProjectList'
import IssueList from './components/IssuesList'
import CreateProjectForm from './components/CreateProjectForm'
import EditProjectForm from './components/EditProjectForm'
import CreateIssueForm from'./components/CreateIssueForm'
import type { Issue } from './types/Issue'
import EditIssueForm from './components/EditIssueForm'


function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProjects] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)

  // Get all projects
  useEffect(() => {
    async function loadProjects() {
      const response = await fetch('http://localhost:5244/projects')
      const data: Project[] = await response.json()
      setProjects(data)
    }
    loadProjects()
  }, [])
  
  // Delete a project handler
  async function handleDeleteProject(id: string){
    const response = await fetch(`http://localhost:5244/projects/${id}`, 
      {
        method: 'DELETE'
      }
    )

    if(!response.ok){
      throw new Error('Failed to delete project')
    }

    setProjects(currentProjects =>
      currentProjects.filter(project => project.id !== id)
    )
    if (selectedProject?.id === id) {
      setSelectedProject(null)
      setIssues([])
      setEditingIssue(null)
    }

  }

   // Delete a issue handler
  async function handleDeleteIssue(projectId: string, issueId: string){
    const response = await fetch(`http://localhost:5244/projects/${projectId}/issues/${issueId}`, 
      {
        method: 'DELETE'
      }
    )

    if(!response.ok){
      throw new Error('Failed to delete issue')
    }

    setIssues(currentIssues =>
      currentIssues.filter(issue => issue.id !== issueId)
    )

  }
  
  // Get Issue for a project
  useEffect(() => {
    async function loadIssues() {

      if(selectedProject === null){
        return
      }

      const response = await fetch(`http://localhost:5244/projects/${selectedProject.id}/issues`)
      const data: Issue[] = await response.json()
      setIssues(data)
    }
    loadIssues()
    }, [selectedProject])

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

    {editingProject && (
      <EditProjectForm
        key={editingProject.id}
        project={editingProject}
        onProjectUpdated={updateProject => {
          setProjects(currentProjects=>
            currentProjects.map(project =>
          project.id === updateProject.id
          ? updateProject
          : project
          )
        )
        setEditingProjects(null)
      }}
      onCancel={() => setEditingProjects(null)}
        />
    )}
    {selectedProject &&(
      <>
        <h2>Issues for {selectedProject.name}</h2>
        <CreateIssueForm
          project = {selectedProject}
          onIssueCreated={newIssue => {
            setIssues(currentIssues => [
              ...currentIssues,
              newIssue
            ])
          }}
      />
      <IssueList
        issues={issues}
        onEditIssue={setEditingIssue}
        onDeleteIssue={issueId =>
          handleDeleteIssue(selectedProject.id, issueId)}
      />
      </>
    )}
    {selectedProject && editingIssue &&(
      <EditIssueForm
      key={editingIssue.id}
      project={selectedProject}
      issue={editingIssue}
      onIssueUpdated={updatedIssue =>{
        setIssues(currentIssues =>
          currentIssues.map(issue =>
          issue.id === updatedIssue.id
          ? updatedIssue
          : issue
          )
        )
        setEditingIssue(null)
      }}
      onCancel={() => setEditingIssue(null)}
    />
    )}
    <ProjectList 
    projects={projects} 
    onDeleteProject={handleDeleteProject}
    onEditProject={setEditingProjects}
    onSelectedProject={setSelectedProject}

    />

  </>
)
}

export default App