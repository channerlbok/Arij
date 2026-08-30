import { useState } from "react";
import type { FormEvent } from 'react'
import type { ProjectMember } from '../types/ProjectMember'
import { API_BASE_URL } from '../config'


interface AddProjectMemberProps{
    projectId: string
    onProjectMemberAdded: (projectMember: ProjectMember) => void
}


function AddProjectMembers({
   projectId,
    onProjectMemberAdded
}: AddProjectMemberProps)
{
    const [email, setEmail] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitError(null)

        if(email.trim() === ''){
            setSubmitError('Email is required')
            return
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/projects/${projectId}/members`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email})
                }
            )
            if(!response.ok){
                throw new Error('Failed to add project member')
            }

            const projectMember = await response.json()
            onProjectMemberAdded(projectMember)
            setEmail('')
            setIsOpen(false)
        } catch{
            setSubmitError('Could not add project member')
        }
    }

    return (
    <>
        <button
        className="member-invite-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
        >
        + Add member
        </button>

        {isOpen && (
        <div
            className="member-invite-overlay"
            onMouseDown={event => {
            if (event.target === event.currentTarget) {
                setIsOpen(false)
            }
            }}
        >
            <form
            className="member-invite-dialog"
            onSubmit={handleSubmit}
            >
            <button
                className="member-invite-close"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
            >
                ×
            </button>

            <p className="member-invite-eyebrow">
                PROJECT ACCESS
            </p>

            <h2>Add a teammate</h2>

            <p className="member-invite-copy">
                Invite an existing Mochu user using their email.
            </p>

            <label className="member-invite-label">
                Email address
                <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                maxLength={100}
                required
                />
            </label>

            {submitError && (
                <p className="error-message">{submitError}</p>
            )}

            <div className="member-invite-actions">
                <button
                className="member-invite-cancel"
                type="button"
                onClick={() => setIsOpen(false)}
                >
                Cancel
                </button>

                <button
                className="member-invite-submit"
                type="submit"
                >
                Send invite
                </button>
            </div>
            </form>
        </div>
        )}
    </>
    )
}

export default AddProjectMembers