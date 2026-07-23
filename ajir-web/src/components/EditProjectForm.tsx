import { useState } from "react";
import type { FormEvent } from 'react'
import type { Project } from '../types/Project'


interface EditProjectFormProps{
    project: Project
    onProjectUpdated: (project: Project) => void
    onCancel: () => void
}

function EditProjectForm({
    project,
    onProjectUpdated,
    onCancel
}: EditProjectFormProps){
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault()

        const response = await fetch(`http://localhost:5244/projects/${project.id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({name, description})
            }
        )

        if(!response.ok)
        {
            throw new Error('Failed to update project')
        }

        const updatedProject: Project = await response.json()
        onProjectUpdated(updatedProject)
    }
    return (
    <form onSubmit={handleSubmit}>
      <h2>Edit project</h2>

      <input
        value={name}
        onChange={event => setName(event.target.value)}
      />

      <textarea
        value={description}
        onChange={event =>
          setDescription(event.target.value)
        }
      />

      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

export default EditProjectForm