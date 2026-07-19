using Ajir.Api.Models;

namespace Ajir.Api.Contracts;

public class CreateIssueRequest
{
    public string Title {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;

    public IssueType Type { get; set; } = 0;
    public IssuePriority Priority { get; set; } = 0;
    public IssueStatus Status { get; set; } = 0;
}