import { cn } from '@/lib/utils';

interface KaiAvatarProps {
  size?: number;
  className?: string;
}

export function KaiAvatar({ size = 96, className }: KaiAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        {/* Body gradient — silver-blue like calm ocean water */}
        <linearGradient id="kai-body" x1="100" y1="200" x2="100" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7BA7CC" />
          <stop offset="100%" stopColor="#B0C4DE" />
        </linearGradient>

        {/* Head gradient */}
        <linearGradient id="kai-head" x1="100" y1="40" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C5D5E8" />
          <stop offset="100%" stopColor="#8FB3D4" />
        </linearGradient>

        {/* Eye glow */}
        <radialGradient id="kai-eye-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="60%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#14B8A6" />
        </radialGradient>

        {/* Key gradient — golden */}
        <linearGradient id="kai-key" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Knowledge orb glow */}
        <radialGradient id="kai-orb" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#14B8A6" />
        </radialGradient>

        {/* Soft glow filter for orb */}
        <filter id="kai-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>

        {/* Eye shimmer highlight */}
        <linearGradient id="kai-shimmer" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* === BODY — Water-droplet shape === */}
      <ellipse cx="100" cy="155" rx="42" ry="38" fill="url(#kai-body)" />

      {/* Collar — teal wave pattern at neck */}
      <path
        d="M68 130 Q76 136 84 130 Q92 124 100 130 Q108 136 116 130 Q124 124 132 130"
        stroke="#0D9488"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M72 136 Q80 142 88 136 Q96 130 104 136 Q112 142 120 136 Q128 130 128 136"
        stroke="#115E59"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* === LEFT ARM — raised in friendly wave === */}
      <g>
        {/* Upper arm */}
        <path
          d="M62 145 Q48 130 40 115"
          stroke="url(#kai-body)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand */}
        <circle cx="38" cy="110" r="8" fill="#B0C4DE" />
        {/* Fingers (small wave lines) */}
        <path d="M32 105 Q30 100 32 96" stroke="#8FB3D4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M36 103 Q35 98 36 94" stroke="#8FB3D4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M40 102 Q40 97 41 94" stroke="#8FB3D4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>

      {/* === RIGHT ARM — holding knowledge orb === */}
      <g>
        {/* Upper arm */}
        <path
          d="M138 145 Q152 138 158 148"
          stroke="url(#kai-body)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand */}
        <circle cx="160" cy="152" r="7" fill="#B0C4DE" />

        {/* Knowledge orb — glowing */}
        <circle cx="162" cy="140" r="9" fill="url(#kai-orb)" filter="url(#kai-glow)" opacity="0.5" />
        <circle cx="162" cy="140" r="7" fill="url(#kai-orb)" />
        <circle cx="160" cy="137" r="2.5" fill="white" opacity="0.5" />
      </g>

      {/* === HEAD — rounded rectangle === */}
      <rect x="55" y="42" width="90" height="84" rx="28" fill="url(#kai-head)" />

      {/* Subtle face highlight */}
      <rect x="62" y="46" width="76" height="40" rx="20" fill="white" opacity="0.08" />

      {/* === EYES — large teal-cyan with shimmer === */}
      {/* Left eye */}
      <ellipse cx="82" cy="82" rx="12" ry="14" fill="url(#kai-eye-glow)" />
      <ellipse cx="82" cy="82" rx="10" ry="12" fill="url(#kai-eye-glow)" />
      <ellipse cx="80" cy="78" rx="4" ry="5" fill="url(#kai-shimmer)" />
      <circle cx="78" cy="76" r="2.5" fill="white" opacity="0.7" />

      {/* Right eye */}
      <ellipse cx="118" cy="82" rx="12" ry="14" fill="url(#kai-eye-glow)" />
      <ellipse cx="118" cy="82" rx="10" ry="12" fill="url(#kai-eye-glow)" />
      <ellipse cx="116" cy="78" rx="4" ry="5" fill="url(#kai-shimmer)" />
      <circle cx="114" cy="76" r="2.5" fill="white" opacity="0.7" />

      {/* === SMILE — small friendly curve === */}
      <path
        d="M90 102 Q100 112 110 102"
        stroke="#0D9488"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Rosy cheeks */}
      <circle cx="70" cy="98" r="6" fill="#F9A8D4" opacity="0.25" />
      <circle cx="130" cy="98" r="6" fill="#F9A8D4" opacity="0.25" />

      {/* === ANTENNA — golden skeleton key === */}
      <g transform="translate(100, 18) rotate(12)">
        {/* Key shaft */}
        <rect x="-2.5" y="-8" width="5" height="28" rx="2.5" fill="url(#kai-key)" />
        {/* Key bow (top ring) */}
        <circle cx="0" cy="-12" r="8" stroke="url(#kai-key)" strokeWidth="4" fill="none" />
        {/* Key bit teeth (bottom) */}
        <path d="M2.5 16 L7 16 L7 12 L5 12 L5 8 L7 8 L7 5" stroke="url(#kai-key)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Sparkle on key */}
        <circle cx="-4" cy="-16" r="1.5" fill="#FDE68A" opacity="0.8" />
      </g>

      {/* === FEET — small rounded nubs === */}
      <ellipse cx="84" cy="190" rx="14" ry="7" fill="#7BA7CC" />
      <ellipse cx="116" cy="190" rx="14" ry="7" fill="#7BA7CC" />
    </svg>
  );
}
