namespace Ajir.Api.Contracts;

public class GeneratedProjectPlanResponse
{
    public string ProjectName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<GeneratedIssuePlan> Issues { get; set; } = [];
}

public class GeneratedIssuePlan
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;
}