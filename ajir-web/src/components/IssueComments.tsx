import { useEffect, useState } from 'react'
import type { Comment } from '../types/Comment'
import CreateCommentForm from './CreateCommentForm'
import { API_BASE_URL } from '../config'
interface IssueCommentsProps {
  projectId: string
  issueId: string
}

function IssueComments({
  projectId,
  issueId
}: IssueCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
    async function loadComments(){
        try{
            setIsLoading(true)
            const response = await fetch(
                `${API_BASE_URL}/projects/${projectId}/issues/${issueId}/comments`,
            {
                credentials: 'include'
            }
            )

            if(!response.ok){
                throw new Error('Failed to load comments')
            }
        
            const data: Comment[] = await response.json()
            setComments(data)
        } catch{
            setLoadError('Could not load comments')
        } finally{
            setIsLoading(false)
        }
    }
    loadComments()
    }, [projectId, issueId])

    async function  handleDeleteComment(commentId: string) {
        const confirmed = window.confirm(
        'Delete this project and all its issues?'
        )

        if (!confirmed) {
        return
        }

        setActionError(null)

        try{
            const response = await fetch(
            `${API_BASE_URL}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
            {
                method: "DELETE",
                credentials: 'include'
            }
            )

            if(!response.ok){
                throw new Error('Failed to delte comment')
            }

            setComments(currentComments =>
            currentComments.filter(comment =>
                comment.id !== commentId
                )
            )
        }
        catch{
            setActionError('Could not delete comment')
        }
    }

    return (
        <section className = "issue-comments">
            <h3>Comments ({comments.length})</h3>
            {isLoading && <p>Loading comments...</p>}
            {loadError && (
                <p className="error-message">{loadError}</p>
            )}

            {!isLoading && ! loadError && comments.length === 0 && (
                <p> No comments </p>
            )}
            {actionError && (
                <p className="error-message">
                    {actionError}
                </p>
            )}
            {!isLoading && !loadError && (
                <ul className="comment-list">
                {comments.map(comment => (
                    <li key={comment.id}>
                    <p>{comment.authorName}</p>
                    <p>{comment.body}</p>

                    <time dateTime={comment.createdAt}>
                        {new Date(comment.createdAt).toLocaleString()}
                    </time>
                    <button
                    type="button"
                    className="delete-action"
                    onClick={() =>
                        handleDeleteComment(comment.id)
                    }
                    >
                    Delete
                    </button>
                    </li>
                    
                ))}
                </ul>
            )}

            <CreateCommentForm 
                projectId= {projectId}
                issueId={issueId}
                onCommentCreated={newComment =>{
                    setComments(currentComments => [
                        ...currentComments,
                        newComment
                    ])
                }}
        />
        </section>
    )

}

export default IssueComments