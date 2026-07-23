// Import project class
using Ajir.Api.Models;
using Ajir.Api.Contracts;
using Ajir.Api.Data;
using Ajir.Api.Endpoints;
using Microsoft.EntityFrameworkCore;

using System.Text.Json.Serialization;

// Create Web app builder
var Builder = WebApplication.CreateBuilder(args);
Builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter()
    );
});
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

// Configure CORS to allows frontend access to backend
Builder.Services.AddCors(options =>
{
    options.AddPolicy("AjirFrontend", policy =>
    {
       policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod(); 
    });
});

// Build App
var app = Builder.Build();

app.UseCors("AjirFrontend");

// Expose  OpenAPI endpoit
app.MapOpenApi();

// Health Check to see if Ajir is running
app.MapGet("/health", () => new
{
    status = "healthy",
    application = "Ajir"
});

app.MapProjectEndpoints();
app.MapIssueEndpoints();

// Run App
app.Run();

