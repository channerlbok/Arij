namespace Ajir.Api.Models;


public class ProjectMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId {get; set;}

    public string UserId {get; set;} = string.Empty;

    public string Role {get;set;} = string.Empty;

    public DateTime JoinedAt {get;set;} = DateTime.UtcNow;
}

public class ProjectMemberResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }

    public string UserId { get; set; } = string.Empty;
    public string DisplayName {get; set;} = string.Empty;
    public string Role { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}