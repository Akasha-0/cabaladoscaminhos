'use client';

import { cn } from '@/lib/utils';

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
        '--spinner-size': spinnerSize,
        '--star-color': starColor,
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      <style>{`
        @keyframes spinStar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 4px var(--glow-color)); }
          50% { filter: drop-shadow(0 0 12px var(--glow-color)); }
        }

        .loading-spinner-root {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .loading-star {
          display: block;
          font-size: var(--spinner-size);
          color: var(--star-color);
          line-height: 1;
          animation: spinStar 2s linear infinite, glowPulse 2s ease-in-out infinite;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-star {
            animation: none;
          }
        }
      `}</style>
      <span className="loading-star">✦</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
// fallow-ignore-next-line unused-export
export default LoadingSpinner;
