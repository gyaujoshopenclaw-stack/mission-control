import { useEffect, useState } from 'react';
import { Clock, Activity, CheckCircle2, Menu } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { AppTab } from '../../types/task';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const TABS: { id: AppTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'docs', label: 'Docs' },
  { id: 'log', label: 'Log' },
];

export function TopNavBar() {
  const { tasks, activeTab, setActiveTab, toggleSidebar } = useTaskStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.filter(t => t.status !== 'archived').length;

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-sidebar/80 border-b border-border shrink-0 backdrop-blur-sm">
      {/* Left: Mobile menu + Tabs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu size={18} />
        </Button>

        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'text-sm',
                activeTab === tab.id
                  ? 'text-mc-cyan bg-mc-cyan/10'
                  : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Right: Stats + Sync time */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-xs">
          <Activity size={13} className="text-mc-cyan" />
          <span>{inProgress}</span>
        </div>
        <Separator orientation="vertical" className="hidden sm:block h-4" />
        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-xs">
          <CheckCircle2 size={13} className="text-mc-success" />
          <span>{done}/{total}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock size={13} />
          <span>Sync: {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
