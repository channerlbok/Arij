using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ajir.Api.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints( this IEndpointRouteBuilder app)
    {

        // Require authorization for every request
        var projectsGroup = app
            .MapGroup("/projects")
            .RequireAuthorization()
            .RequireRateLimiting("auth");

        // Handle Post Request
        projectsGroup.MapPost("", async (CreateProjectRequest request, AjirDbContext db, ClaimsPrincipal user) =>
        {

            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if(ownerID is null)
            {
                return Results.Unauthorized();
            }
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
                Description = request.Description.Trim(),
                OwnerId= ownerID
            };

            db.Projects.Add(project);
            await db.SaveChangesAsync();

            return Results.Created($"/projects/{project.Id}", project);

        });


        // Get all projects
        projectsGroup.MapGet("", async (AjirDbContext db, ClaimsPrincipal user) =>
        {

            /*
            SELECT Id, Name, Description, CreatedAt
            FROM Projects;
            */
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var projects = await db.Projects
                .AsNoTracking()
                .Where(project => project.OwnerId == ownerID)
                .ToListAsync();

            return Results.Ok(projects);
        });


        // Get and return a project based on the project id
        projectsGroup.MapGet("/{id:guid}", async (Guid id, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var project = await db.Projects
                .AsNoTracking()
                .Where(project => project.OwnerId == ownerID)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project is null)
            {
                return Results.NotFound();
            }
            return Results.Ok(project);
        });

        // Handle Delete request
        projectsGroup.MapDelete("/{id:guid}", async (Guid id, AjirDbContext db, ClaimsPrincipal user) =>
        {

            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
            var project = await db.Projects
            .Where(project => project.OwnerId == ownerID)
            .FirstOrDefaultAsync(p => p.Id == id);

            if (project is null)
            {
                return Results.NotFound();
            }

            db.Projects.Remove(project);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });


        // Handle Put request for project
        projectsGroup.MapPut("/{id:guid}", async (Guid id, UpdateProjectRequests request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var ownerID = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ownerID is null)
            {
                return Results.Unauthorized();
            }
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
                    error = "Description cannot exceed 1000 characters"
                });
            }
            var project = await db.Projects
            .Where(project => project.OwnerId == ownerID)
            .FirstOrDefaultAsync(p => p.Id == id);

            if (project is null)
            {
                return Results.NotFound();
            }
            project.Name = request.Name.Trim();
            project.Description = request.Description.Trim();

            await db.SaveChangesAsync();
            return Results.Ok(project);

        });
    }
}

