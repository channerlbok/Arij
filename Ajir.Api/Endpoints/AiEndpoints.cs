using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Ajir.Api.Contracts;
using Ajir.Api.Data;
using Ajir.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Ajir.Api.Endpoints;

public static class AiEndpoints
{
    public static void MapAiEndpoints(this IEndpointRouteBuilder app)
    {
        var aiGroup = app
            .MapGroup("/ai")
            .RequireAuthorization()
            .RequireRateLimiting("auth");

        aiGroup.MapPost("/project-plan", async (
            GenerateProjectPlanRequest request,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory) =>
        {
            if (string.IsNullOrWhiteSpace(request.Idea))
            {
                return Results.BadRequest(new
                {
                    error = "Please describe the project you want to plan."
                });
            }

            if (request.Idea.Length > 4000)
            {
                return Results.BadRequest(new
                {
                    error = "Project idea cannot exceed 4000 characters."
                });
            }

            var apiKey = configuration["OpenAI:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return Results.Problem(
                    "The AI service is not configured.",
                    statusCode: StatusCodes.Status503ServiceUnavailable
                );
            }

            var requestBody = new
            {
                model = "gpt-4.1-mini",
                store = false,
                instructions = """
                    You are Mochu Assistant, a project-planning assistant.

                    Turn the user's idea into one practical project and
                    between 3 and 6 actionable issues.

                    Use only these allowed values:
                    - type: Bug or Task
                    - status: ToDo, InProgress, or Done
                    - priority: Low, Medium, or High

                    Do not claim that you created anything. Return only
                    the requested structured data.
                    """,
                input = request.Idea.Trim(),
                text = new
                {
                    format = new
                    {
                        type = "json_schema",
                        name = "project_plan",
                        strict = true,
                        schema = new
                        {
                            type = "object",
                            properties = new
                            {
                                projectName = new
                                {
                                    type = "string"
                                },
                                description = new
                                {
                                    type = "string"
                                },
                                issues = new
                                {
                                    type = "array",
                                    items = new
                                    {
                                        type = "object",
                                        properties = new
                                        {
                                            title = new { type = "string" },
                                            description = new { type = "string" },
                                            type = new
                                            {
                                                type = "string",
                                                @enum = new[] { "Bug", "Task" }
                                            },
                                            status = new
                                            {
                                                type = "string",
                                                @enum = new[]
                                                {
                                                    "ToDo",
                                                    "InProgress",
                                                    "Done"
                                                }
                                            },
                                            priority = new
                                            {
                                                type = "string",
                                                @enum = new[]
                                                {
                                                    "Low",
                                                    "Medium",
                                                    "High"
                                                }
                                            }
                                        },
                                        required = new[]
                                        {
                                            "title",
                                            "description",
                                            "type",
                                            "status",
                                            "priority"
                                        },
                                        additionalProperties = false
                                    }
                                }
                            },
                            required = new[]
                            {
                                "projectName",
                                "description",
                                "issues"
                            },
                            additionalProperties = false
                        }
                    }
                }
            };

            var client = httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var openAiResponse = await client.PostAsync(
                "https://api.openai.com/v1/responses",
                content
            );

            if (!openAiResponse.IsSuccessStatusCode)
            {
                var errorBody =
                    await openAiResponse.Content.ReadAsStringAsync();

                Console.WriteLine(
                    $"OpenAI error: {(int)openAiResponse.StatusCode} " +
                    $"{openAiResponse.StatusCode}"
                );

                Console.WriteLine(errorBody);

                return Results.Problem(
                    "Mochu Assistant could not generate a plan right now.",
                    statusCode: StatusCodes.Status502BadGateway
                );
            }
            var responseText = await openAiResponse.Content.ReadAsStringAsync();

            using var responseJson = JsonDocument.Parse(responseText);

            var generatedJson = GetGeneratedText(
                responseJson.RootElement
            );

            if (string.IsNullOrWhiteSpace(generatedJson))
            {
                return Results.Problem(
                    "Mochu Assistant returned an empty plan.",
                    statusCode: StatusCodes.Status502BadGateway
                );
            }

            var plan = JsonSerializer.Deserialize<
                GeneratedProjectPlanResponse
            >(
                generatedJson,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            );

            if (plan is null)
            {
                return Results.Problem(
                    "Mochu Assistant returned an invalid plan.",
                    statusCode: StatusCodes.Status502BadGateway
                );
            }

            return Results.Ok(plan);
        });

        aiGroup.MapPost(
            "/project-plan/apply",
            async (
                ApplyProjectPlanRequest request,
                AjirDbContext db,
                ClaimsPrincipal user
            ) =>
            {
                var userId = user.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

                if (userId is null)
                {
                    return Results.Unauthorized();
                }

                if (string.IsNullOrWhiteSpace(request.ProjectName))
                {
                    return Results.BadRequest(
                        "Project name is required."
                    );
                }

                if (string.IsNullOrWhiteSpace(request.Description))
                {
                    return Results.BadRequest(
                        "Project description is required."
                    );
                }

                if (request.Issues.Count == 0)
                {
                    return Results.BadRequest(
                        "The project plan must include an issue."
                    );
                }

                var project = new Project
                {
                    Name = request.ProjectName.Trim(),
                    Description = request.Description.Trim(),
                    OwnerId = userId
                };

                var projectMember = new ProjectMember
                {
                    ProjectId = project.Id,
                    UserId = userId,
                    Role = "Owner"
                };

                db.Projects.Add(project);
                db.ProjectMembers.Add(projectMember);

                foreach (var plannedIssue in request.Issues)
                {
                    var issue = new Issue
                    {
                        ProjectId = project.Id,
                        Title = plannedIssue.Title.Trim(),
                        Description = plannedIssue.Description.Trim(),

                        // These should match the enum names in your Issue model.
                        Type = Enum.Parse<IssueType>(plannedIssue.Type),
                        Status = Enum.Parse<IssueStatus>(plannedIssue.Status),
                        Priority = Enum.Parse<IssuePriority>(
                            plannedIssue.Priority
                        )
                    };

                    db.Issues.Add(issue);
                }

                await db.SaveChangesAsync();

                return Results.Created(
                    $"/projects/{project.Id}",
                    project
                );
            }
        );
    }

    private static string? GetGeneratedText(JsonElement response)
    {
        foreach (var outputItem in response
            .GetProperty("output")
            .EnumerateArray())
        {
            if (!outputItem.TryGetProperty(
                "content",
                out var content
            ))
            {
                continue;
            }

            foreach (var contentItem in content.EnumerateArray())
            {
                var type = contentItem
                    .GetProperty("type")
                    .GetString();

                if (type == "output_text")
                {
                    return contentItem
                        .GetProperty("text")
                        .GetString();
                }
            }
        }

        return null;
    }
}