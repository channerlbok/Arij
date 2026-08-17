using Microsoft.AspNetCore.Identity;

namespace Ajir.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string DisplayName {get; set;} = string.Empty;
}