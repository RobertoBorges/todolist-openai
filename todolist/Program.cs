using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TodoList.Data;
using TodoList.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TodoDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("TodoDb")));
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddHttpClient("OpenAI", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.DefaultRequestHeaders.Add("Authorization",
        $"Bearer {builder.Configuration["OpenAI:ApiKey"]}");
});
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
    db.Database.Migrate();
}

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ── Todo CRUD ──────────────────────────────────────────────

var todosApi = app.MapGroup("/api/todos");

todosApi.MapGet("/", async (TodoDbContext db) =>
{
    var todos = await db.Todos.OrderBy(t => t.Position).ThenByDescending(t => t.Priority).ToListAsync();
    return Results.Ok(todos.Select(ToResponse));
});

todosApi.MapGet("/{id:int}", async (int id, TodoDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    return todo is not null ? Results.Ok(ToResponse(todo)) : Results.NotFound();
});

todosApi.MapPost("/", async (CreateTodoRequest request, TodoDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest("Title is required.");

    var todo = new TodoItem
    {
        Title = request.Title.Trim(),
        Description = request.Description?.Trim(),
        Priority = request.Priority,
        Status = request.Status
    };

    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/api/todos/{todo.Id}", ToResponse(todo));
});

todosApi.MapPut("/{id:int}", async (int id, UpdateTodoRequest request, TodoDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    if (request.Title is not null)
        todo.Title = request.Title.Trim();
    if (request.Description is not null)
        todo.Description = request.Description.Trim();
    if (request.IsCompleted.HasValue)
    {
        todo.IsCompleted = request.IsCompleted.Value;
        todo.CompletedAt = request.IsCompleted.Value ? DateTime.UtcNow : null;
    }
    if (request.Priority.HasValue)
        todo.Priority = request.Priority.Value;
    if (request.Status.HasValue)
    {
        todo.Status = request.Status.Value;
        if (request.Status.Value == TodoStatus.Done)
        {
            todo.IsCompleted = true;
            todo.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            todo.IsCompleted = false;
            todo.CompletedAt = null;
        }
    }
    if (request.Position.HasValue)
        todo.Position = request.Position.Value;

    await db.SaveChangesAsync();
    return Results.Ok(ToResponse(todo));
});

todosApi.MapDelete("/{id:int}", async (int id, TodoDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ── AI Chat ────────────────────────────────────────────────

app.MapPost("/api/chat", async (ChatRequest request, TodoDbContext db, IHttpClientFactory httpFactory) =>
{
    var todos = await db.Todos.OrderByDescending(t => t.Priority).ToListAsync();
    var todoSummary = todos.Count == 0
        ? "No todos yet."
        : string.Join("\n", todos.Select(t =>
            $"- [{t.Priority}] {t.Title}{(t.IsCompleted ? " ✅" : "")} (id:{t.Id})"));

    var systemPrompt = $$"""
        You are a friendly, smart productivity assistant for a todo list app.
        You help users manage tasks, suggest new ones, organize by priority, and give tips.

        Current todos:
        {{todoSummary}}

        When suggesting new tasks, respond with valid JSON in your message using this format:
        SUGGESTED_TODOS:[{"title":"...","description":"...","priority":"Low|Medium|High|Urgent"}]

        Keep responses concise, helpful, and encouraging. Use emojis sparingly.
        """;

    var messages = new List<object>
    {
        new { role = "system", content = systemPrompt }
    };

    if (request.History is not null)
    {
        foreach (var msg in request.History)
            messages.Add(new { role = msg.Role, content = msg.Content });
    }

    messages.Add(new { role = "user", content = request.Message });

    var client = httpFactory.CreateClient("OpenAI");
    var payload = new
    {
        model = "gpt-4o",
        messages,
        temperature = 0.7,
        max_tokens = 1000
    };

    var json = JsonSerializer.Serialize(payload);
    var response = await client.PostAsync("chat/completions",
        new StringContent(json, Encoding.UTF8, "application/json"));

    if (!response.IsSuccessStatusCode)
    {
        var error = await response.Content.ReadAsStringAsync();
        return Results.Problem($"OpenAI API error: {error}", statusCode: 502);
    }

    var result = await response.Content.ReadFromJsonAsync<JsonElement>();
    var reply = result.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";

    // Extract suggested todos if present
    List<SuggestedTodo>? suggestedTodos = null;
    var marker = "SUGGESTED_TODOS:";
    var markerIdx = reply.IndexOf(marker, StringComparison.Ordinal);
    if (markerIdx >= 0)
    {
        var jsonStart = markerIdx + marker.Length;
        var jsonPart = reply[jsonStart..].Trim();
        // Find the end of the JSON array
        var bracketCount = 0;
        var endIdx = 0;
        for (var i = 0; i < jsonPart.Length; i++)
        {
            if (jsonPart[i] == '[') bracketCount++;
            else if (jsonPart[i] == ']') bracketCount--;
            if (bracketCount == 0) { endIdx = i + 1; break; }
        }
        if (endIdx > 0)
        {
            var todoJson = jsonPart[..endIdx];
            suggestedTodos = JsonSerializer.Deserialize<List<SuggestedTodo>>(todoJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            reply = reply[..markerIdx].Trim();
        }
    }

    return Results.Ok(new ChatResponse(reply, suggestedTodos));
});

app.Run();

static TodoResponse ToResponse(TodoItem t) =>
    new(t.Id, t.Title, t.Description, t.IsCompleted, t.Priority, t.Status, t.Position, t.CreatedAt, t.CompletedAt);
