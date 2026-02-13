import { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { Task, TaskStatus, TaskPriority, TaskAssignee } from '../../types/task';
import { COLUMNS, PRIORITY_CONFIG } from '../../types/task';

export function TaskDetail() {
  const { tasks, selectedTaskId, selectTask, updateTask, deleteTask } = useTaskStore();
  const task = tasks.find(t => t.id === selectedTaskId);
  const [form, setForm] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) setForm({ ...task });
  }, [task?.id, task?.updatedAt]);

  if (!task) return null;

  const handleSave = async () => {
    await updateTask(task.id, form);
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-h-[85vh] max-sm:rounded-t-2xl bg-[#0d1117] border-l max-sm:border-l-0 max-sm:border-t border-[#1e293b] shadow-2xl z-50 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
        <h3 className="text-sm font-semibold">Task Detail</h3>
        <button onClick={() => selectTask(null)} className="text-[#94a3b8] hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Title</label>
          <input
            value={form.title || ''}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none focus:border-[#3b82f6]"
          />
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Description</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={5}
            className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none focus:border-[#3b82f6] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Status</label>
            <select
              value={form.status || ''}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
              className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none"
            >
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Priority</label>
            <select
              value={form.priority || ''}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
              className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none"
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Assignee</label>
            <select
              value={form.assignee || ''}
              onChange={e => setForm(f => ({ ...f, assignee: e.target.value as TaskAssignee }))}
              className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none"
            >
              <option value="josh">Josh</option>
              <option value="openclaw">OpenClaw</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Due Date</label>
            <input
              type="date"
              value={form.dueDate?.slice(0, 10) || ''}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value || null }))}
              className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Labels (comma-separated)</label>
          <input
            value={(form.labels || []).join(', ')}
            onChange={e => setForm(f => ({ ...f, labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            className="w-full px-3 py-2 bg-[#1a2035] border border-[#1e293b] rounded-lg text-sm text-white outline-none focus:border-[#3b82f6]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-[#1e293b]">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm rounded-lg transition-colors flex-1 justify-center"
        >
          <Save size={14} /> Save
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
