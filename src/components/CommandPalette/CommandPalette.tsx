import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

export function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, tasks, selectTask, createTask } = useTaskStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommandPalette]);

  const handleCreate = async (query: string) => {
    if (!query.trim()) return;
    await createTask({ title: query.trim(), status: 'backlog' });
    toggleCommandPalette();
  };

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={(open) => { if (!open) toggleCommandPalette(); }}
    >
      <CommandInput placeholder="Search tasks or type to create..." />
      <CommandList>
        <CommandEmpty>
          <button
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('[cmdk-input]');
              if (input) handleCreate(input.value);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-primary hover:bg-accent rounded-sm transition-colors"
          >
            <Plus size={14} /> Create new task
          </button>
        </CommandEmpty>
        <CommandGroup heading="Tasks">
          {tasks.slice(0, 20).map(t => (
            <CommandItem
              key={t.id}
              value={t.title}
              onSelect={() => {
                selectTask(t.id);
                toggleCommandPalette();
              }}
            >
              <span className="text-muted-foreground text-xs w-20 shrink-0">{t.status}</span>
              <span className="truncate">{t.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
