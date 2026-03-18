import { motion } from 'framer-motion';
import { Trash2, Flame, AlertTriangle, Clock, Leaf, GripVertical } from 'lucide-react';
import type { Todo, Priority } from '../api';
import { updateTodo, deleteTodo } from '../api';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  todo: Todo;
  onUpdate: () => void;
  overlay?: boolean;
}

const priorityConfig: Record<Priority, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Urgent: { icon: <Flame size={10} />, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Urgent' },
  High:   { icon: <AlertTriangle size={10} />, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'High' },
  Medium: { icon: <Clock size={10} />, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Medium' },
  Low:    { icon: <Leaf size={10} />, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Low' },
};

const priorityOrder: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

export default function KanbanCard({ todo, onUpdate, overlay }: KanbanCardProps) {
  const p = priorityConfig[todo.priority];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, data: { todo } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleDelete = async () => {
    await deleteTodo(todo.id);
    onUpdate();
  };

  const cyclePriority = async () => {
    const idx = priorityOrder.indexOf(todo.priority);
    const next = priorityOrder[(idx + 1) % priorityOrder.length];
    await updateTodo(todo.id, { priority: next });
    onUpdate();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={overlay ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass rounded-xl p-3 group hover:bg-white/[0.07] transition-all cursor-default
        ${overlay ? 'shadow-2xl shadow-violet-500/20 ring-1 ring-violet-500/30' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center
                     text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical size={14} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium leading-snug ${
            todo.status === 'Done' ? 'line-through text-white/30' : 'text-white/90'
          }`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className="text-[11px] mt-0.5 text-white/30 line-clamp-2">{todo.description}</p>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={cyclePriority}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${p.bg} ${p.color} hover:opacity-80 transition-opacity`}
            >
              {p.icon} {p.label}
            </button>
            <span className="text-[9px] text-white/15">
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-500/20
                     flex items-center justify-center transition-all"
        >
          <Trash2 size={12} className="text-red-400/60" />
        </button>
      </div>
    </motion.div>
  );
}
