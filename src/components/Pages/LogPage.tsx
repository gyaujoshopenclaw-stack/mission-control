import { CheckCircle2, Edit, ArrowRight, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

const BG_COLORS: Record<string, string> = {
  created: 'bg-emerald-400/10',
  updated: 'bg-blue-400/10',
  moved: 'bg-amber-400/10',
  deleted: 'bg-red-400/10',
};

export function LogPage() {
  const { activity } = useTaskStore();
  const [search, setSearch] = useState('');

  const filtered = activity.filter(a =>
    !search || a.taskTitle.toLowerCase().includes(search.toLowerCase()) || a.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="pl-8 w-48 h-8 text-xs"
          />
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-16">No activity found</p>
          )}
          {filtered.map((a, i) => {
            const Icon = ICONS[a.action] || Edit;
            const color = COLORS[a.action] || 'text-muted-foreground';
            const bg = BG_COLORS[a.action] || 'bg-muted';
            const time = new Date(a.timestamp);
            return (
              <div
                key={a.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-3.5 animate-fade-in',
                  i < filtered.length - 1 && 'border-b border-border',
                )}
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', bg)}>
                  <Icon size={14} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{a.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">{a.details}</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  <div>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </Card>
    </div>
  );
}
