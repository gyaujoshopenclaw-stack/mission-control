import { useEffect, useState } from 'react';
import { Activity, Clock, CheckCircle2, Search } from 'lucide-react';
import { useTaskStore, type Density } from '../../stores/taskStore';
import { KoalaMascot } from '../KoalaMascot';

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export function StatusBar() {
  const { tasks, lastCompletedAt, searchQuery, setSearchQuery, density, setDensity } = useTaskStore();
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
    <div className="flex items-center justify-between px-4 md:px-6 py-2.5 bg-[#0a0e1a] border-b border-[#1e293b] shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5">
        <KoalaMascot celebrating={celebrating} />
        <span className="text-sm font-bold text-[#e2e8f0] hidden sm:inline">Mission Control</span>
        <span className="sm:hidden text-sm font-bold text-[#e2e8f0]">MC</span>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#1a2035] border border-[#1e293b] rounded-full text-xs text-[#e2e8f0] placeholder-[#475569] outline-none focus:border-[#3b82f6]/50 transition-colors"
          />
        </div>
      </div>

      {/* Right: Density + Stats */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Density toggle */}
        <div className="hidden lg:flex items-center bg-[#1a2035] rounded-full border border-[#1e293b] p-0.5">
          {DENSITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDensity(opt.value)}
              className={`px-2 py-0.5 text-[0.6rem] rounded-full transition-colors font-medium ${
                density === opt.value
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs">
          <Activity size={13} className="text-cyan-400" />
          <span>{inProgress}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>{done}/{total}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[#94a3b8] text-xs">
          <Clock size={13} />
          <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
