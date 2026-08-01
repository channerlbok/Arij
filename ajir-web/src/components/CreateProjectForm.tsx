import { useState } from "react";
import type { FormEvent } from 'react'
import type { Project } from '../types/Project'
import { API_BASE_URL } from '../config'

interface CreateProjectFormProps{
    onProjectCreated: (project: Project) => void
}

function CreateProjectForm({
    onProjectCreated
}: CreateProjectFormProps){
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null> (null)
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
            const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, description})
            })

            if(!response.ok){
                throw new Error('Failed to create project')
            }

            const project: Project  = await response.json()
            onProjectCreated(project)
            setName('')
            setDescription('')
        }
        catch{
            setSubmitError('Failed to submit project')
        }
        finally{
            setIsSubmitting(false)
        }


    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
            Project name
            <input
                value={name}
                onChange={event => setName(event.target.value)}
                required
            />
            </label>

            <label>
            Description
            <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                required
            />
            </label>
            {submitError && (
                <p className="error-message">{submitError}</p>
            )}
            <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Poject'}
            </button>
            
        </form>
    )
}

export default CreateProjectForm