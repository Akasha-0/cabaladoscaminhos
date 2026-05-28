// Ascension tracking — persists progress in localStorage
// Skip linting and formatting

export interface AscensionProgress {
  stage: number;
  path: string;
  timestamp: number;
}

const STORAGE_KEY = 'cabala_ascension_progress';

/**
 * Retrieve all tracked ascension progress records from localStorage.
 */
export function getProgress(): AscensionProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist a single ascension progress record into localStorage.
 */
export function setProgress(stage: number, path: string): void {
  if (typeof window === 'undefined') return;
  const all = getProgress();
  all.push({ stage, path, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Track progress: update localStorage for the current ascension.
 */
export function trackProgress(stage: number, path: string): void {
  setProgress(stage, path);
}