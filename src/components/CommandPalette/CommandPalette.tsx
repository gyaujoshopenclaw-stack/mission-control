import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';

export function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, tasks, selectTask, createTask } = useTaskStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, toggleCommandPalette]);

  if (!commandPaletteOpen) return null;

  const filtered = query
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  const handleCreate = async () => {
    if (!query.trim()) return;
    await createTask({ title: query.trim(), status: 'backlog' });
    toggleCommandPalette();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={toggleCommandPalette}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e293b]">
          <Search size={16} className="text-[#64748b]" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filtered.length > 0) {
                selectTask(filtered[0].id);
                toggleCommandPalette();
              } else if (e.key === 'Enter' && query.trim() && filtered.length === 0) {
                handleCreate();
              }
            }}
            placeholder="Search tasks or type to create..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#475569] outline-none"
          />
          <button onClick={toggleCommandPalette} className="text-[#64748b] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {query.trim() && filtered.length === 0 && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#3b82f6] hover:bg-[#1a2035] transition-colors"
            >
              <Plus size={14} /> Create "{query.trim()}"
            </button>
          )}
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => { selectTask(t.id); toggleCommandPalette(); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#e2e8f0] hover:bg-[#1a2035] transition-colors text-left"
            >
              <span className="text-xs text-[#64748b]">{t.status}</span>
              <span className="truncate">{t.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
