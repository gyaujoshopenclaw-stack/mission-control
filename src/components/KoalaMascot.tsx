import { useState, useEffect, useCallback } from 'react';

const TIPS = [
  "Need help? 🐨",
  "Nice progress today!",
  "That task has been stuck…",
  "You're doing great! 🎯",
  "Ship it! 🚀",
  "Time for a break? ☕",
  "Focus mode activated 🧠",
];

export function KoalaMascot({ celebrating = false }: { celebrating?: boolean }) {
  const [tip, setTip] = useState('');
  const [showTip, setShowTip] = useState(false);

  const handleHover = useCallback(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    setShowTip(true);
  }, []);

  const handleLeave = useCallback(() => {
    setShowTip(false);
  }, []);

  // Celebration effect
  useEffect(() => {
    if (celebrating) {
      const timer = setTimeout(() => {}, 2000);
      return () => clearTimeout(timer);
    }
  }, [celebrating]);

  return (
    <div
      className="relative cursor-pointer select-none"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <span
        className={`inline-block text-xl md:text-2xl transition-transform duration-300 ${
          celebrating ? 'koala-celebrate' : 'koala-idle'
        }`}
        role="img"
        aria-label="Koala mascot"
      >
        🐨
      </span>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a2035] border border-[#3b82f6]/30 rounded-lg text-xs text-[#e2e8f0] whitespace-nowrap shadow-lg animate-fade-in z-50">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a2035] border-r border-b border-[#3b82f6]/30 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
