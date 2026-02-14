import { useState, useMemo, useCallback } from 'react';
import { Inbox, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskStatus, TaskPriority } from '../../types/task';
import { COLUMNS, PRIORITY_CONFIG } from '../../types/task';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SortField = 'created' | 'priority' | 'title' | 'updated';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const MOVE_STATUSES = COLUMNS.filter(c => c.id !== 'backlog' && c.id !== 'archived');

export function BacklogPage() {
  const { tasks, updateTask, selectTask } = useTaskStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('created');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const backlogTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.status === 'backlog');

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        t => t.title.toLowerCase().includes(q) ||
             t.description.toLowerCase().includes(q) ||
             t.taskNumber.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [tasks, search, sortBy]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === backlogTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(backlogTasks.map(t => t.id)));
    }
  }, [backlogTasks, selectedIds.size]);

  const bulkMove = useCallback(async (status: TaskStatus) => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await updateTask(id, { status });
    }
    setSelectedIds(new Set());
  }, [selectedIds, updateTask]);

  const moveOne = useCallback(async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [updateTask]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Inbox size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Backlog</h2>
            <p className="text-xs text-muted-foreground">
              {backlogTasks.length} item{backlogTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search backlog..."
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
          <SelectTrigger className="w-[170px] h-9">
            <ArrowUpDown size={13} className="mr-1.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Newest First</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                Move {selectedIds.size} selected
                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MOVE_STATUSES.map(s => (
                <DropdownMenuItem key={s.id} onClick={() => bulkMove(s.id)}>
                  Move to {s.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Select all */}
      {backlogTasks.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selectedIds.size === backlogTasks.length ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="text-[0.6rem]">
              {selectedIds.size} selected
            </Badge>
          )}
        </div>
      )}

      {/* Task List */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {backlogTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search ? 'No backlog items match your search' : 'Backlog is empty'}
              </p>
            </div>
          )}
          {backlogTasks.map((task, i) => {
            const priority = PRIORITY_CONFIG[task.priority];
            const createdDate = new Date(task.createdAt);
            const selected = selectedIds.has(task.id);

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  i < backlogTasks.length - 1 && 'border-b border-border',
                  selected && 'bg-primary/5',
                  'hover:bg-accent/50',
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(task.id)}
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    selected
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  {selected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" />
                    </svg>
                  )}
                </button>

                {/* Task number + title */}
                <button
                  onClick={() => selectTask(task.id)}
                  className="flex-1 min-w-0 text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-mono text-muted-foreground shrink-0">
                      {task.taskNumber}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: priority.color }}
                      title={priority.label}
                    />
                    <span className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {task.title}
                    </span>
                  </div>
                </button>

                {/* Created date */}
                <span className="text-[0.65rem] text-muted-foreground shrink-0 hidden sm:block">
                  {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>

                {/* Move dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                      Move <ChevronDown size={12} className="ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {MOVE_STATUSES.map(s => (
                      <DropdownMenuItem key={s.id} onClick={() => moveOne(task.id, s.id)}>
                        {s.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </ScrollArea>
      </Card>
    </div>
  );
}
