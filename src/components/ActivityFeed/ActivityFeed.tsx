import { useState } from 'react';
import { CheckCircle2, Edit, ArrowRight, Trash2, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';

const ICONS: Record<string, typeof Edit> = {
  created: CheckCircle2,
  updated: Edit,
  moved: ArrowRight,
  deleted: Trash2,
};

const COLORS: Record<string, string> = {
  created: 'text-emerald-400',
  updated: 'text-blue-400',
  moved: 'text-amber-400',
  deleted: 'text-red-400',
};

export function ActivityFeed() {
  const { activity } = useTaskStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button for tablet/mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="xl:hidden fixed right-3 bottom-3 z-40 p-3 bg-[#1a2035] border border-[#1e293b] rounded-full shadow-lg text-[#94a3b8] hover:text-white min-w-[3rem] min-h-[3rem] flex items-center justify-center"
      >
        {open ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div className="xl:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Feed panel */}
      <div className={`
        w-72 shrink-0 border-l border-[#1e293b] bg-[#0d1117] flex flex-col
        xl:relative xl:translate-x-0
        fixed right-0 top-0 bottom-0 z-40 transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        hidden xl:flex ${open ? '!flex' : ''}
      `}>
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#e2e8f0] tracking-wide">Activity</h3>
          <button onClick={() => setOpen(false)} className="xl:hidden text-[#94a3b8] hover:text-white">
            <PanelRightClose size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activity.length === 0 && (
            <p className="text-xs text-[#475569] text-center mt-8">No activity yet</p>
          )}
          {activity.slice(0, 30).map(a => {
            const Icon = ICONS[a.action] || Edit;
            const color = COLORS[a.action] || 'text-[#94a3b8]';
            const timeAgo = getTimeAgo(a.timestamp);
            return (
              <div key={a.id} className="flex gap-2 animate-fade-in">
                <Icon size={14} className={`mt-0.5 shrink-0 ${color}`} />
                <div className="min-w-0">
                  <p className="text-xs text-[#e2e8f0] truncate">{a.taskTitle}</p>
                  <p className="text-[0.65rem] text-[#64748b]">{a.details} · {timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function getTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
