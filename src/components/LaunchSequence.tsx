import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export function LaunchSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => onComplete(), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Zap
          size={48}
          className={`mx-auto transition-all duration-300 ${
            phase >= 1 ? 'text-[#3b82f6] scale-110' : 'text-[#1e293b] scale-100'
          }`}
        />
        <h1
          className={`text-2xl font-bold transition-all duration-500 ${
            phase >= 2 ? 'text-white opacity-100' : 'text-transparent opacity-0'
          }`}
        >
          Mission Control
        </h1>
        <div className="flex items-center justify-center gap-2">
          {['Systems', 'Comms', 'Data'].map((label, i) => (
            <span
              key={label}
              className={`text-xs px-2 py-1 rounded transition-all duration-300 ${
                phase >= 2 + (i * 0.3) ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#1e293b]'
              }`}
            >
              ● {label}
            </span>
          ))}
        </div>
        <p
          className={`text-sm transition-all duration-500 ${
            phase >= 3 ? 'text-[#94a3b8] opacity-100' : 'opacity-0'
          }`}
        >
          All systems operational
        </p>
      </div>
    </div>
  );
}
