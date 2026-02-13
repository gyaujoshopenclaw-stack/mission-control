import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, User } from 'lucide-react';
import type { Task } from '../../types/task';
import { PRIORITY_CONFIG } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';

interface Props {
  task: Task;
}

export function TaskCard({ task }: Props) {
  const { selectTask } = useTaskStore();
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
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-3 cursor-pointer group glow-${task.priority} animate-fade-in`}
      onClick={() => selectTask(task.id)}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-[#475569] hover:text-[#94a3b8] cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs" title={priority.label}>{priority.emoji}</span>
            <span className="text-sm font-medium truncate">{task.title}</span>
          </div>
          {task.description && (
            <p className="text-xs text-[#94a3b8] truncate mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {task.labels.map(l => (
              <span key={l} className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#3b82f6]/20 text-[#60a5fa]">{l}</span>
            ))}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-[#94a3b8] ml-auto">
              <User size={10} />
              {task.assignee}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
