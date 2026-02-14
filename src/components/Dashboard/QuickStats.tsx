import { TrendingUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function QuickStats() {
  const { tasks } = useTaskStore();

  const total = tasks.filter(t => t.status !== 'archived').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done' && t.status !== 'archived').length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
    { label: 'Done', value: `${done}`, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/15' },
    { label: 'Active', value: `${inProgress}`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-400/15' },
    { label: 'Critical', value: `${critical}`, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/15' },
  ];

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-xs font-semibold tracking-wide uppercase">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={s.color} />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">{s.value}</div>
                  <div className="text-[0.65rem] text-muted-foreground">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
