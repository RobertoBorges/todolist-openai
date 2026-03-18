namespace TodoList.Models;

public enum Priority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum TodoStatus
{
    Todo,
    InProgress,
    Done
}

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public TodoStatus Status { get; set; } = TodoStatus.Todo;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
