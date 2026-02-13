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
      className={`flex flex-col w-72 shrink-0 rounded-xl transition-colors ${
        isOver ? 'bg-[#1a2035]/60' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLUMN_COLORS[id] }} />
          <h3 className="text-sm font-semibold text-[#e2e8f0]">{title}</h3>
        </div>
        <span className="text-xs text-[#64748b] bg-[#1a2035] px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <QuickAdd status={id} />
      <div className="flex flex-col gap-2 px-1 py-1 flex-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
