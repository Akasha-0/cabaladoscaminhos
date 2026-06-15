'use client';

// Shared IntensityDots — 3-dot intensity indicator (1-3).
// Used by AkashaLifeAreasDashboard.tsx (and any future intensity
// visualization).
//
// A11y: this component is decorative. If you need accessible
// intensity, use a role="meter" pattern with aria-valuenow.

export interface IntensityDotsProps {
  intensity: 1 | 2 | 3;
  color?: string;
  emptyColor?: string;
  className?: string;
}

export function IntensityDots({
  intensity,
  color = '#FF9500',
  emptyColor = '#3A3A3C',
  className = '',
}: IntensityDotsProps) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i <= intensity ? color : emptyColor }}
        />
      ))}
    </div>
  );
}
