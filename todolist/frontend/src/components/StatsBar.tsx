import { motion } from 'framer-motion';
import { Circle, Loader, CheckCircle2, ListTodo, Flame } from 'lucide-react';
import type { Todo } from '../api';

interface StatsBarProps {
  todos: Todo[];
}

export default function StatsBar({ todos }: StatsBarProps) {
  const total = todos.length;
  const todo = todos.filter(t => t.status === 'Todo').length;
  const inProgress = todos.filter(t => t.status === 'InProgress').length;
  const done = todos.filter(t => t.status === 'Done').length;
  const urgent = todos.filter(t => t.status !== 'Done' && t.priority === 'Urgent').length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/50">Progress</span>
        <span className="text-xs font-bold text-white/70">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        <StatItem icon={<ListTodo size={14} />} label="Total" value={total} color="text-white/70" />
        <StatItem icon={<Circle size={14} />} label="To Do" value={todo} color="text-blue-400" />
        <StatItem icon={<Loader size={14} />} label="Working" value={inProgress} color="text-amber-400" />
        <StatItem icon={<CheckCircle2 size={14} />} label="Done" value={done} color="text-emerald-400" />
        <StatItem icon={<Flame size={14} />} label="Urgent" value={urgent} color="text-red-400" />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 ${color}`}>
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}
