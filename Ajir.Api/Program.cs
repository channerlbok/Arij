// Import project class
using Ajir.Api.Models;
using Microsoft.AspNetCore.Identity;
using Ajir.Api.Data;
using Ajir.Api.Endpoints;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

// Create Web app builder
var Builder = WebApplication.CreateBuilder(args);
Builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Take  json and convert to c# object
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
    options.UseAzureSql(connectionString);
});

Builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddEntityFrameworkStores<AjirDbContext>();

// Configure CORS to allows frontend access to backend
Builder.Services.AddCors(options =>
{
    options.AddPolicy("AjirFrontend", policy =>
    {
       policy
            .WithOrigins("http://localhost:5173", "https://calm-mushroom-01576fb1e.7.azurestaticapps.net")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add auth service
Builder.Services.AddAuthorization();

Builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});
var isDevelopment = Builder.Environment.IsDevelopment();
// Add Rate Limiting
Builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
    {
        var clientIP = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    

        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: clientIP,
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = isDevelopment ? 100 : 10,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueLimit = 0,
                AutoReplenishment = true
            }

        );
    
    });

    options.AddPolicy("api", httpContext =>
    {
        var clientIP = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: clientIP,
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = isDevelopment ? 200 : 30,
                TokensPerPeriod = isDevelopment ? 100 : 10,
                ReplenishmentPeriod = TimeSpan.FromSeconds(10),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            }
        );
    });
});

// Build App
var app = Builder.Build();

var authGroup = app
    .MapGroup("/auth")
    .RequireRateLimiting("auth");

// Generate Identity User endpoint
authGroup.MapIdentityApi<ApplicationUser>();

// Allow logout
authGroup.MapPost("/logout",
    async (SignInManager<ApplicationUser> signInManager) => 
{
    await signInManager.SignOutAsync();
    return Results.NoContent(); 

}).RequireAuthorization();

// Allow connection to frontend
app.UseCors("AjirFrontend");



// Who is the user?
app.UseAuthentication();

// Is request allowed at the time?
app.UseRateLimiter();

// Is that user authorized?
app.UseAuthorization();

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
app.MapCommentEndpoints();
app.MapProjectMembersEndpoints();
app.MapProfile();


// Run App
app.Run();

