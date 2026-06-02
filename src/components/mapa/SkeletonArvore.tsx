// fallow-ignore-file unused-file
'use client';

import { cn } from '@/lib/utils';

interface SkeletonArvoreProps {
  className?: string;
}

export function SkeletonArvore({ className }: SkeletonArvoreProps) {
  return (
    <div
      className={cn('card-spiritual p-4', className)}
      role="status"
      aria-label="Carregando árvore da vida..."
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="skeleton-spiritual rounded w-5 h-5" />
        <div className="skeleton-spiritual rounded h-5 w-36" />
      </div>

      {/* SVG placeholder matching ArvoreVidaViz proportions (300x500 viewBox) */}
      <div className="relative">
        <svg
          viewBox="0 0 300 500"
          className="w-full h-auto"
          aria-hidden="true"
        >
          {/* Background glow */}
          <defs>
            <radialGradient id="skeletonGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Centered glow area */}
          <ellipse cx="150" cy="200" rx="120" ry="150" fill="url(#skeletonGlow)" />

          {/* Simulated Sephiroth positions */}
          {[
            { cx: 150, cy: 30 },
            { cx: 150, cy: 75 },
            { cx: 150, cy: 75 },
            { cx: 100, cy: 160 },
            { cx: 200, cy: 160 },
            { cx: 150, cy: 220 },
            { cx: 80, cy: 310 },
            { cx: 220, cy: 310 },
            { cx: 150, cy: 400 },
            { cx: 150, cy: 470 },
          ].map((pos, i) => (
            <circle
              key={i}
              cx={pos.cx}
              cy={pos.cy}
              r={16}
              className="skeleton-spiritual animate-shimmer"
            />
          ))}

          {/* Simulated paths */}
          {[
            [150, 30, 150, 75],
            [150, 75, 100, 160],
            [150, 75, 200, 160],
            [100, 160, 200, 160],
            [100, 160, 150, 220],
            [200, 160, 150, 220],
            [150, 220, 80, 310],
            [150, 220, 220, 310],
            [80, 310, 220, 310],
            [80, 310, 150, 400],
            [220, 310, 150, 400],
            [150, 400, 150, 470],
          ].map((line, i) => (
            <line
              key={i}
              x1={line[0]}
              y1={line[1]}
              x2={line[2]}
              y2={line[3]}
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Legend placeholder */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="skeleton-spiritual rounded-full w-3 h-3" />
            <div className="skeleton-spiritual rounded h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Info summary placeholder */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="skeleton-spiritual rounded h-6 w-full" />
        <div className="skeleton-spiritual rounded h-6 w-full" />
      </div>
    </div>
  );
}