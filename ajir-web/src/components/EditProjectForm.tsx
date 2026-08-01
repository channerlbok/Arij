import { useState } from "react";
import type { FormEvent } from 'react'
import type { Project } from '../types/Project'
import { API_BASE_URL } from '../config'

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null> (null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault()

        setSubmitError(null)
        if(name.trim() === ''){
            setSubmitError('Name is required')
            return
        }
        if(description.trim() === ''){
            setSubmitError('Description is required')
            return
        }
        setIsSubmitting(true)
        try{
          const response = await fetch(`${API_BASE_URL}/projects/${project.id}`,
            {
                method: 'PUT',
                credentials: 'include',
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
        catch{
            setSubmitError('Failed to update project')
        }
        finally{
            setIsSubmitting(false)
        }
    }
    return (
    <form onSubmit={handleSubmit}>
      <h2>Edit project</h2>

      <input
        value={name}
        onChange={event => setName(event.target.value)}
        required
      />

      <textarea
        value={description}
        onChange={event =>
          setDescription(event.target.value)
        }
        required
      />

      {submitError && (
          <p className="error-message">{submitError}</p>
      )}
      <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Updating...' : 'Update Poject'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

export default EditProjectForm