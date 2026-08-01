
using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;
using System.Security.Claims;

public static class IssueEndpoints
{
    public static void MapIssueEndpoints(this IEndpointRouteBuilder app)
    {
        var issuesGroup = app
            .MapGroup("/projects/{projectId:guid}/issues")
            .RequireAuthorization();
        // Add new issue to existing project
        issuesGroup.MapPost("", async (Guid projectId, CreateIssueRequest request, AjirDbContext db, ClaimsPrincipal user) =>
        {

            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == ownerID);

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
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Priority = request.Priority,
                Status = request.Status,
                Type = request.Type
            };

            db.Issues.Add(issue);
            await db.SaveChangesAsync();
            return Results.Created($"/projects/{projectId}/issues/{issue.Id}", issue);
        });


        // Handle Get request for projects issues
        issuesGroup.MapGet("", async (Guid projectId, IssueType? type, IssueStatus? status, IssuePriority? priority, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var project = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == ownerID);

            if (project is null)
            {
                return Results.NotFound(new
                {
                    error = "Project not found"
                });
            }

            var query = db.Issues
                .AsNoTracking()
                .Where(i => i.ProjectId == projectId);

            if (type.HasValue)
            {
                query = query.Where(i => i.Type == type.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(i => i.Priority == priority.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            
            var projectIssues = await query.ToListAsync();

            return Results.Ok(projectIssues);
        });

        // Handle Get request for specific issue
        issuesGroup.MapGet("/{issueId:guid}", async (Guid projectId, Guid issueId, AjirDbContext db, ClaimsPrincipal user) =>
        {

            
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var project = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == ownerID);

            if (project is null)
            {
                return Results.NotFound();
            }
            var issue = await db.Issues
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId );


            return issue is null
                ? Results.NotFound()
                : Results.Ok(issue);
        });


        // Handle put request for specific issue
        issuesGroup.MapPut("/{issueId:guid}", async (Guid projectId, Guid issueId, UpdateIssueRequests request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId);
            var project = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync();
            if (project is null)
            {
                return Results.NotFound();
            }
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
        issuesGroup.MapDelete("/{issueId:guid}", async (Guid projectId, Guid issueId, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if(ownerID is null)
            {
                return Results.Unauthorized();
            }
            var issue = await db.Issues.FirstOrDefaultAsync(i => i.ProjectId == projectId && i.Id == issueId);

            if (issue is null)
            {
                return Results.NotFound();
            }



            var projects = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(project => project.Id == projectId && project.OwnerId == ownerID);


            if(projects is null)
            {
                return Results.NotFound();
            }
            db.Issues.Remove(issue);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}