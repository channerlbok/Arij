
using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;

using System.Security.Claims;
using Microsoft.Identity.Client;

public static class ProjectMembersEndpoints
{

    public static void MapProjectMembersEndpoints(this IEndpointRouteBuilder app)
    {
        var projectMembersGroup = app
            .MapGroup("/projects/{projectId:guid}/members")
            .RequireAuthorization()
            .RequireRateLimiting("api");


        projectMembersGroup.MapPost("", async(Guid projectId, CreateProjectMemberRequest request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if(ownerId is null)
            {
                return Results.Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return Results.BadRequest("Email address required"); 
            }

            var projectExists = await db.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.Id == projectId && project.OwnerId == ownerId
                );
            
            if (!projectExists)
            {
                return Results.NotFound();
            }

            var requestedUser = await db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(foundUser => foundUser.Email == request.Email);


            if(requestedUser is null)
            {
                return Results.BadRequest("User not found");
            }

            var projectMemberExistsAlready = await db.ProjectMembers
                .AsNoTracking()
                .AnyAsync(foundMember =>
                    foundMember.ProjectId == projectId &&
                    foundMember.UserId == requestedUser.Id
                
                );

            if (projectMemberExistsAlready)
            {
                return Results.Conflict(
                    "User is already a member of this project"
                );
            }
            var projectMember = new ProjectMember
            {
                ProjectId = projectId,
                Role = "Member",
                UserId = requestedUser.Id,


            };

            db.ProjectMembers.Add(projectMember);
            await db.SaveChangesAsync();
            return Results.Created(
                $"/projects/{projectId}/members/{projectMember.Id}",
                new ProjectMemberResponse
                {
                    Id = projectMember.Id,
                    ProjectId = projectMember.ProjectId,
                    Role = projectMember.Role,
                    UserId = projectMember.UserId,
                    JoinedAt = projectMember.JoinedAt,
                    DisplayName = requestedUser.DisplayName
                }
            );
        });

        projectMembersGroup.MapGet("", async (Guid projectId, ClaimsPrincipal user, AjirDbContext db) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
            {
                return Results.Unauthorized();
            }
            var canViewMembers = await db.ProjectMembers
                .AsNoTracking()
                .AnyAsync(projectMember =>
                    projectMember.ProjectId == projectId &&
                    projectMember.UserId == userId
                );

            if (!canViewMembers)
            {
                return Results.NotFound();
            }
        

            var projectMembers = await (
                from projectMember in db.ProjectMembers.AsNoTracking()
                join applicationUser in db.Users.AsNoTracking()
                    on projectMember.UserId equals applicationUser.Id
                where projectMember.ProjectId == projectId
                select new ProjectMemberResponse
                {
                    Id = projectMember.Id,
                    ProjectId = projectMember.ProjectId,
                    UserId = projectMember.UserId,
                    DisplayName = applicationUser.DisplayName,
                    Role = projectMember.Role,
                    JoinedAt = projectMember.JoinedAt
                }
            ).ToListAsync();

            return Results.Ok(projectMembers);
        });

        projectMembersGroup.MapDelete("/{memberId:guid}", async (
        Guid projectId,
        Guid memberId,
        ClaimsPrincipal user,
        AjirDbContext db) =>
        {
            var ownerId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (ownerId is null)
            {
                return Results.Unauthorized();
            }

            var projectExists = await db.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.Id == projectId &&
                    project.OwnerId == ownerId
                );

            if (!projectExists)
            {
                return Results.NotFound();
            }

            var projectMemberToDelete = await db.ProjectMembers
                .FirstOrDefaultAsync(projectMember =>
                    projectMember.Id == memberId &&
                    projectMember.ProjectId == projectId
                );

            if (projectMemberToDelete is null)
            {
                return Results.NotFound();
            }

            if (projectMemberToDelete.Role == "Owner")
            {
                return Results.BadRequest("The project owner cannot be removed.");
            }

            db.ProjectMembers.Remove(projectMemberToDelete);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

    }

}


