'use client';

interface MandalaMiniBadgeProps {
  phase: string;
  moonPhase?: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function MandalaMiniBadge({
  phase,
  moonPhase,
  color = '#7C5CFF',
  size = 'sm',
}: MandalaMiniBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[0.6rem] px-2 py-0.5' : 'text-[0.72rem] px-3 py-1';
  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-cinzel tracking-wide ${sizeClass}`}
      style={{ background: `${color}1A`, border: `1px solid ${color}55`, color }}
      aria-label={`Mandala ${moonPhase ?? phase}`}
    >
      <span
        aria-hidden="true"
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          boxShadow: `0 0 6px ${color}88`,
        }}
      />
      {moonPhase ?? phase}
    </span>
  );
}
