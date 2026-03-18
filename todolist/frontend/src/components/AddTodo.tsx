import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, X } from 'lucide-react';
import { createTodo } from '../api';
import type { Priority, TodoStatus } from '../api';

interface AddTodoProps {
  onCreated: () => void;
  initialStatus?: TodoStatus;
  onClose?: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'Urgent', label: '🔥 Urgent', color: 'text-red-400' },
  { value: 'High', label: '⚠️ High', color: 'text-orange-400' },
  { value: 'Medium', label: '🕐 Medium', color: 'text-yellow-400' },
  { value: 'Low', label: '🌿 Low', color: 'text-green-400' },
];

export default function AddTodo({ onCreated, initialStatus = 'Todo', onClose }: AddTodoProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [showPriority, setShowPriority] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTodo(title.trim(), description.trim() || undefined, priority, initialStatus);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    onCreated();
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-strong rounded-2xl p-4 glow-purple"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </div>
            <span className="text-xs font-medium text-white/50">New task</span>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <X size={12} className="text-white/40" />
            </button>
          )}
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none font-medium mb-2"
        />

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none resize-none border border-white/5 focus:border-violet-500/30 transition-colors mb-3"
        />

        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPriority(!showPriority)}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white/80 glass rounded-lg px-3 py-1.5 transition-colors"
            >
              {priorities.find(p => p.value === priority)?.label} <ChevronDown size={12} />
            </button>
            {showPriority && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-1 glass-strong rounded-lg p-1 z-30"
              >
                {priorities.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => { setPriority(p.value); setShowPriority(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs hover:bg-white/10 transition-colors ${p.color}`}
                  >
                    {p.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="text-xs font-medium text-white px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600
                       disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
          >
            Add Task
          </button>
        </div>
      </form>
    </motion.div>
  );
}
