'use client';

/**
 * OnboardingProgress — Progress bar visual
 * ----------------------------------------------------------------------------
 * Mostra passo atual/total + connectors animados entre etapas.
 * Cor: spiritual-gold (amber-300/dourado) — paleta do projeto.
 *
 * Mobile-first: usa `data-slot` para styling em desktop/mobile.
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingProgressProps {
  current: number; // 0-based
  total: number;
  labels?: string[];
  className?: string;
}

export function OnboardingProgress({
  current,
  total,
  labels,
  className,
}: OnboardingProgressProps) {
  const pct = Math.max(0, Math.min(100, ((current + 1) / total) * 100));

  return (
    <div className={cn('w-full space-y-3', className)} data-testid="onboarding-progress">
      {/* Progress bar (slim) */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label={`Passo ${current + 1} de ${total}`}
        className="relative h-1 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stepper com dots */}
      <div className="flex items-center justify-center gap-1 sm:gap-2" aria-hidden>
        {Array.from({ length: total }).map((_, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={idx} className="flex items-center gap-1 sm:gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border-2 transition-all duration-300',
                  done && 'bg-spiritual-gold border-spiritual-gold text-slate-900',
                  active &&
                    'border-spiritual-gold text-spiritual-gold animate-pulse shadow-[0_0_12px_rgba(212,175,55,0.6)]',
                  !done && !active && 'border-white/20 bg-transparent text-white/40'
                )}
                aria-current={active ? 'step' : undefined}
                title={labels?.[idx] ?? `Passo ${idx + 1}`}
                data-testid={`step-dot-${idx}`}
              >
                {done ? <Check className="w-3 h-3" /> : idx + 1}
              </div>
              {idx < total - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-4 sm:w-8 rounded-full transition-colors',
                    idx < current ? 'bg-spiritual-gold/70' : 'bg-white/15'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Label do passo atual */}
      <p
        className="text-center text-xs font-cinzel uppercase tracking-widest text-spiritual-gold/80"
        data-testid="progress-label"
      >
        Passo {current + 1} de {total}
        {labels?.[current] && <span className="ml-2 text-muted-foreground">— {labels[current]}</span>}
      </p>
    </div>
  );
}