import { useState } from 'react'
import type { Issue } from '../types/Issue'
import IssueComments from './IssueComments'

interface IssueListProps {
  projectId: string
  issues: Issue[]
  onEditIssue: (issue: Issue) => void
  onDeleteIssue: (issueId: string) => void
}

function IssueList({
  projectId,
  issues,
  onEditIssue,
  onDeleteIssue
}: IssueListProps) {
  const [commentIssueId, setCommentIssueId] =
    useState<string | null>(null)

  return (
    <ul className="issue-list">
      {issues.map(issue => (
        <li className="issue-row" key={issue.id}>
          <div className="issue-summary">
            <div className="issue-title-line">
              <h2>{issue.title}</h2>

              <span className="issue-type">
                {issue.type}
              </span>
            </div>

            <p>{issue.description}</p>
          </div>

          <div className="issue-metadata">
            <span
              className={`metadata-badge status-${issue.status.toLowerCase()}`}
            >
              {issue.status === 'InProgress'
                ? 'In progress'
                : issue.status}
            </span>

            <span
              className={`metadata-badge priority-${issue.priority.toLowerCase()}`}
            >
              {issue.priority}
            </span>
          </div>

          <div className="issue-actions">
            <button
              type="button"
              onClick={() => onEditIssue(issue)}
            >
              Edit
            </button>

            <button
              className="delete-action"
              type="button"
              onClick={() => onDeleteIssue(issue.id)}
            >
              Delete
            </button>

            <button
              type="button"
              onClick={() =>
                setCommentIssueId(currentIssueId =>
                  currentIssueId === issue.id
                    ? null
                    : issue.id
                )
              }
            >
              {commentIssueId === issue.id
                ? 'Hide comments'
                : 'Comments'}
            </button>
          </div>

          {commentIssueId === issue.id && (
            <IssueComments
              projectId={projectId}
              issueId={issue.id}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

export default IssueList