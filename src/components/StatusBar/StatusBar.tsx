import { useEffect, useState } from 'react';
import { Activity, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { KoalaMascot } from '../KoalaMascot';

export function StatusBar() {
  const { tasks, toggleCommandPalette, lastCompletedAt } = useTaskStore();
  const [time, setTime] = useState(new Date());
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (lastCompletedAt > 0) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCompletedAt]);

  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.filter(t => t.status !== 'archived').length;

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-[#0d1117] border-b border-[#1e293b] text-sm shrink-0">
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 text-[#3b82f6] font-bold text-base">
          <Zap size={18} className="animate-pulse-slow" />
          <span className="hidden sm:inline">Mission Control</span>
          <span className="sm:hidden">MC</span>
        </div>
        <KoalaMascot celebrating={celebrating} />
        <div className="hidden md:flex items-center gap-1.5 text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          Online
        </div>
      </div>

      <button
        onClick={toggleCommandPalette}
        className="hidden sm:block px-3 py-1 rounded-lg bg-[#1a2035] border border-[#1e293b] text-[#94a3b8] text-xs hover:border-[#3b82f6] transition-colors cursor-pointer"
      >
        ⌘K — Command
      </button>

      <div className="flex items-center gap-3 md:gap-6 text-[#94a3b8] text-xs">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-cyan-400" />
          <span>{inProgress}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{done}/{total}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Clock size={14} />
          <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
