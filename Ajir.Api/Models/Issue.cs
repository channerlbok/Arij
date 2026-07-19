namespace Ajir.Api.Models;


public class Issue
{
    public Guid Id {get; set;} = Guid.NewGuid();
    public Guid ProjectId {get; set;}
    public string Title {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;

    public IssueStatus Status {get; set;} = IssueStatus.ToDo;

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public IssueType Type { get; set; }
    public IssuePriority Priority { get; set; }
}

