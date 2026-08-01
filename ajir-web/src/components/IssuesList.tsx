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
        <li className="issue-card" key={issue.id}>
          <div className="issue-card-heading">
            <h2>{issue.title}</h2>

            <span
              className={`issue-badge type-${issue.type.toLowerCase()}`}
            >
              {issue.type}
            </span>
          </div>

          <p className="issue-description">
            {issue.description}
          </p>

          <div className="issue-metadata">
            <span
              className={`issue-badge status-${issue.status.toLowerCase()}`}
            >
              {issue.status}
            </span>

            <span
              className={`issue-badge priority-${issue.priority.toLowerCase()}`}
            >
              {issue.priority} priority
            </span>
          </div>

          <div className="card-actions">
            <button
              className="button-secondary"
              onClick={() => onEditIssue(issue)}
            >
              Edit
            </button>

            <button
              className="button-danger"
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