using Microsoft.EntityFrameworkCore;
using TodoList.Models;

namespace TodoList.Data;

public class TodoDbContext : DbContext
{
    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options) { }

    public DbSet<TodoItem> Todos => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<Priority>();
        modelBuilder.HasPostgresEnum<TodoStatus>();

        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.Property(e => e.Priority)
                  .HasDefaultValue(Priority.Medium);
            entity.Property(e => e.Status)
                  .HasDefaultValue(TodoStatus.Todo);
        });
    }
}
