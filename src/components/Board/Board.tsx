import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { COLUMNS, type TaskStatus } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import confetti from 'canvas-confetti';

export function Board() {
  const { tasks, reorderTasks, setLastCompletedAt, toggleCommandPalette } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let targetStatus: TaskStatus;
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    } else {
      targetStatus = over.id as TaskStatus;
    }

    if (targetStatus === 'done' && task.status !== 'done') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      setLastCompletedAt(Date.now());
    }

    if (task.status === targetStatus && !overTask) return;

    const columnTasks = tasks
      .filter(t => t.status === targetStatus && t.id !== taskId)
      .sort((a, b) => a.order - b.order);

    let newOrder = 0;
    if (overTask && overTask.id !== taskId) {
      const overIdx = columnTasks.findIndex(t => t.id === overTask.id);
      newOrder = overIdx >= 0 ? overIdx : columnTasks.length;
    } else {
      newOrder = columnTasks.length;
    }

    const updates: { id: string; status: string; order: number }[] = [];
    const reordered = [...columnTasks];
    reordered.splice(newOrder, 0, { ...task, status: targetStatus } as typeof task);
    reordered.forEach((t, i) => {
      updates.push({ id: t.id, status: targetStatus, order: i });
    });

    reorderTasks(updates);
  }, [tasks, reorderTasks, setLastCompletedAt]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile tab bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 px-3 py-2 bg-[#0a0e1a] border-b border-[#1e293b] shrink-0">
        {COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => setMobileColumn(col.id)}
            className={`px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap min-h-[2.75rem] transition-colors ${
              mobileColumn === col.id
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#94a3b8] hover:bg-[#1a2035]'
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      {/* Desktop: all columns */}
      <div className="hidden lg:flex col-gap px-6 py-4 overflow-x-auto flex-1">
        {COLUMNS.map(col => (
          <Column key={col.id} id={col.id} title={col.title} />
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="flex lg:hidden flex-1 overflow-hidden px-2 py-2">
        <div className="w-full">
          <Column id={mobileColumn} title={COLUMNS.find(c => c.id === mobileColumn)?.title || ''} />
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={toggleCommandPalette}
        className="lg:hidden fixed right-4 bottom-16 z-40 w-12 h-12 bg-[#3b82f6] hover:bg-[#2563eb] rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center text-white transition-colors"
      >
        <Plus size={22} />
      </button>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 md:w-80">
            <TaskCard task={activeTask} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
