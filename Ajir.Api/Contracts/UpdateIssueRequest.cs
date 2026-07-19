using Ajir.Api.Models;
namespace Ajir.Api.Contracts;

public class UpdateIssueRequests
{
    public string Title {get; set;} = String.Empty;
    public string Description {get; set;} = String.Empty;

    public IssuePriority Priority {get; set;}
    public IssueType Type { get; set; }
    public IssueStatus Status {get; set;}
}