// fallow-ignore-file unused-file
// src/lib/shared/date-utils.ts
// Shared date and time utilities to reduce duplication across the codebase.

// ============================================================================
// Date Utilities
// ============================================================================

// fallow-ignore-next-line unused-export
export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// fallow-ignore-next-line unused-export
export function getDayOfYearForDate(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ============================================================================
// Time Utilities
// ============================================================================

// fallow-ignore-next-line unused-export
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// fallow-ignore-next-line unused-export
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// ============================================================================
// Lunar Phase Utilities
// ============================================================================

// ============================================================================
/**
 * Returns the current lunar phase based on day of year.
 */
// fallow-ignore-next-line unused-export
export function getLunarPhase(dayOfYear?: number): { emoji: string; name: string; element: string } {
  const day = dayOfYear ?? getDayOfYear();
  const phases = [
    { emoji: '🌑', name: 'Lua Nova', element: 'introspecção' },
    { emoji: '🌒', name: 'Crescente', element: 'crescimento' },
    { emoji: '🌓', name: 'Quarto Crescente', element: 'ação' },
    { emoji: '🌔', name: 'Gibosa Crescente', element: 'expansão' },
    { emoji: '🌕', name: 'Lua Cheia', element: 'culminação' },
    { emoji: '🌖', name: 'Gibosa Minguante', element: 'liberação' },
    { emoji: '🌗', name: 'Quarto Minguante', element: 'avaliação' },
    { emoji: '🌘', name: 'Minguante', element: 'descanso' },
  ];
  return phases[day % phases.length];
}
