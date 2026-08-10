
using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;

using System.Security.Claims;
using System.Threading.Tasks.Sources;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.Identity.Client;

public static class CommentEndpoints
{
    public static void MapCommentEndpoints(this IEndpointRouteBuilder app)
    {
        var commentsGroup = app
            .MapGroup("/projects/{projectId:guid}/issues/{issueId:guid}/comments")
            .RequireAuthorization()
            .RequireRateLimiting("api");

        commentsGroup.MapPost("", async (Guid projectId, Guid issueId, CreateCommentRequest request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var authorId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var projectExists = await db.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.Id == projectId &&
                    project.OwnerId == authorId
                );

            if (!projectExists)
            {
                return Results.NotFound(new
                {
                    error = "Project not found"
                });
            }

            var issueExists = await db.Issues
                .AsNoTracking()
                .AnyAsync(issue =>
                    issue.Id == issueId &&
                    issue.ProjectId == projectId
                );

            if (!issueExists)
            {
                return Results.NotFound(new
                {
                    error = "Issue not found"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Body))
            {
                return Results.BadRequest(new
                {
                    error = "Comment body is required"
                });
            }

            if (request.Body.Length > 2000)
            {
                return Results.BadRequest(new
                {
                    error = "Comment cannot exceed 2000 characters"
                });
            }

            var comment = new Comment
            {
                Body = request.Body.Trim(),
                AuthorId = authorId,
                IssueId = issueId
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync();
            return Results.Created($"/projects/{projectId}/issues/{issueId}/comments/{comment.Id}",comment);
        });

        commentsGroup.MapGet("/", async (
            Guid projectId,
            Guid issueId,
            AjirDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var projectExists = await db.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.Id == projectId &&
                    project.OwnerId == userId
                );

            if (!projectExists)
            {
                return Results.NotFound(new
                {
                    error = "Project not found"
                });
            }

            var issueExists = await db.Issues
                .AsNoTracking()
                .AnyAsync(issue =>
                    issue.Id == issueId &&
                    issue.ProjectId == projectId
                );

            if (!issueExists)
            {
                return Results.NotFound(new
                {
                    error = "Issue not found"
                });
            }

            var comments = await db.Comments
                .AsNoTracking()
                .Where(comment =>
                    comment.IssueId == issueId
                )
                .OrderBy(comment => comment.CreatedAt)
                .ToListAsync();

            return Results.Ok(comments);
        });
    }
}