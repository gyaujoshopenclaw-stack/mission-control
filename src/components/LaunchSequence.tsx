import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Mascot with glow ring */}
        <div
          className={cn(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2',
            phase >= 1 ? 'animate-ring-glow border-amber-500/40' : 'border-border',
          )}
        >
          <span
            className={cn(
              'text-4xl transition-all duration-300',
              phase >= 1 ? 'scale-110' : 'scale-100 opacity-50',
            )}
          >
            &#x1F916;
          </span>
        </div>

        <h1
          className={cn(
            'text-2xl font-bold transition-all duration-500',
            phase >= 2 ? 'text-foreground opacity-100' : 'text-transparent opacity-0',
          )}
        >
          Open Claw
        </h1>
        <div className="flex items-center justify-center gap-2">
          {['Systems', 'Comms', 'Data'].map((label, i) => (
            <span
              key={label}
              className={cn(
                'text-xs px-2 py-1 rounded transition-all duration-300',
                phase >= 2 + (i * 0.3) ? 'text-emerald-400 bg-emerald-400/10' : 'text-border',
              )}
            >
              ● {label}
            </span>
          ))}
        </div>
        <p
          className={cn(
            'text-sm transition-all duration-500',
            phase >= 3 ? 'text-muted-foreground opacity-100' : 'opacity-0',
          )}
        >
          All systems operational
        </p>
      </div>
    </div>
  );
}
