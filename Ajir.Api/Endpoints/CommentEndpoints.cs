
using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;

public static class CommentEndpoints
{
    public static void MapCommentEndpoints(this IEndpointRouteBuilder app)
    {
        var commentsGroup = app
            .MapGroup("/projects/{projectId:guid}/issues/{issueId:guid}/comments")
            .RequireAuthorization()
            .RequireRateLimiting("api");

        commentsGroup.MapPost("/", async (Guid projectId, Guid issueId, CreateCommentRequest request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var authorId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if(authorId is null)
            {
                return Results.Unauthorized();
            }

            var currentUser = await db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(foundUser => foundUser.Id == authorId);
            if (currentUser is null)
            {
                return Results.Unauthorized();
            }

            
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
            return Results.Created(
                $"/projects/{projectId}/issues/{issueId}/comments/{comment.Id}",
                new CommentResponse
                {
                    Id = comment.Id,
                    IssueId = comment.IssueId,
                    Body = comment.Body,
                    AuthorName = string.IsNullOrWhiteSpace(currentUser.DisplayName)
                        ? "Unknown user"
                        : currentUser.DisplayName,
                    CreatedAt = comment.CreatedAt
                }
            );
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

            var comments = await (
                from comment in db.Comments.AsNoTracking()
                join author in db.Users.AsNoTracking()
                    on comment.AuthorId equals author.Id
                where comment.IssueId == issueId
                orderby comment.CreatedAt
                select new CommentResponse
                {
                    Id = comment.Id,
                    IssueId = comment.IssueId,
                    Body = comment.Body,
                    AuthorName = string.IsNullOrEmpty(author.DisplayName)
                        ? "Unknown user"
                        : author.DisplayName,
                    CreatedAt = comment.CreatedAt
                }
            ).ToListAsync();

            

            return Results.Ok(comments);
        });

        commentsGroup.MapPut("/", async (
            Guid projectId,
            Guid issueId,
            Guid commentId,
            UpdateCommentRequest request,
            AjirDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
            {
                return Results.Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.Body))
            {
                return Results.BadRequest(new
                {
                    error = "Comment body is required"
                });
            }

            var cleanedBody = request.Body.Trim();

            if (cleanedBody.Length > 2000)
            {
                return Results.BadRequest(new
                {
                    error = "Comment cannot exceed 2000 characters"
                });
            }

            var projectExists = await db.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.Id == projectId && project.OwnerId == userId
                );
            if (!projectExists)
            {
                return Results.NotFound();
            }

            var issueExists = await db.Issues
                .AsNoTracking()
                .AnyAsync(issue =>
                    issue.Id == issueId && issue.ProjectId == projectId
                );
            if (!issueExists)
            {
                return Results.NotFound();
            }

            var comment  = await db.Comments
                .AsNoTracking()
                .FirstOrDefaultAsync(comment =>
                    comment.IssueId == issueId && comment.Id == commentId
                );
            if(comment is null)
            {
                return Results.NotFound();
            }

            if(comment.AuthorId != userId)
            {
                return Results.Forbid();
            }

            comment.Body = cleanedBody;

            await db.SaveChangesAsync();

            var authorName = await db.Users
                .AsNoTracking()
                .Where(foundUser =>
                    foundUser.Id == userId
                )
                .Select(foundUser => foundUser.DisplayName)
                .FirstOrDefaultAsync();

            return Results.Ok(new CommentResponse
            {
               Id = comment.Id,
               IssueId = comment.IssueId,
               Body = comment.Body,
               AuthorName = 
                string.IsNullOrWhiteSpace(authorName)
                    ? "Unknown user"
                    : authorName,
                CreatedAt = comment.CreatedAt 
            });
            
        });

        commentsGroup.MapDelete(
        "/{commentId:guid}",
        async (
            Guid projectId,
            Guid issueId,
            Guid commentId,
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
                .AnyAsync(project =>
                    project.Id == projectId &&
                    project.OwnerId == userId
                );

            if (!projectExists)
            {
                return Results.NotFound();
            }

            var issueExists = await db.Issues
                .AnyAsync(issue =>
                    issue.Id == issueId &&
                    issue.ProjectId == projectId
                );

            if (!issueExists)
            {
                return Results.NotFound();
            }

            var comment = await db.Comments
                .FirstOrDefaultAsync(foundComment =>
                    foundComment.Id == commentId &&
                    foundComment.IssueId == issueId
                );

            if (comment is null)
            {
                return Results.NotFound();
            }

            if (comment.AuthorId != userId)
            {
                return Results.Forbid();
            }

            db.Comments.Remove(comment);

            await db.SaveChangesAsync();

            return Results.NoContent();
        });

    }
}