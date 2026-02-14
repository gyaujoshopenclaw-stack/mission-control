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
import { Plus, Columns3 } from 'lucide-react';
import { COLUMNS, type TaskStatus } from '../../types/task';
import { useTaskStore } from '../../stores/taskStore';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function Board() {
  const { tasks, reorderTasks, setLastCompletedAt, toggleCommandPalette, visibleColumns, toggleColumnVisibility } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const displayedColumns = COLUMNS.filter(col => visibleColumns.includes(col.id));

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
      <div className="flex lg:hidden overflow-x-auto gap-1.5 px-3 py-2 bg-sidebar/80 border-b border-border shrink-0">
        {displayedColumns.map(col => (
          <Button
            key={col.id}
            variant={mobileColumn === col.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMobileColumn(col.id)}
            className={cn(
              'text-xs whitespace-nowrap',
              mobileColumn === col.id && 'text-primary',
            )}
          >
            {col.title}
          </Button>
        ))}
      </div>

      {/* Desktop: columns + column picker */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-end px-6 pt-3 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <Columns3 size={13} />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {COLUMNS.map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={visibleColumns.includes(col.id)}
                  onCheckedChange={() => toggleColumnVisibility(col.id)}
                >
                  {col.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex col-gap px-6 py-2 overflow-x-auto flex-1">
          {displayedColumns.map(col => (
            <Column key={col.id} id={col.id} title={col.title} />
          ))}
        </div>
      </div>

      {/* Mobile: single column */}
      <div className="flex lg:hidden flex-1 overflow-hidden px-2 py-2">
        <div className="w-full">
          <Column id={mobileColumn} title={displayedColumns.find(c => c.id === mobileColumn)?.title || ''} />
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={toggleCommandPalette}
        size="icon"
        className="lg:hidden fixed right-4 bottom-16 z-40 rounded-full shadow-lg h-12 w-12"
      >
        <Plus size={22} />
      </Button>

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
