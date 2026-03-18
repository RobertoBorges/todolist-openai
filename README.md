# 🚀 TodoList AI — Kanban Board with AI Assistant

A full-stack **Kanban-style Todo List** application with an integrated **AI chatbot** powered by OpenAI GPT-4o. Built with **C# ASP.NET Core**, **React**, **Tailwind CSS**, and **PostgreSQL**, all containerized with **Docker**.

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=flat&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=flat&logo=openai&logoColor=white)

---

## ✨ Features

- **Kanban Board** — Drag & drop tasks between columns: **To Do → In Progress → Done**
- **AI Assistant** — Sidebar chatbot that suggests tasks, organizes priorities, and gives productivity tips
- **Priority System** — 4 levels: 🌿 Low, 🕐 Medium, ⚠️ High, 🔥 Urgent
- **Glass-morphism UI** — Stunning dark theme with blur effects, gradients, and smooth animations
- **Full CRUD API** — RESTful endpoints for all todo operations
- **PostgreSQL** — Persistent data storage via Docker
- **Auto-migration** — Database schema applied automatically on startup

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│            React 19 + TypeScript + Tailwind CSS 4           │
│                 Vite Dev Server (:5173)                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  To Do   │  │In Progress│  │   Done   │  │ AI Chatbot │  │
│  │  Column  │  │  Column   │  │  Column  │  │  Sidebar   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│         Drag & Drop (@dnd-kit)       │    OpenAI GPT-4o     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (Vite Proxy)
┌──────────────────────────▼──────────────────────────────────┐
│                     Backend API                             │
│            ASP.NET Core 10 — Minimal APIs (:5242)           │
│                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │  /api/todos       │  │  /api/chat                      │  │
│  │  GET, POST,       │  │  POST — Proxies to OpenAI API   │  │
│  │  PUT, DELETE       │  │  System prompt with todo context│  │
│  └────────┬─────────┘  └────────────┬────────────────────┘  │
│           │ EF Core + Npgsql         │ HttpClient            │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
┌───────────▼───────────┐  ┌───────────▼───────────┐
│      PostgreSQL 16    │  │     OpenAI API        │
│   Docker Container    │  │   api.openai.com/v1   │
│   Port 5432           │  │   GPT-4o Model        │
└───────────────────────┘  └───────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI components and state management |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with glass-morphism theme |
| **Animations** | Framer Motion | Smooth transitions and drag feedback |
| **Drag & Drop** | @dnd-kit | Kanban board drag and drop |
| **Icons** | Lucide React | Consistent icon system |
| **Backend** | ASP.NET Core 10 (Minimal APIs) | RESTful API endpoints |
| **ORM** | Entity Framework Core 10 + Npgsql | PostgreSQL data access |
| **Database** | PostgreSQL 16 (Alpine) | Persistent storage |
| **AI** | OpenAI GPT-4o | Chatbot assistant |
| **Container** | Docker Compose | PostgreSQL hosting |
| **Build** | Vite 8 | Frontend dev server and bundler |

---

## 📁 Project Structure

```
todolist/
├── Data/
│   └── TodoDbContext.cs          # EF Core DbContext
├── Migrations/                   # EF Core migrations (auto-applied)
├── Models/
│   ├── TodoItem.cs               # Entity model (Priority, Status, Position)
│   └── TodoItemDto.cs            # DTOs (requests, responses, chat models)
├── Properties/
│   └── launchSettings.json       # Dev server config (port 5242)
├── frontend/
│   ├── src/
│   │   ├── api.ts                # API client (fetch, create, update, delete, chat)
│   │   ├── App.tsx               # Main app — Kanban layout + Chat sidebar
│   │   ├── components/
│   │   │   ├── KanbanBoard.tsx   # 3-column board with DnD context
│   │   │   ├── KanbanCard.tsx    # Draggable task card
│   │   │   ├── AddTodo.tsx       # New task modal with priority picker
│   │   │   ├── ChatPanel.tsx     # AI chatbot with message history
│   │   │   └── StatsBar.tsx      # Progress bar and stats
│   │   └── index.css             # Tailwind + glass-morphism styles
│   ├── index.html
│   ├── vite.config.ts            # Vite config with API proxy
│   └── package.json
├── Program.cs                    # API endpoints + AI chat proxy
├── TodoList.csproj               # .NET project file
├── appsettings.json              # Config (connection string, OpenAI placeholder)
├── docker-compose.yml            # PostgreSQL container
└── .gitignore                    # .NET, Node, secrets, IDE files
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [OpenAI API Key](https://platform.openai.com/api-keys)

### 1. Clone the repository

```bash
git clone https://github.com/robertoborges/todolist-openai.git
cd todolist-openai/todolist
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port `5432` with:
- **Database:** `tododb`
- **User:** `todouser`
- **Password:** `todopass`

### 3. Configure your OpenAI API key

Create `appsettings.Development.json` (this file is gitignored):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "OpenAI": {
    "ApiKey": "sk-your-api-key-here"
  }
}
```

### 4. Run the backend

```bash
dotnet run
```

The API starts at **http://localhost:5242**. Database migrations are applied automatically on startup.

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173** with a proxy to the backend API.

### 6. Open the app

Navigate to **http://localhost:5173** and start managing your tasks! 🎉

---

## 📡 API Endpoints

### Todo CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todos` | List all todos (ordered by position/priority) |
| `GET` | `/api/todos/:id` | Get a specific todo |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/:id` | Update a todo (title, description, status, priority, position) |
| `DELETE` | `/api/todos/:id` | Delete a todo |

#### Create Todo — Request body

```json
{
  "title": "Build feature X",
  "description": "Implement the new dashboard",
  "priority": "High",
  "status": "Todo"
}
```

#### Priority values: `Low`, `Medium`, `High`, `Urgent`
#### Status values: `Todo`, `InProgress`, `Done`

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message to the AI assistant |

#### Chat — Request body

```json
{
  "message": "Suggest 3 productive tasks for today",
  "history": []
}
```

The AI assistant receives the current todo list as context and can suggest new tasks with priorities.

---

## 🎨 UI Features

- **Dark glass-morphism theme** — Blur effects, subtle borders, gradient accents
- **Kanban board** — 3 columns with drag & drop between them
- **Priority badges** — Color-coded with click-to-cycle (🌿→🕐→⚠️→🔥)
- **Animated transitions** — Cards animate in/out with Framer Motion
- **AI sidebar** — Slide-in chat panel with typing indicator
- **Suggested tasks** — AI suggestions appear as cards you can add with one click
- **Progress bar** — Animated gradient bar showing completion percentage
- **Responsive stats** — Total, To Do, Working, Done, and Urgent counters

---

## 🛠️ Development

### Useful commands

```bash
# Backend
dotnet build                      # Build the API
dotnet run                        # Run the API
dotnet ef migrations add <name>   # Create a new migration
dotnet ef database update         # Apply migrations manually

# Frontend
cd frontend
npm run dev                       # Start dev server with HMR
npm run build                     # Production build
npx tsc --noEmit                  # Type-check without building

# Docker
docker compose up -d              # Start PostgreSQL
docker compose down               # Stop PostgreSQL
docker compose down -v            # Stop and remove data volume
```

### Environment variables

The app reads configuration from `appsettings.json` and `appsettings.Development.json`:

| Key | Description | Default |
|-----|-------------|---------|
| `ConnectionStrings:TodoDb` | PostgreSQL connection string | `Host=localhost;Port=5432;...` |
| `OpenAI:ApiKey` | Your OpenAI API key | `YOUR_OPENAI_API_KEY_HERE` |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
