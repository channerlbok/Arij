using Ajir.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ajir.Api.Data;

public class AjirDbContext : DbContext
{
    public AjirDbContext(DbContextOptions<AjirDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Issue> Issues => Set<Issue>();

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
    }
}