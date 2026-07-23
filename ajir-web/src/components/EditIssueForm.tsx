import { useState } from "react";
import type { FormEvent } from 'react'
import type { Issue } from '../types/Issue'
import type { Project } from "../types/Project";


interface EditIssueProps{
    project: Project
    issue: Issue
    onIssueUpdated: (issue: Issue) => void
    onCancel: () => void
}

function EditIssueForm({
    project,
    issue,
    onIssueUpdated,
    onCancel
}: EditIssueProps){

    const [title, setTitle] = useState(issue.title)
    const [description, setDescription] = useState(issue.description)
    const [status, setStatus] = useState(issue.status)
    const [priority, setPriority] = useState(issue.priority)
    const [type, setType] = useState(issue.type)

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault()

        const response = await fetch(`http://localhost:5244/projects/${project.id}/issues/${issue.id}`, 
            {
                method: "PUT",
                headers:{
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({title,description,status,priority,type})
            }
        )

        if(!response.ok){
            throw new Error('Failed to update issue')
        }

        const updatedIssue: Issue = await response.json()

        onIssueUpdated(updatedIssue)
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

            <button type="submit">Update issue</button>
            <button type="button" onClick={onCancel}>
            Cancel
            </button>
        </form>
    )

}
export default EditIssueForm