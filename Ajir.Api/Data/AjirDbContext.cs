using Ajir.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace Ajir.Api.Data;

public class AjirDbContext
    : IdentityDbContext<ApplicationUser>
{
    public AjirDbContext(DbContextOptions<AjirDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Issue> Issues => Set<Issue>();

    public DbSet<Comment> Comments => Set<Comment>();


    // Fluent API
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Issue>()
            .HasOne<Project>()
            .WithMany()
            .HasForeignKey(issue => issue.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Project>()
            .Property(project => project.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Project>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(project => project.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Project>()
            .Property(project => project.Description)
            .HasMaxLength(1000)
            .IsRequired();

        modelBuilder.Entity<Issue>()
            .Property(issue => issue.Title)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Issue>()
            .Property(issue => issue.Description)
            .HasMaxLength(2000)
            .IsRequired();

        modelBuilder.Entity<Comment>()
            .HasOne<Issue>()
            .WithMany()
            .HasForeignKey(comment => comment.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(comment => comment.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
            .Property(comment => comment.Body)
            .HasMaxLength(2000)
            .IsRequired();




    }
}