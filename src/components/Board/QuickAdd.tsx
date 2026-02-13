import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { TaskStatus } from '../../types/task';

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
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1 w-full px-3 py-2 text-xs text-[#94a3b8] hover:text-white hover:bg-[#1a2035] rounded-lg transition-colors"
      >
        <Plus size={14} /> Add task
      </button>
    );
  }

  return (
    <div className="p-2">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setOpen(false); }}
        onBlur={() => { if (!title.trim()) setOpen(false); }}
        placeholder="Task title..."
        className="w-full px-3 py-2 bg-[#0d1117] border border-[#3b82f6]/50 rounded-lg text-sm text-white placeholder-[#475569] outline-none focus:border-[#3b82f6]"
      />
    </div>
  );
}
