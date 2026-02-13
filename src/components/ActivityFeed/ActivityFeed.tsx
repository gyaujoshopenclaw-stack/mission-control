import { CheckCircle2, Edit, ArrowRight, Trash2 } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';

const ICONS: Record<string, any> = {
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

  return (
    <div className="w-72 shrink-0 border-l border-[#1e293b] bg-[#0d1117] flex flex-col">
      <div className="px-4 py-3 border-b border-[#1e293b]">
        <h3 className="text-sm font-semibold text-[#e2e8f0]">Activity</h3>
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
                <p className="text-[10px] text-[#64748b]">{a.details} · {timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
