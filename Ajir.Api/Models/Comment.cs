namespace Ajir.Api.Models;

public class Comment
{
    public Guid Id {get; set;} = Guid.NewGuid();
    public Guid IssueId {get; set;}
    public string Body {get; set;} = string.Empty;

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public string AuthorId {get; set;} = string.Empty;
}


public class CommentResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IssueId { get; set; }
    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
}
