'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/shared/utils';

const mysticButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 font-cinzel',
  {
    variants: {
      variant: {
        golden:
          'relative overflow-hidden bg-gradient-to-r from-[var(--spiritual-gold-dark,#9A7B0A)] via-[var(--spiritual-gold,#C9A227)] to-[var(--spiritual-gold-light,#E6C35C)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:brightness-110 group/btn',
        ghost:
          'bg-transparent text-[var(--spiritual-gold,#C9A227)] hover:bg-[var(--spiritual-gold-muted,#3D3520)]/30 transition-colors duration-200',
        outline:
          'bg-transparent border border-[var(--spiritual-gold,#C9A227)]/50 text-[var(--spiritual-gold,#C9A227)] hover:border-[var(--spiritual-gold,#C9A227)] hover:bg-[var(--spiritual-gold,#C9A227)]/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-5 text-sm rounded-lg',
        lg: 'h-12 px-7 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'golden',
      size: 'md',
    },
  }
);

export interface MysticButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'ref'>,
    VariantProps<typeof mysticButtonVariants> {
  loading?: boolean;
}

export function MysticButton({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: MysticButtonProps) {
  return (
    <Button
      className={cn(mysticButtonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      data-loading={loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Sparkles size={14} className="mystic-spinner" aria-hidden="true" />
      )}
      {children}
      <style>{`
        .mystic-spinner {
          display: inline-block;
          animation: mysticRotate 1.2s linear infinite;
          line-height: 1;
        }
        
        @keyframes mysticRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Golden glow pulse for hover */
        [data-loading] .mystic-spinner {
          animation: mysticRotate 1s linear infinite;
        }
        
        /* Reduced motion: disable animations */
        @media (prefers-reduced-motion: reduce) {
          .mystic-spinner,
          [data-loading] .mystic-spinner {
            animation: none;
          }
        }
        
        /* Golden variant hover glow animation */
        .group-\\/btn:hover .group\\/btn:hover {
          animation: none;
        }
      `}</style>
    </Button>
  );
}
