import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Comment } from '../types/Comment'
import { API_BASE_URL } from '../config'

interface CreateCommentFormProps {
  projectId: string
  issueId: string
  onCommentCreated: (comment: Comment) => void
}

function CreateCommentForm({
  projectId,
  issueId,
  onCommentCreated
}: CreateCommentFormProps) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] =
    useState<string | null>(null)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setSubmitError(null)

    if (body.trim() === '') {
      setSubmitError('Comment is required')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/issues/${issueId}/comments`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ body })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create comment')
      }

      const comment: Comment = await response.json()

      onCommentCreated(comment)
      setBody('')
    } catch {
      setSubmitError('Could not create comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label>
        Add a comment
        <textarea
          value={body}
          onChange={event => setBody(event.target.value)}
          maxLength={2000}
          required
        />
      </label>

      {submitError && (
        <p className="error-message">{submitError}</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post comment'}
      </button>
    </form>
  )
}

export default CreateCommentForm
