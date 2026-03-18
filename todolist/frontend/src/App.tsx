import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, ListChecks } from 'lucide-react';
import { fetchTodos } from './api';
import type { Todo, TodoStatus } from './api';
import AddTodo from './components/AddTodo';
import StatsBar from './components/StatsBar';
import ChatPanel from './components/ChatPanel';
import KanbanBoard from './components/KanbanBoard';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [addingTo, setAddingTo] = useState<TodoStatus | null>(null);

  const load = useCallback(async () => {
    try { setTodos(await fetchTodos()); } catch { /* noop */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ListChecks size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">TodoList AI</h1>
              <p className="text-[10px] text-white/25 -mt-0.5">Kanban · Drag & Drop · AI Powered</p>
            </div>
          </div>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
              ${chatOpen
                ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'glass text-white/50 hover:text-white/70'}`}
          >
            <MessageSquare size={14} /> AI Assistant
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="px-6 py-4">
        <div className="max-w-[1400px] mx-auto">
          <StatsBar todos={todos} />
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex min-h-0 px-6 pb-6">
        <div className={`flex-1 max-w-[1400px] mx-auto transition-all duration-300 ${chatOpen ? 'mr-[390px]' : ''}`}>
          {/* Add Todo overlay */}
          <AnimatePresence>
            {addingTo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex items-start justify-center pt-32 bg-black/40 backdrop-blur-sm"
                onClick={() => setAddingTo(null)}
              >
                <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <AddTodo
                    onCreated={load}
                    initialStatus={addingTo}
                    onClose={() => setAddingTo(null)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kanban Board */}
          <KanbanBoard
            todos={todos}
            onUpdate={load}
            onAddClick={(status) => setAddingTo(status)}
          />
        </div>

        {/* ── Chat Sidebar ── */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[380px] glass-strong border-l border-white/10 z-50 flex flex-col shadow-2xl shadow-black/40"
            >
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X size={14} className="text-white/50" />
              </button>
              <ChatPanel onTodoCreated={load} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
