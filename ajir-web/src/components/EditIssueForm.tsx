import { useState } from "react";
import type { FormEvent } from 'react'
import type { Issue } from '../types/Issue'
import type { Project } from "../types/Project";
import { API_BASE_URL } from '../config'

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null> (null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault()
        setSubmitError(null)

        if (title.trim() === '') {
        setSubmitError('Issue title is required')
        return
        }

        if (description.trim() === '') {
        setSubmitError('Issue description is required')
        return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${project.id}/issues/${issue.id}`, 
            {
                method: "PUT",
                credentials: 'include',
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
            } catch {
            setSubmitError('Failed to update issue')
        }
        finally{
            setIsSubmitting(false)
        }

    }

    return(
        <form onSubmit={handleSubmit}>
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
                <option value = "Feature">Feature</option>
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
            {isSubmitting ? 'Updating...' : 'Update Issue'}
            </button>
            <button type="button" onClick={onCancel}>
            Cancel
            </button>
        </form>
    )

}
export default EditIssueForm