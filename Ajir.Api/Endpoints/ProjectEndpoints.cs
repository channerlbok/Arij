using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;


namespace Ajir.Api.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints( this IEndpointRouteBuilder app)
    {


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


        // Get and return a project based on the project id
        app.MapGet("/projects/{id:guid}", async (Guid id, AjirDbContext db) =>
        {
            var project = await db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project is null)
            {
                return Results.NotFound();
            }
            return Results.Ok(project);
        });

        // Handle Delete request
        app.MapDelete("/projects/{id:guid}", async (Guid id, AjirDbContext db) =>
        {
            var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id);

            if (project is null)
            {
                return Results.NotFound();
            }

            db.Projects.Remove(project);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });


        // Handle Put request for project
        app.MapPut("/projects/{id:guid}", async (Guid id, UpdateProjectRequests request, AjirDbContext db) =>
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
            var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id);

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

