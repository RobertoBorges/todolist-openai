import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, ChevronDown, Flame, AlertTriangle, Clock, Leaf } from 'lucide-react';
import type { Todo, Priority } from '../api';
import { updateTodo, deleteTodo } from '../api';

interface TodoCardProps {
  todo: Todo;
  onUpdate: () => void;
}

const priorityConfig: Record<Priority, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  Urgent: { icon: <Flame size={12} />, color: 'text-red-400', bg: 'bg-red-500/15', border: 'priority-urgent', label: 'Urgent' },
  High:   { icon: <AlertTriangle size={12} />, color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'priority-high', label: 'High' },
  Medium: { icon: <Clock size={12} />, color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'priority-medium', label: 'Medium' },
  Low:    { icon: <Leaf size={12} />, color: 'text-green-400', bg: 'bg-green-500/15', border: 'priority-low', label: 'Low' },
};

export default function TodoCard({ todo, onUpdate }: TodoCardProps) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const p = priorityConfig[todo.priority];

  const toggleComplete = async () => {
    await updateTodo(todo.id, { isCompleted: !todo.isCompleted });
    onUpdate();
  };

  const handleDelete = async () => {
    await deleteTodo(todo.id);
    onUpdate();
  };

  const changePriority = async (priority: Priority) => {
    await updateTodo(todo.id, { priority });
    setShowPriorityMenu(false);
    onUpdate();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className={`glass rounded-xl p-4 ${p.border} group hover:bg-white/[0.07] transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
            ${todo.isCompleted
              ? 'bg-gradient-to-br from-violet-500 to-blue-500 border-transparent'
              : 'border-white/20 hover:border-violet-400'}`}
        >
          {todo.isCompleted && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check size={12} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium transition-all duration-200 ${
            todo.isCompleted ? 'line-through text-white/30' : 'text-white'
          }`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className={`text-xs mt-0.5 transition-all ${
              todo.isCompleted ? 'text-white/15' : 'text-white/40'
            }`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {/* Priority badge */}
            <div className="relative">
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${p.bg} ${p.color} hover:opacity-80 transition-opacity`}
              >
                {p.icon} {p.label} <ChevronDown size={10} />
              </button>
              <AnimatePresence>
                {showPriorityMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 glass-strong rounded-lg p-1 z-20 min-w-[100px]"
                  >
                    {(Object.keys(priorityConfig) as Priority[]).map(pr => (
                      <button
                        key={pr}
                        onClick={() => changePriority(pr)}
                        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors
                          ${priorityConfig[pr].color} hover:bg-white/10`}
                      >
                        {priorityConfig[pr].icon} {pr}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Time ago */}
            <span className="text-[10px] text-white/20">
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-all"
        >
          <Trash2 size={14} className="text-red-400/70" />
        </button>
      </div>
    </motion.div>
  );
}
