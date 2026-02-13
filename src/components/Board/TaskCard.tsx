import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import { PRIORITY_CONFIG } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';

interface Props {
  task: Task;
  overlay?: boolean;
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
  const initials = task.assignee.charAt(0).toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={overlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={`card-pad bg-[#161b2e] border rounded-lg shadow-sm cursor-pointer
        transition-all duration-200 touch-manipulation animate-fade-in
        ${isSelected ? 'border-[#3b82f6]' : 'border-[#1e293b]'}
        ${overlay ? 'rotate-1 scale-[1.02] shadow-xl shadow-black/30' : ''}
        ${!overlay ? 'hover:-translate-y-[2px] hover:shadow-md hover:border-[#3b82f6]/30' : ''}
        ${task.priority === 'critical' && !overlay ? 'hover:shadow-red-500/10' : ''}
      `}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          selectTask(task.id);
        }
      }}
    >
      {/* Row 1: Task number + due date */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[0.65rem] font-mono text-[#64748b]">{task.taskNumber}</span>
        {task.dueDate && (
          <span className="text-[0.625rem] text-[#94a3b8] bg-[#1a2035] rounded-full px-2 py-0.5">
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Row 2: Title */}
      <h4 className="card-title font-semibold text-[#e2e8f0] truncate mb-1.5">{task.title}</h4>

      {/* Row 3: Priority dot + labels + assignee */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: priority.color }}
          title={priority.label}
        />
        {task.labels.slice(0, 2).map(l => (
          <span key={l} className="px-1.5 py-0.5 text-[0.6rem] rounded-full bg-[#3b82f6]/10 text-[#60a5fa] font-medium truncate max-w-[5rem]">{l}</span>
        ))}
        <span
          className="ml-auto w-5 h-5 rounded-full bg-[#1a2035] border border-[#2a3555] flex items-center justify-center text-[0.55rem] font-bold text-[#94a3b8] shrink-0"
          title={task.assignee}
        >
          {initials}
        </span>
      </div>
    </div>
  );
}
