export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TodoStatus = 'Todo' | 'InProgress' | 'Done';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: Priority;
  status: TodoStatus;
  position: number;
  createdAt: string;
  completedAt: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SuggestedTodo {
  title: string;
  description: string | null;
  priority: Priority;
}

export interface ChatResponse {
  reply: string;
  suggestedTodos: SuggestedTodo[] | null;
}

const API = '/api';

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API}/todos`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(title: string, description?: string, priority: Priority = 'Medium', status: TodoStatus = 'Todo'): Promise<Todo> {
  const res = await fetch(`${API}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, status }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, data: { title?: string; description?: string; isCompleted?: boolean; priority?: Priority; status?: TodoStatus; position?: number }): Promise<Todo> {
  const res = await fetch(`${API}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function sendChat(message: string, history: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Chat request failed');
  return res.json();
}
