import { useState } from 'react'
import assistantImage from '../assets/mochu-assistant.png'

function MochuAssistant() {
  const [isOpen, setIsOpen] = useState(true)
  const [prompt, setPrompt] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (prompt.trim() === '') {
      return
    }

    // Later, this is where we will send `prompt`
    // to an AI-planning endpoint in your backend.
    console.log(prompt)
  }

  return (
    <aside className="mochu-assistant">
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

          <p className="assistant-eyebrow">MOCHU ASSISTANT</p>
          <h2>Need a project plan?</h2>
          <p>
            Describe what you want to build, and I’ll help turn it
            into a project with issues.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="Example: Plan a website launch with design, testing, and deployment tasks."
              rows={5}
            />

            <button type="submit">
              Generate project plan
            </button>
          </form>

          <p className="assistant-note">
            You will review the suggested project and issues before
            anything is created.
          </p>
        </section>
      )}

      <button
        className="assistant-launcher"
        type="button"
        onClick={() => setIsOpen(currentOpen => !currentOpen)}
        aria-expanded={isOpen}
        aria-label="Open Mochu assistant"
      >
        <img
          src={assistantImage}
          alt="Mochu project assistant"
        />
      </button>
    </aside>
  )
}

export default MochuAssistant