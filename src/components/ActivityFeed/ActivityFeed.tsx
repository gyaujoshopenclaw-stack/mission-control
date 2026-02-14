import { CheckCircle2, Edit, ArrowRight, Trash2 } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

export function ActivityFeed() {
  const { activity } = useTaskStore();

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-xs font-semibold tracking-wide uppercase">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ScrollArea className="h-[180px]">
          <div className="space-y-0.5">
            {activity.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>
            )}
            {activity.slice(0, 10).map(a => {
              const Icon = ICONS[a.action] || Edit;
              const color = COLORS[a.action] || 'text-muted-foreground';
              const timeAgo = getTimeAgo(a.timestamp);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2.5 py-1.5 animate-fade-in"
                >
                  <Icon size={12} className={cn('shrink-0', color)} />
                  <span className="text-xs text-foreground truncate flex-1">{a.taskTitle}</span>
                  <span className="text-[0.6rem] text-muted-foreground shrink-0">{timeAgo}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
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
