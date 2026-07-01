'use client';

// ============================================================================
// OnboardingProgress — Wave 35 Beta Onboarding
// ============================================================================
// Barra de progresso horizontal (mobile-first) que mostra N/7 steps.
// Aparece no topo de welcome / profile / first-actions / tour.
//
// Milestones:
//   - 50% (steps 4/7) — dispara confetti animation (OnboardingProgress
//     retorna `justHitMilestone` para parent decidir)
//   - 100% — estado terminal (ONBOARDED / SKIPPED)
//
// 7 steps = 1 (signup) + 1 (welcome open) + 1 (welcome complete) +
//          1 (profile) + 1 (tradition) + 1 (first-action start) +
//          1 (first-action complete)
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  progressPercent,
  progressStepNumber,
  TOTAL_PROGRESS_STEPS,
  type OnboardingStateLite,
} from './progress-helpers';

// Re-exportar para conveniência.
export { progressPercent, progressStepNumber } from './progress-helpers';

export interface OnboardingProgressProps {
  state: OnboardingStateLite;
  /** Mostra label (ex: "3 de 7") abaixo da barra. */
  showLabel?: boolean;
  /** Tamanho da barra: sm = 4px, md = 6px (default), lg = 8px. */
  size?: 'sm' | 'md' | 'lg';
  /** Callback quando atinge 50% (milestone confetti). */
  onMilestone?: (milestone: 50 | 100) => void;
  /** Classe adicional (para posicionar no layout). */
  className?: string;
}

const SIZE_MAP: Record<NonNullable<OnboardingProgressProps['size']>, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export function OnboardingProgress({
  state,
  showLabel = true,
  size = 'md',
  onMilestone,
  className,
}: OnboardingProgressProps) {
  const percent = progressPercent(state);
  const stepNumber = progressStepNumber(state);
  const [celebrated50, setCelebrated50] = useState(false);

  // Dispara milestone 50% quando passa (single-shot).
  useEffect(() => {
    if (!onMilestone) return;
    if (percent >= 50 && percent < 100 && !celebrated50) {
      onMilestone(50);
      setCelebrated50(true);
    }
    if (percent >= 100) {
      onMilestone(100);
    }
  }, [percent, onMilestone, celebrated50]);

  const labelText = useMemo(() => {
    if (state === 'ONBOARDED' || state === 'SKIPPED') return 'Onboarding completo';
    if (state === 'DROPPED') return 'Retomar onboarding';
    return `${stepNumber} de ${TOTAL_PROGRESS_STEPS}`;
  }, [state, stepNumber]);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('w-full bg-slate-800/60 rounded-full overflow-hidden', SIZE_MAP[size])}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do onboarding: ${Math.round(percent)}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            percent >= 100
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-amber-600 to-amber-400'
          )}
          style={{ width: `${Math.round(percent)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-tiny text-slate-400 font-cinzel tracking-wider">
            {labelText}
          </p>
          <p className="text-tiny text-amber-300/80">{Math.round(percent)}%</p>
        </div>
      )}
    </div>
  );
}