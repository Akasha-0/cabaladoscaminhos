'use client';

import { cn } from '@/lib/utils';

// ============================================================
// SkeletonLine — basic shimmer bar
// ============================================================
export interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonLine({ width = '100%', height = '16px', className }: SkeletonLineProps) {
  return (
    <div
      className={cn('skeleton-spiritual rounded', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// ============================================================
// SkeletonAvatar — circular placeholder
// ============================================================
export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = {
  sm: '32px',
  md: '48px',
  lg: '64px',
};

function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const dimension = avatarSizes[size];
  return (
    <div
      className={cn('skeleton-spiritual rounded-full shrink-0', className)}
      style={{ width: dimension, height: dimension }}
      aria-hidden="true"
    />
  );
}

// ============================================================
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

function SkeletonText({ lines = 3, lastLineWidth = '60%', className }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        return (
          <div
            key={i}
            className="skeleton-spiritual rounded h-4"
            style={{ width: isLast ? lastLineWidth : '100%' }}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// SkeletonCard — card-shaped with optional avatar
// ============================================================
export interface SkeletonCardProps {
  lines?: number;
  avatar?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, avatar = false, className }: SkeletonCardProps) {
  return (
    <div
      className={cn('bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-violet-900/30', className)}
      aria-hidden="true"
    >
      {avatar && (
        <div className="flex items-center gap-3 mb-4">
          <SkeletonAvatar size="md" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="skeleton-spiritual rounded h-3 w-24" />
            <div className="skeleton-spiritual rounded h-2 w-16" />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => {
          const isLast = i === lines - 1;
          return (
            <div
              key={i}
              className="skeleton-spiritual rounded h-3"
              style={{ width: isLast ? '75%' : '100%' }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// SkeletonChart — bar chart simulation
// fallow-ignore-next-line unused-type
export interface SkeletonChartProps {
  height?: string;
  className?: string;
}

const barHeights = ['45%', '70%', '55%', '85%', '60%', '90%', '50%', '75%', '40%', '65%'];

function SkeletonChart({ height = '200px', className }: SkeletonChartProps) {
  return (
    <div
      className={cn('flex items-end gap-2 px-4 py-4 rounded-xl bg-black/20', className)}
      style={{ height }}
      aria-hidden="true"
    >
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="skeleton-spiritual rounded-t flex-1 transition-none"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

// ============================================================
// SkeletonMapa — MapaAlma dashboard layout simulation
// ============================================================
export interface SkeletonMapaProps {
  className?: string;
}

export function SkeletonMapa({ className }: SkeletonMapaProps) {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 p-4', className)}
      role="status"
      aria-label="Carregando mapa espiritual..."
      aria-hidden="false"
    >
      {/* Top row: 4 number cards + correlation card */}
      <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-violet-900/30 flex flex-col items-center gap-2"
          >
            <div className="skeleton-spiritual rounded-full w-10 h-10" />
            <div className="skeleton-spiritual rounded h-6 w-12" />
            <div className="skeleton-spiritual rounded h-2 w-16" />
          </div>
        ))}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-violet-900/30 flex flex-col gap-3">
          <div className="skeleton-spiritual rounded h-3 w-20" />
          <div className="flex gap-2 items-center">
            <SkeletonAvatar size="sm" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="skeleton-spiritual rounded h-2 w-full" />
              <div className="skeleton-spiritual rounded h-2 w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Odu card + SVG chart placeholder */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-violet-900/30 flex flex-col gap-3">
        <div className="skeleton-spiritual rounded h-4 w-24" />
        <div className="flex gap-3 items-center">
          <div className="skeleton-spiritual rounded w-16 h-16" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton-spiritual rounded h-3 w-full" />
            <div className="skeleton-spiritual rounded h-3 w-5/6" />
            <div className="skeleton-spiritual rounded h-3 w-4/6" />
          </div>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-violet-900/30">
        <div className="skeleton-spiritual rounded h-4 w-32 mb-4" />
        {/* SVG chart placeholder */}
        <svg viewBox="0 0 200 100" className="w-full h-32 opacity-30" aria-hidden="true">
          <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <circle cx="40" cy="50" r="5" fill="rgba(212,175,55,0.3)" />
          <circle cx="80" cy="35" r="5" fill="rgba(212,175,55,0.3)" />
          <circle cx="120" cy="60" r="5" fill="rgba(212,175,55,0.3)" />
          <circle cx="160" cy="30" r="5" fill="rgba(212,175,55,0.3)" />
        </svg>
      </div>

      {/* Bottom row: Chakra panel + SVG chart placeholder */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-violet-900/30">
        <div className="skeleton-spiritual rounded h-4 w-28 mb-3" />
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton-spiritual rounded-full" style={{ width: '28px', height: '28px' }} />
          ))}
        </div>
        <div className="skeleton-spiritual rounded h-3 w-40 mx-auto mt-3" />
      </div>

      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-violet-900/30">
        <div className="skeleton-spiritual rounded h-4 w-36 mb-4" />
        {/* Radial/ring chart placeholder */}
        <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto opacity-30" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="8" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="8"
            strokeDasharray="200 114" strokeDashoffset="0" />
          <circle cx="60" cy="10" r="5" fill="rgba(212,175,55,0.3)" />
        </svg>
      </div>
    </div>
  );
}