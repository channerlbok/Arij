import { useState } from "react";
import type { FormEvent } from 'react'
import type { Project } from '../types/Project'


interface CreateProjectFormProps{
    onProjectCreated: (project: Project) => void
}

function CreateProjectForm({
    onProjectCreated
}: CreateProjectFormProps){
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const response = await fetch('http://localhost:5244/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, description})
        })

        if(!response.ok){
            throw new Error('Faild to create project')
        }

        const project: Project  = await response.json()

        onProjectCreated(project)
        setName('')
        setDescription('')
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
            Project name
            <input
                value={name}
                onChange={event => setName(event.target.value)}
            />
            </label>

            <label>
            Description
            <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
            />
            </label>

            <button type="submit">Create project</button>
        </form>
    )
}

export default CreateProjectForm