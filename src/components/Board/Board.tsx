import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { COLUMNS, type TaskStatus } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import confetti from 'canvas-confetti';

export function Board() {
  const { tasks, moveTask, reorderTasks } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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

    // Determine target column
    let targetStatus: TaskStatus;
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    } else {
      targetStatus = over.id as TaskStatus;
    }

    // Confetti on moving to done!
    if (targetStatus === 'done' && task.status !== 'done') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }

    if (task.status === targetStatus && !overTask) return;

    // Calculate new order
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

    // Build reorder updates
    const updates: { id: string; status: string; order: number }[] = [];
    const reordered = [...columnTasks];
    reordered.splice(newOrder, 0, { ...task, status: targetStatus } as any);
    reordered.forEach((t, i) => {
      updates.push({ id: t.id, status: targetStatus, order: i });
    });

    reorderTasks(updates);
  }, [tasks, moveTask, reorderTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 px-6 py-4 overflow-x-auto flex-1">
        {COLUMNS.map(col => (
          <Column key={col.id} id={col.id} title={col.title} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-72 opacity-90 rotate-2">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
