import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Circle, Loader, CheckCircle2, Plus } from 'lucide-react';
import type { Todo, TodoStatus } from '../api';
import { updateTodo } from '../api';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  todos: Todo[];
  onUpdate: () => void;
  onAddClick: (status: TodoStatus) => void;
}

const columns: { id: TodoStatus; label: string; icon: React.ReactNode; accent: string; glow: string }[] = [
  { id: 'Todo',       label: 'To Do',       icon: <Circle size={14} />,       accent: 'from-blue-500/80 to-cyan-500/80',     glow: 'shadow-blue-500/10' },
  { id: 'InProgress', label: 'In Progress', icon: <Loader size={14} />,       accent: 'from-amber-500/80 to-orange-500/80',  glow: 'shadow-amber-500/10' },
  { id: 'Done',       label: 'Done',        icon: <CheckCircle2 size={14} />, accent: 'from-emerald-500/80 to-green-500/80',  glow: 'shadow-emerald-500/10' },
];

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[200px] space-y-2 p-2 rounded-xl transition-colors duration-200 ${
        isOver ? 'bg-white/[0.04] ring-1 ring-violet-500/20' : ''
      }`}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ todos, onUpdate, onAddClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const grouped = useMemo(() => {
    const map: Record<TodoStatus, Todo[]> = { Todo: [], InProgress: [], Done: [] };
    for (const t of todos) {
      (map[t.status] ?? map.Todo).push(t);
    }
    return map;
  }, [todos]);

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(Number(e.active.id));
  };

  const handleDragOver = (_e: DragOverEvent) => {
    // Visual feedback handled by DroppableColumn
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const todoId = Number(active.id);
    const overIdStr = String(over.id);

    // Determine target column
    let targetStatus: TodoStatus | undefined;
    if (['Todo', 'InProgress', 'Done'].includes(overIdStr)) {
      targetStatus = overIdStr as TodoStatus;
    } else {
      // Dropped on another card — find which column it belongs to
      const overTodo = todos.find(t => t.id === Number(over.id));
      if (overTodo) targetStatus = overTodo.status;
    }

    if (!targetStatus) return;

    const currentTodo = todos.find(t => t.id === todoId);
    if (!currentTodo || currentTodo.status === targetStatus) return;

    await updateTodo(todoId, { status: targetStatus });
    onUpdate();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map(col => {
          const items = grouped[col.id];
          return (
            <div key={col.id} className="flex flex-col min-h-0">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${col.accent} flex items-center justify-center shadow-lg ${col.glow}`}>
                    {col.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white/80">{col.label}</h3>
                  <span className="text-xs text-white/25 font-mono">{items.length}</span>
                </div>
                <button
                  onClick={() => onAddClick(col.id)}
                  className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Plus size={14} className="text-white/30" />
                </button>
              </div>

              {/* Column body */}
              <DroppableColumn id={col.id}>
                <SortableContext items={items.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence mode="popLayout">
                    {items.map(todo => (
                      <KanbanCard key={todo.id} todo={todo} onUpdate={onUpdate} />
                    ))}
                  </AnimatePresence>
                </SortableContext>

                {items.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/10 text-white/15 text-xs">
                    Drop here
                  </div>
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTodo ? <KanbanCard todo={activeTodo} onUpdate={() => {}} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
