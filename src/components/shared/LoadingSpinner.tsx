'use client';

import { cn } from '@/lib/utils';

// fallow-ignore-next-line unused-file
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'purple' | 'white';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: '24px',
  md: '40px',
  lg: '64px',
};

const colorMap = {
  gold: 'var(--spiritual-gold, #C9A227)',
  purple: 'var(--spiritual-violet, #A855F7)',
  white: '#F5F0E8',
};

const glowMap = {
  gold: 'var(--spiritual-gold, #C9A227)',
  purple: 'var(--spiritual-violet, #A855F7)',
  white: '#F5F0E8',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'gold',
  label = 'Carregando...',
  className = '',
}: LoadingSpinnerProps) {
  const spinnerSize = sizeMap[size];
  const starColor = colorMap[variant];
  const glowColor = glowMap[variant];

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('loading-spinner-root', className)}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        '--star-color': starColor,
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      <style>{`
        .loading-spinner-root {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .loading-star {
          color: var(--star-color);
          font-size: calc(var(--spin-size, 24px) * 0.5);
          line-height: 1;
          filter: drop-shadow(0 0 4px var(--glow-color)) drop-shadow(0 0 8px var(--glow-color));
          animation: spin 1.2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-star { animation: none; }
        }
      `}</style>
      <span className="loading-star">✦</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
export default LoadingSpinner;
