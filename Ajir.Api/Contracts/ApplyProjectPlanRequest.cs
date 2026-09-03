namespace Ajir.Api.Contracts;

public class ApplyProjectPlanRequest
{
    public string ProjectName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<ApplyProjectPlanIssue> Issues { get; set; } = [];
}

public class ApplyProjectPlanIssue
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;
}