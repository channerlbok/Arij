using Ajir.Api.Contracts;
using Ajir.Api.Models;
using Ajir.Api.Data;
using Microsoft.EntityFrameworkCore;
namespace Ajir.Api.Endpoints;

using System.Security.Claims;




public static class ProfileEndpoint
{
    
    public static void MapProfile(this IEndpointRouteBuilder app)
    {

        var profileGroup = app
            .MapGroup("/auth/profile")
            .RequireAuthorization()
            .RequireRateLimiting("api");

        profileGroup.MapPut("", async (UpdateProfileRequests request, AjirDbContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            if(userId is null)
            {
                return Results.Unauthorized();
            }

            var thisUser = await db.Users
                .Where(foundUser => foundUser.Id == userId)
                .FirstOrDefaultAsync();
                

            if (thisUser is null)
            {
                return Results.NotFound();
            }
            
            if (string.IsNullOrWhiteSpace(request.DisplayName))
            {
                return Results.BadRequest("Display Name too short");
            }
            if (request.DisplayName.Length < 1)
            {
                return Results.BadRequest("Display Name too short");
            }
            if (request.DisplayName.Length > 50)
            {
                return Results.BadRequest("Display Name too long");
            }
            thisUser.DisplayName = request.DisplayName.Trim();


            await db.SaveChangesAsync();
            return Results.Ok(thisUser.DisplayName);
        });
    }
}