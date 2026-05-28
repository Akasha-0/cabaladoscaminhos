/**
 * Journey tracking utilities
 * Persists and retrieves user journey progress via LocalStorage.
 */

const STORAGE_KEY = 'cabala_journey_progress';

export interface JourneyProgress {
  step: number;
  completedSteps: number[];
  lastUpdated: string;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function trackProgress(step: number, completed = false): JourneyProgress | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  const progress: JourneyProgress = raw
    ? JSON.parse(raw)
    : { step: 0, completedSteps: [], lastUpdated: new Date().toISOString() };

  if (completed && !progress.completedSteps.includes(step)) {
    progress.completedSteps.push(step);
  }
  progress.step = step;
  progress.lastUpdated = new Date().toISOString();

  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

export function getProgress(): JourneyProgress | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearProgress(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}
