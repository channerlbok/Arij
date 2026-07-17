// Import project class
using Ajir.Api.Models;
using Ajir.Api.Contracts;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;

// Create Web app builder
var Builder = WebApplication.CreateBuilder(args);

// Retrieve connection string
var connectionString = Builder.Configuration.GetConnectionString("AjirDatabase")
?? throw new InvalidOperationException("AjirDatabase string is missing");

// Register Open API Service
Builder.Services.AddOpenApi();

// Register the database context service
Builder.Services.AddDbContext<AjirDbContext>(options =>
{
   options.UseSqlite(connectionString); 
});

// Build App
var app = Builder.Build();

// Create list of projects
var projects = new List<Project>();

// Create list of issues
var issues = new List<Issue>();
// Expose  OpenAPI endpoit
app.MapOpenApi();

// Endpoints - Get/Post/Put
// Send Get Request
// app.MapGet("/health", () => "Ajir is running");
app.MapGet("/health", () => new
{
    status = "healthy",
    application = "Ajir"
});

// Handle Post Request
app.MapPost("/projects", async (CreateProjectRequest request, AjirDbContext db) =>
{
    // Ensure name/Descr is valid chars
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new
        {
            error = "Project name is required"
        });
    }

    if (request.Name.Length > 100)
    {
        return Results.BadRequest(new
        {
            error = "Project name cannot exceed 100 characters"
        });
    }
    if (request.Description.Length > 1000)
    {
        return Results.BadRequest(new
        {
            error = "Description cannot exceeed 1000 characters"
        });
    }

    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new
        {
            error = "Description is required"
        });
    }

    var project = new Project
    {
        Name = request.Name.Trim(),
        Description = request.Description.Trim()
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();

    return Results.Created($"/projects/{project.Id}", project);

});


// Local Way
/*
    var project = new Project
    {
        Name = request.Name.Trim(),
        Description = request.Description.Trim()
    };
   projects.Add(project);
   return Results.Created($"/projects/{project.Id}", project);
});

*/

// Get all projects
app.MapGet("/projects", async (AjirDbContext db) =>
{

    /*
    SELECT Id, Name, Description, CreatedAt
    FROM Projects;
    */

    var projects = await db.Projects
        .AsNoTracking()
        .ToListAsync();

    return Results.Ok(projects);
});

// Old Local Way
/*
  app.MapGet("/projects", () => Results.Ok(projects));
*/



// Get and return a project based on the project id
app.MapGet("/projects/{id:guid}", (Guid id)=>
{
    var project = projects.FirstOrDefault(p => p.Id == id);
    return project is null
        ? Results.NotFound()
        : Results.Ok(project);

});

// Handle Delete request
app.MapDelete("/projects/{id:guid}", (Guid id) =>
{
   var project = projects.FirstOrDefault(p => p.Id == id); 

   if (project is null)
    {
        return Results.NotFound();
    }

    // Remove project and issue related to that project
    issues.RemoveAll(i => i.ProjectId == id);
    projects.Remove(project);

    
    return Results.NoContent();
});


// Handle Put request for project
app.MapPut("/projects/{id:guid}", (Guid id, UpdateProjectRequests request) =>
{

    // Ensure name/Descr is valid chars
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new
        {
            error = "Project name is required"
        });
    }

    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new
        {
            error = "Description is required"
        });
    }

    var project = projects.FirstOrDefault(p => p.Id == id);

    if (project is null)
    {
        return Results.NotFound();
    }

    project.Name = request.Name.Trim();
    project.Description = request.Description.Trim();

    return Results.Ok(project);

});


// Add new issue to existing project
app.MapPost("/projects/{projectId:guid}/issues", (Guid projectId, CreateIssueRequest request) =>
{
    var projectExists = projects.Any(p => p.Id == projectId);

    if (!projectExists)
    {
        return Results.NotFound(new
        {
            error = "No projects found"
        });
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new
        {
            error = "Issue Title required"
        });
    }

    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new
        {
            error = "Issue Description required"
        });
    }

    if (request.Title.Length > 200)
    {
        return Results.BadRequest(new
        {
            error = "Issue title exceeds maximum 200 characters"
        });
    }

    if (request.Description.Length > 2000)
    {
        return Results.BadRequest(new
        {
            error = "Issue Description exceeds maximum 2000 characters"
        });
    }

    var issue = new Issue
    {
        ProjectId = projectId,
        Title = request.Title,
        Description = request.Description
    };

    issues.Add(issue);    

    return Results.Created($"/projects/{projectId}/issues/{issue.Id}", issue);
});

// Handle Get request for projects issues
app.MapGet("/projects/{projectId:guid}/issues", (Guid projectId) =>
{
    var projectExists = projects.Any(p => p.Id == projectId);

    if (!projectExists)
    {
        return Results.NotFound(new
        {
            error = "Project not found"
        });
    }

    var projectIssues = issues.Where(i => i.ProjectId == projectId).ToList();

    return Results.Ok(projectIssues);
});

// Handle Get request for specific issue
app.MapGet("/projects/{projectId:guid}/issues/{issueId:guid}", (Guid projectId, Guid issueId) =>
{
    var issue = issues.FirstOrDefault(i => i.Id == issueId && i.ProjectId == projectId);

    return issue is null
        ? Results.NotFound()
        : Results.Ok(issue);
});


// Handle put request for specific issue
app.MapPut("/projects/{projectId:guid}/issues/{issueId:guid}", (Guid projectId, Guid issueId, UpdateIssueRequests request) =>
{
   var issue = issues.FirstOrDefault(i => i.Id == issueId && i.ProjectId == projectId);

    if (issue is null)
    {
        return Results.NotFound(new
        {
            error = "Issue not found"
        });
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new
        {
            error = "Issue Title required"
        });
    }
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new
        {
            error = "Issue Description required"
        });
    }

    if (request.Title.Length > 200)
    {
        return Results.BadRequest(new
        {
            error = "Issue title exceeds maximum 200 characters"
        });
    }

    if (request.Description.Length > 2000)
    {
        return Results.BadRequest(new
        {
            error = "Issue Description exceeds maximum 2000 characters"
        });
    }

    if (!Enum.IsDefined(typeof(IssueStatus), request.Status))
    {
        return Results.BadRequest(new
        {
            error = "Invalid issue status"
        });
    }


    issue.Title = request.Title.Trim();
    issue.Description = request.Description.Trim();
    issue.Status = request.Status;

    return Results.Ok(issue);
});

// Handle delete request for specific issue
app.MapDelete("/projects/{projectId:guid}/issues/{issueId:guid}", (Guid projectId, Guid issueId) =>
{
   var issue = issues.FirstOrDefault(i => i.ProjectId == projectId && i.Id == issueId); 

   if (issue is null)
    return Results.NotFound();

    issues.Remove(issue);

    return Results.NoContent();
});

// Run App
app.Run();

