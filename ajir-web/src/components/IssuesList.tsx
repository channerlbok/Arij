import type { Issue } from '../types/Issue'

interface IssueListProps {
  issues: Issue[]
  onEditIssue: (issue: Issue) => void
  onDeleteIssue: (issueId: string) => void
}

function IssueList({
  issues,
  onEditIssue,
  onDeleteIssue
}: IssueListProps) {
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
          </div>
        </li>
      ))}
    </ul>
  )
}

export default IssueList