using Ajir.Api.Models;
namespace Ajir.Api.Contracts;

public class UpdateIssueRequests
{
    public string Title {get; set;} = String.Empty;
    public string Description {get; set;} = String.Empty;

    public IssueStatus Status { get; set; }
}