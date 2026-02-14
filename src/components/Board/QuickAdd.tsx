import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskStatus } from '../../types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  status: TaskStatus;
}

export function QuickAdd({ status }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { createTask } = useTaskStore();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createTask({ title: title.trim(), status });
    setTitle('');
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full justify-start gap-1 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-primary/30"
      >
        <Plus size={14} /> Add task
      </Button>
    );
  }

  return (
    <div className="p-2">
      <Input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setOpen(false); }}
        onBlur={() => { if (!title.trim()) setOpen(false); }}
        placeholder="Task title..."
        className="text-sm"
      />
    </div>
  );
}
