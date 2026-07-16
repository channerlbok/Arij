namespace Ajir.Api.Models;

// Project Class
public class Project{
    public Guid Id {get; set;} = Guid.NewGuid();
    public string Name {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
}