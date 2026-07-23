import type { Issue } from '../types/Issue'

interface IssueListProp{
    issues: Issue[]
    onEditIssue: (issue: Issue) => void
    onDeleteIssue: (issueId: string) => void
}

function IssueList({issues, onEditIssue, onDeleteIssue}:IssueListProp) {
    return(
        <ul className="issue-list">
        {issues.map(issue => (
            <li key={issue.id}>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>
            <p>{issue.type}</p>
            <p>{issue.status}</p>
            <p>{issue.priority}</p>
            <button onClick={() => onEditIssue(issue)}>
            Edit
          </button>
          <button onClick={() => onDeleteIssue(issue.id)}>
            Delete
          </button>
            </li>
        ))}
        </ul>
    )
}

export default IssueList