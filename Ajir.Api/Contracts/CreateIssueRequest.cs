namespace Ajir.Api.Contracts;

public class CreateIssueRequest
{
    public string Title {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;
}