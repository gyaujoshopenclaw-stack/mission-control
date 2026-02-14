import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskStatus } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from './TaskCard';
import { QuickAdd } from './QuickAdd';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  id: TaskStatus;
  title: string;
}

const COLUMN_COLORS: Record<string, string> = {
  backlog: '#64748b',
  todo: '#22c55e',
  'in-progress': '#eab308',
  review: '#a855f7',
  done: '#f97316',
  archived: '#475569',
};

const ARCHIVE_VISIBLE_COUNT = 5;

export function Column({ id, title }: Props) {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks(id);
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showAllArchived, setShowAllArchived] = useState(false);
  const isArchive = id === 'archived';

  const visibleTasks = isArchive && !showAllArchived ? tasks.slice(0, ARCHIVE_VISIBLE_COUNT) : tasks;
  const hiddenCount = isArchive ? tasks.length - ARCHIVE_VISIBLE_COUNT : 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-72 md:w-80 shrink-0 rounded-lg p-4 transition-all duration-200',
        'bg-card/60 backdrop-blur-md border border-border',
        isOver && 'border-primary/50 shadow-md',
      )}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLUMN_COLORS[id] }}
          />
          <h3 className="text-xs font-semibold text-foreground tracking-wide uppercase">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-[0.65rem] font-semibold min-w-[1.5rem] justify-center">
          {tasks.length}
        </Badge>
      </div>

      {!isArchive && <QuickAdd status={id} />}

      <ScrollArea className="flex-1 max-h-[calc(100vh-240px)]">
        <div className="flex flex-col card-gap px-0.5 py-1">
          <SortableContext items={visibleTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {isArchive ? (
              visibleTasks.map(task => (
                <ArchiveItem key={task.id} title={task.title} taskId={task.id} />
              ))
            ) : (
              visibleTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </SortableContext>
        </div>
      </ScrollArea>

      {isArchive && hiddenCount > 0 && !showAllArchived && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllArchived(true)}
          className="mt-2 gap-1 text-xs text-mc-cyan hover:text-mc-cyan"
        >
          <ChevronDown size={14} />
          Show all {tasks.length} archived
        </Button>
      )}
    </div>
  );
}

function ArchiveItem({ title, taskId }: { title: string; taskId: string }) {
  const { selectTask } = useTaskStore();

  return (
    <button
      onClick={() => selectTask(taskId)}
      className="text-left w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors truncate border border-transparent hover:border-border"
    >
      {title}
    </button>
  );
}
