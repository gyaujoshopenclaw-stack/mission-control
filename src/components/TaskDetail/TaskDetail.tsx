import { useState, useEffect } from 'react';
import { Trash2, Save } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { Task, TaskStatus, TaskPriority, TaskAssignee } from '../../types/task';
import { COLUMNS, PRIORITY_CONFIG } from '../../types/task';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export function TaskDetail() {
  const { tasks, selectedTaskId, selectTask, updateTask, deleteTask } = useTaskStore();
  const task = tasks.find(t => t.id === selectedTaskId);
  const [form, setForm] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) setForm({ ...task });
  }, [task?.id, task?.updatedAt]);

  const handleSave = async () => {
    if (task) await updateTask(task.id, form);
  };

  const handleDelete = async () => {
    if (task && confirm('Delete this task?')) {
      await deleteTask(task.id);
    }
  };

  return (
    <Sheet open={!!task} onOpenChange={(open) => { if (!open) selectTask(null); }}>
      <SheetContent side="right" className="w-96 max-sm:w-full flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="text-sm">Task Detail</SheetTitle>
          <SheetDescription className="sr-only">Edit task details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title || ''}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status || ''}
                onValueChange={(v) => setForm(f => ({ ...f, status: v as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority || ''}
                onValueChange={(v) => setForm(f => ({ ...f, priority: v as TaskPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select
                value={form.assignee || ''}
                onValueChange={(v) => setForm(f => ({ ...f, assignee: v as TaskAssignee }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="josh">Josh</SelectItem>
                  <SelectItem value="openclaw">OpenClaw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate?.slice(0, 10) || ''}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-labels">Labels (comma-separated)</Label>
            <Input
              id="task-labels"
              value={(form.labels || []).join(', ')}
              onChange={e => setForm(f => ({ ...f, labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-border">
          <Button onClick={handleSave} className="flex-1 gap-1.5">
            <Save size={14} /> Save
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
