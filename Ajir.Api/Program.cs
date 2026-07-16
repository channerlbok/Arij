// Import project class
using Ajir.Api.Models;
using Ajir.Api.Contracts;

// Create Web app builder
var Builder = WebApplication.CreateBuilder(args);

// Register Open API Service
Builder.Services.AddOpenApi();

// Build App
var app = Builder.Build();

// Create list of projects
var projects = new List<Project>();

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
app.MapPost("/projects", (CreateProjectRequest request) =>
{
    // Ensure name/Descr is valid chars
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new
        {
           error = "Project name is required" 
        });
    }

    if(request.Name.Length > 100)
    {
        return Results.BadRequest(new
        {
            error = "Project name cannot exceed 100 characters"
        });
    }
    if(request.Description.Length > 1000)
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

   projects.Add(project);
   return Results.Created($"/projects/{project.Id}", project);
});

// Get all projects
app.MapGet("/projects", () => Results.Ok(projects));

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

    projects.Remove(project);

    return Results.NoContent();
});


// Handle Put request for issue
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

var issues = new List<Issue>();

// Add new issue to existing project
app.MapPost("/projects/{projectId:guid}/issues", (Guid projectId, CreateIssueRequest request) =>
{
    var projectExists = projects.Any(p => p.Id == projectId);

    if (!projectExists)
    {
        return Results.BadRequest(new
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

    var issue = new Issue
    {
        ProjectId = projectId,
        Title = request.Title,
        Description = request.Description
    };

    issues.Add(issue);    

    return Results.Created($"/projects/{projectId}/issues/{issue.Id}", issue);
});


app.MapGet("/projects/{projectId:guid}/issues", (Guid projectId) =>
{
    var projectExists = projects.Any(p => p.Id == projectId);

    if (!projectExists)
    {
        return Results.BadRequest(new
        {
            error = "Project not found"
        });
    }

    var projectIssues = issues.Where(i => i.ProjectId == projectId).ToList();

    return Results.Ok(projectIssues);
});

// Run App
app.Run();

