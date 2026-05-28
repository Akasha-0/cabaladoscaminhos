/**
 * Transformation tracking utilities using LocalStorage.
 */

const STORAGE_KEY = 'transformation_progress';

export interface TransformationProgress {
  step: string;
  completed: boolean;
  timestamp: number;
}

export function trackProgress(step: string, completed = true): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const progress: TransformationProgress[] = raw ? JSON.parse(raw) : [];

    const existingIndex = progress.findIndex((p) => p.step === step);
    const entry: TransformationProgress = {
      step,
      completed,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = entry;
    } else {
      progress.push(entry);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Silently fail if LocalStorage is unavailable or quota exceeded.
  }
}

export function getProgress(): TransformationProgress[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail.
  }
}
