import { useState } from "react";
import type { FormEvent } from 'react'
import type { Issue } from '../types/Issue'
import type { Project } from '../types/Project'
import { API_BASE_URL } from '../config'

interface CreateIssueFormProps{
    project: Project
    onIssueCreated: (issue: Issue) => void
}

function CreateIssueForm({
    project,
    onIssueCreated
}: CreateIssueFormProps){

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('')
    const [status, setStatus] = useState('')
    const [priority, setPriority] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitError(null)

        if(title.trim() === ''){
            setSubmitError('Title is required')
            return
        }
        if(description.trim() === ''){
            setSubmitError('Description is required')
            return
        }
        try{   
            setIsSubmitting(true)     
            const response = await fetch(`${API_BASE_URL}/projects/${project.id}/issues`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title, description, type, status, priority})
            })

            if(!response.ok){
                throw new Error('Failed to create Issue') 
            }

            const issue: Issue = await response.json()
            onIssueCreated(issue)
            setTitle('')
            setDescription('')
            setPriority('')
            setStatus('')
            setType('')
        }
        catch{
            setSubmitError('Failed to submit issue')
        }
        finally{
            setIsSubmitting(false)
        }

    }

    return(
        <form onSubmit={handleSubmit}>
            <h1> Create an Issue</h1>
            <label>
            Issue title
            <input
                value={title}
                onChange={event => setTitle(event.target.value)}
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
            
            <label>
            Type
            <select
                value={type}
                onChange={event => setType(event.target.value)}
                required
            >
                <option value = "">Select a type</option>
                <option value = "Bug">Bug</option>
                <option value = "Task">Task</option>
            </select>
            </label>
            
            <label>
            Priority
            <select
                value={priority}
                onChange={event => setPriority(event.target.value)}
                required
            >
                <option value = "">Select a priority</option>
                <option value = "High">High</option>
                <option value = "Medium">Medium</option>
                <option value = "Low">Low</option>
            </select>
            </label>
            
            <label>
            Status
            <select
                value={status}
                onChange={event => setStatus(event.target.value)}
                required
            
            >
                <option value = "">Select a status</option>
                <option value = "ToDo">Todo</option>
                <option value = "InProgress">InProgress</option>
                <option value = "Done">Done</option>
            </select>
            </label>
            {submitError && (
                <p className="error-message"> {submitError} </p>
            )}
            <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Issue'}
            </button>
        </form>
    )
}

export default CreateIssueForm