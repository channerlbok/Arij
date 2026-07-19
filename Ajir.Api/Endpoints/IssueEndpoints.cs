
using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;

public static class IssueEndpoints
{
    public static void MapIssueEndpoints(this IEndpointRouteBuilder app)
    {
        // Add new issue to existing project
        app.MapPost("/projects/{projectId:guid}/issues", async (Guid projectId, CreateIssueRequest request, AjirDbContext db) =>
        {
            var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId);

            if (project is null)
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
                Description = request.Description,
                Priority = request.Priority,
                Status = request.Status
            };

            db.Issues.Add(issue);
            await db.SaveChangesAsync();
            return Results.Created($"/projects/{projectId}/issues/{issue.Id}", issue);
        });


        // Handle Get request for projects issues
        app.MapGet("/projects/{projectId:guid}/issues", async (Guid projectId, AjirDbContext db) =>
        {
            var project = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project is null)
            {
                return Results.NotFound(new
                {
                    error = "Project not found"
                });
            }

            var projectIssues = await db.Issues
                .AsNoTracking()
                .Where(i => i.ProjectId == projectId)
                .ToListAsync();

            return Results.Ok(projectIssues);
        });

        // Handle Get request for specific issue
        app.MapGet("/projects/{projectId:guid}/issues/{issueId:guid}", async (Guid projectId, Guid issueId, AjirDbContext db) =>
        {
            var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId);

            return issue is null
                ? Results.NotFound()
                : Results.Ok(issue);
        });


        // Handle put request for specific issue
        app.MapPut("/projects/{projectId:guid}/issues/{issueId:guid}", async (Guid projectId, Guid issueId, UpdateIssueRequests request, AjirDbContext db) =>
        {
            var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId);

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
            issue.Type = request.Type;
            issue.Priority = request.Priority;

            // The tracking above updates it in the db when synched
            //db.Issues.Update(issue);
            await db.SaveChangesAsync();
            return Results.Ok(issue);
        });

        // Handle delete request for specific issue
        app.MapDelete("/projects/{projectId:guid}/issues/{issueId:guid}", async (Guid projectId, Guid issueId, AjirDbContext db) =>
        {
            var issue = await db.Issues.FirstOrDefaultAsync(i => i.ProjectId == projectId && i.Id == issueId);

            if (issue is null)
                return Results.NotFound();

            db.Issues.Remove(issue);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}