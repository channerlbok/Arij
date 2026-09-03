import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import assistantImage from '../assets/mochu-assistant.png'
import { API_BASE_URL } from '../config'

interface GeneratedIssuePlan {
  title: string
  description: string
  type: string
  status: string
  priority: string
}

interface GeneratedProjectPlan {
  projectName: string
  description: string
  issues: GeneratedIssuePlan[]
}

function MochuAssistant() {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [plan, setPlan] =
    useState<GeneratedProjectPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] =
    useState<string | null>(null)
  const [isCreatingPlan, setIsCreatingPlan] =
    useState(false)
  const [createPlanError, setCreatePlanError] =
    useState<string | null>(null)

  useEffect(() => {
    function openAssistant() {
      setIsOpen(true)
    }

    window.addEventListener(
      'open-mochu-assistant',
      openAssistant
    )

    return () => {
      window.removeEventListener(
        'open-mochu-assistant',
        openAssistant
      )
    }
  }, [])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const cleanedPrompt = prompt.trim()

    if (cleanedPrompt === '') {
      setGenerateError(
        'Describe what you would like Mochu to plan.'
      )
      return
    }

    setGenerateError(null)
    setCreatePlanError(null)
    setPlan(null)
    setIsGenerating(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/project-plan`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idea: cleanedPrompt
          })
        }
      )

      if (response.status === 401) {
        setGenerateError(
          'Please log in before using Mochu Assistant.'
        )
        return
      }

      if (response.status === 429) {
        setGenerateError(
          'Mochu Assistant is busy. Please wait a moment and try again.'
        )
        return
      }

      if (!response.ok) {
        setGenerateError(
          'Mochu Assistant could not create a plan right now.'
        )
        return
      }

      const generatedPlan: GeneratedProjectPlan =
        await response.json()

      setPlan(generatedPlan)
    } catch {
      setGenerateError(
        'Could not reach Mochu Assistant. Check that the backend is running.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCreatePlan() {
    if (plan === null) {
      return
    }

    setCreatePlanError(null)
    setIsCreatingPlan(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/project-plan/apply`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectName: plan.projectName,
            description: plan.description,
            issues: plan.issues
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create project plan')
      }

      const project = await response.json()

      setPlan(null)
      setPrompt('')

      navigate(`/projects/${project.id}/issues`)
    } catch {
      setCreatePlanError(
        'Mochu could not create this project plan.'
      )
    } finally {
      setIsCreatingPlan(false)
    }
  }

  return (
    <aside
      id="mochu-assistant"
      className="mochu-assistant"
    >
      {isOpen && (
        <section className="assistant-dialog">
          <button
            className="assistant-close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
          >
            ×
          </button>

          <p className="assistant-eyebrow">
            MOCHU ASSISTANT
          </p>

          <h2>Need a project plan?</h2>

          <p>
            Describe what you want to build, and I’ll suggest
            a project and issues to get you started.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={event => {
                setPrompt(event.target.value)
                setPlan(null)
              }}
              placeholder="Example: Plan a website launch with design, testing, and deployment tasks."
              rows={5}
              maxLength={4000}
              disabled={isGenerating}
              required
            />

            <button
              type="submit"
              disabled={isGenerating}
            >
              {isGenerating
                ? 'Planning...'
                : 'Generate project plan'}
            </button>
          </form>

          {generateError && (
            <p className="error-message">
              {generateError}
            </p>
          )}

          {plan && (
            <section className="assistant-plan">
              <p className="assistant-eyebrow">
                PROPOSED PLAN
              </p>

              <h3>{plan.projectName}</h3>

              <p>{plan.description}</p>

              <h4>Suggested issues</h4>

              <ul>
                {plan.issues.map((issue, index) => (
                  <li key={`${issue.title}-${index}`}>
                    <strong>{issue.title}</strong>

                    <p>{issue.description}</p>

                    <span>
                      {issue.type} · {issue.status} ·{' '}
                      {issue.priority}
                    </span>
                  </li>
                ))}
              </ul>

              {createPlanError && (
                <p className="error-message">
                  {createPlanError}
                </p>
              )}

              <button
                className="assistant-create-plan"
                type="button"
                onClick={handleCreatePlan}
                disabled={isCreatingPlan}
              >
                {isCreatingPlan
                  ? 'Creating project...'
                  : 'Create this project'}
              </button>

              <p className="assistant-note">
                This creates the project and all suggested issues.
              </p>
            </section>
          )}

          {!plan && (
            <p className="assistant-note">
              You will review the suggested project and issues
              before anything is created.
            </p>
          )}
        </section>
      )}

      <button
        className="assistant-launcher"
        type="button"
        onClick={() =>
          setIsOpen(currentOpen => !currentOpen)
        }
        aria-expanded={isOpen}
        aria-label="Open Mochu assistant"
      >
        <img
          src={assistantImage}
          alt="Mochu project assistant"
        />

        <span className="assistant-sign-label">
          ASK MOCHU
        </span>
      </button>
    </aside>
  )
}

export default MochuAssistant