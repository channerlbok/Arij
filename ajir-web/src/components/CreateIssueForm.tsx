import { useState } from "react";
import type { FormEvent } from 'react'
import type { Issue } from '../types/Issue'
import type { Project } from '../types/Project'

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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const response = await fetch(`http://localhost:5244/projects/${project.id}/issues`, {
            method: 'POST',
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
        setTitle('')
        setType('')
    }

    return(
        <form onSubmit={handleSubmit}>
            <label>
            Issue title
            <input
                value={title}
                onChange={event => setTitle(event.target.value)}
            />
            </label>

            <label>
            Description
            <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
            />
            </label>
            
            <label>
            Type
            <textarea
                value={type}
                onChange={event => setType(event.target.value)}
            />
            </label>
            
            <label>
            Priority
            <textarea
                value={priority}
                onChange={event => setPriority(event.target.value)}
            />
            </label>
            
            <label>
            Status
            <textarea
                value={status}
                onChange={event => setStatus(event.target.value)}
            />
            </label>

            <button type="submit">Create issue</button>
        </form>
    )
}

export default CreateIssueForm