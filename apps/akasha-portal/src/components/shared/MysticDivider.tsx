'use client';

import { cn } from '@/lib/shared/utils';

interface MysticDividerProps {
  symbol?: 'star' | 'diamond' | 'sun' | 'moon';
  variant?: 'subtle' | 'default' | 'bold';
  className?: string;
}

const SYMBOLS = {
  star: '✦',
  diamond: '◆',
  sun: '☀',
  moon: '☽',
} as const;

export function MysticDivider({
  symbol = 'star',
  variant = 'default',
  className = '',
}: MysticDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn('flex w-full items-center gap-3', className)}
    >
      {/* Left line */}
      <span
        className={cn(
          'h-px flex-1',
          variant === 'subtle' && 'bg-gradient-to-r from-transparent to-[rgba(212,175,55,0.3)]',
          variant === 'default' && 'bg-gradient-to-r from-transparent to-spiritual-gold/60',
          variant === 'bold' && 'h-0.5 bg-gradient-to-r from-transparent to-spiritual-gold/60'
        )}
      />

      {/* Center symbol */}
      <span
        className={cn(
          'shrink-0 select-none font-serif',
          variant === 'subtle' && 'text-[rgba(212,175,55,0.4)] text-base',
          variant === 'default' && 'text-spiritual-gold text-lg',
          variant === 'bold' && [
            'text-spiritual-gold-light text-xl',
            'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]',
          ]
        )}
      >
        {SYMBOLS[symbol]}
      </span>

      {/* Right line */}
      <span
        className={cn(
          'h-px flex-1',
          variant === 'subtle' && 'bg-gradient-to-l from-transparent to-[rgba(212,175,55,0.3)]',
          variant === 'default' && 'bg-gradient-to-l from-transparent to-spiritual-gold/60',
          variant === 'bold' && 'h-0.5 bg-gradient-to-l from-transparent to-spiritual-gold/60'
        )}
      />
    </div>
  );
}
