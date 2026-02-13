import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskStatus } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from './TaskCard';
import { QuickAdd } from './QuickAdd';

interface Props {
  id: TaskStatus;
  title: string;
}

const COLUMN_COLORS: Record<string, string> = {
  backlog: '#64748b',
  todo: '#3b82f6',
  'in-progress': '#f59e0b',
  review: '#a855f7',
  done: '#22c55e',
  archived: '#475569',
};

export function Column({ id, title }: Props) {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks(id);
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 md:w-80 shrink-0 rounded-xl transition-colors px-2 ${
        isOver ? 'bg-[#1a2035]/60' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLUMN_COLORS[id] }} />
          <h3 className="text-sm font-bold text-[#e2e8f0] tracking-wide uppercase">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-[#94a3b8] bg-[#1a2035] px-2.5 py-1 rounded-full min-w-[1.75rem] text-center">
          {tasks.length}
        </span>
      </div>
      <QuickAdd status={id} />
      <div className="flex flex-col gap-3 px-1 py-1 flex-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
