import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import { PRIORITY_CONFIG } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { cn } from '@/lib/utils';

interface Props {
  task: Task;
  overlay?: boolean;
}

const LABEL_EMOJIS: Record<string, string> = {
  security: '\uD83D\uDEE1\uFE0F',
  backend: '\u2699\uFE0F',
  frontend: '\uD83C\uDFA8',
  bug: '\uD83D\uDC1B',
  feature: '\u2728',
  urgent: '\uD83D\uDEA8',
  testing: '\uD83E\uDDEA',
  docs: '\uD83D\uDCDD',
  infra: '\uD83C\uDFD7\uFE0F',
  design: '\uD83D\uDD8C\uFE0F',
  api: '\uD83D\uDD0C',
  database: '\uD83D\uDDC4\uFE0F',
  devops: '\uD83D\uDE80',
  refactor: '\uD83D\uDD27',
};

function getTaskEmoji(task: Task): string {
  for (const label of task.labels) {
    const key = label.toLowerCase();
    if (LABEL_EMOJIS[key]) return LABEL_EMOJIS[key];
  }
  if (task.priority === 'critical') return '\uD83D\uDEA8';
  if (task.priority === 'high') return '\uD83D\uDD25';
  return '\uD83D\uDCCB';
}

function getSubtitle(task: Task): string {
  const parts: string[] = [];
  if (task.priority) parts.push(`Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`);
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    parts.push(`Due: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
  }
  if (task.assignee) parts.push(`Assigned to: ${task.assignee.charAt(0).toUpperCase() + task.assignee.slice(1)}`);
  return parts[0] || '';
}

export function TaskCard({ task, overlay }: Props) {
  const { selectTask, selectedTaskId } = useTaskStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const isSelected = selectedTaskId === task.id;
  const emoji = getTaskEmoji(task);
  const subtitle = getSubtitle(task);

  return (
    <div
      ref={setNodeRef}
      style={overlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={cn(
        'card-pad rounded-lg cursor-pointer bg-card border border-border shadow-sm',
        'transition-all duration-200 touch-manipulation animate-fade-in',
        !overlay && 'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        isSelected && 'border-primary ring-2 ring-primary/25',
        overlay && 'rotate-1 scale-[1.02] shadow-xl border-primary/40',
      )}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          selectTask(task.id);
        }
      }}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-sm shrink-0 mt-0.5">{emoji}</span>
        <h4 className="card-title font-semibold text-card-foreground line-clamp-2 leading-snug">{task.title}</h4>
      </div>

      <div className="flex items-center gap-2 pl-6">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: priority.color }}
          title={priority.label}
        />
        <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
      </div>
    </div>
  );
}
