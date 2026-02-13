import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User } from 'lucide-react';
import type { Task } from '../../types/task';
import { PRIORITY_CONFIG } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';

interface Props {
  task: Task;
  overlay?: boolean;
}

export function TaskCard({ task, overlay }: Props) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={overlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={`glass-card p-4 cursor-pointer group glow-${task.priority} animate-fade-in
        hover:-translate-y-0.5 hover:border-[rgba(59,130,246,0.35)] hover:shadow-lg hover:shadow-blue-500/5
        transition-all duration-200 touch-manipulation
        ${overlay ? 'rotate-2 scale-105 shadow-2xl shadow-blue-500/20' : ''}
      `}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          selectTask(task.id);
        }
      }}
    >
      {/* Task number */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.65rem] font-mono text-[#64748b]">{task.taskNumber}</span>
        {task.dueDate && (
          <span className="flex items-center gap-1 text-[0.65rem] text-[#94a3b8]">
            <Calendar size={10} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Title - bold, 1 line truncated */}
      <h4 className="text-sm font-semibold text-[#e2e8f0] truncate mb-1">{task.title}</h4>

      {/* Description - lighter, max 2 lines with fade */}
      {task.description && (
        <p className="text-xs text-[#94a3b8]/80 line-clamp-2 mb-2.5 leading-relaxed">{task.description}</p>
      )}

      {/* Metadata chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.65rem] rounded-md font-medium"
          style={{ backgroundColor: `${priority.color}15`, color: priority.color }}
        >
          {priority.emoji} {priority.label}
        </span>
        {task.labels.map(l => (
          <span key={l} className="px-1.5 py-0.5 text-[0.65rem] rounded-md bg-[#3b82f6]/15 text-[#60a5fa] font-medium">{l}</span>
        ))}
        <span className="flex items-center gap-1 text-[0.65rem] text-[#94a3b8] ml-auto">
          <User size={10} />
          {task.assignee}
        </span>
      </div>
    </div>
  );
}
