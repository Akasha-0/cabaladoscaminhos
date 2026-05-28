export interface JourneyProgress {
  [key: string]: unknown;
}

const STORAGE_KEY = 'journey_progress';

export function trackProgress(journeyId: string, data: Partial<JourneyProgress>): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const progress: Record<string, JourneyProgress> = stored ? JSON.parse(stored) : {};

    progress[journeyId] = {
      ...progress[journeyId],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Silently fail if localStorage is unavailable or quota exceeded
  }
}

export function getProgress(journeyId: string): JourneyProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const progress: Record<string, JourneyProgress> = JSON.parse(stored);
    return progress[journeyId] ?? null;
  } catch {
    return null;
  }
}

export function clearProgress(journeyId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    if (journeyId) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const progress: Record<string, JourneyProgress> = JSON.parse(stored);
      delete progress[journeyId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently fail
  }
}
