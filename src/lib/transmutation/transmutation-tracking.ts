export type TransmutationPhase = 'awakening' | 'vibration' | 'transmutation' | 'ascension';

export interface TransmutationProgress {
  phase: TransmutationPhase;
  percent: number;
  updatedAt: number;
}

export function trackProgress(phase: TransmutationPhase, percent: number): void {
  const stored = localStorage.getItem('transmutation_progress');
  const current: TransmutationProgress = stored
    ? JSON.parse(stored)
    : { phase: 'awakening', percent: 0, updatedAt: Date.now() };

  const updated: TransmutationProgress = {
    phase,
    percent: Math.min(100, Math.max(0, percent)),
    updatedAt: Date.now(),
  };

  if (
    updated.phase !== current.phase ||
    updated.percent !== current.percent
  ) {
    localStorage.setItem('transmutation_progress', JSON.stringify(updated));
  }
}
