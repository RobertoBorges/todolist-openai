namespace TodoList.Models;

public record CreateTodoRequest(string Title, string? Description, Priority Priority = Priority.Medium, TodoStatus Status = TodoStatus.Todo);
public record UpdateTodoRequest(string? Title, string? Description, bool? IsCompleted, Priority? Priority, TodoStatus? Status, int? Position);
public record TodoResponse(int Id, string Title, string? Description, bool IsCompleted, Priority Priority, TodoStatus Status, int Position, DateTime CreatedAt, DateTime? CompletedAt);

public record ChatRequest(string Message, List<ChatMessage>? History);
public record ChatMessage(string Role, string Content);
public record ChatResponse(string Reply, List<SuggestedTodo>? SuggestedTodos);
public record SuggestedTodo(string Title, string? Description, string Priority);
