// Lightbody tracking — persists progress in localStorage
// Skip linting and formatting

export interface LightbodyProgress {
  level: number;
  chakra: string;
  timestamp: number;
}

const STORAGE_KEY = 'cabala_lightbody_progress';

/**
 * Retrieve all tracked lightbody progress records from localStorage.
 */
export function getProgress(): LightbodyProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist a single lightbody progress record into localStorage.
 */
export function setProgress(level: number, chakra: string): void {
  if (typeof window === 'undefined') return;
  const all = getProgress();
  all.push({ level, chakra, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Track progress: update localStorage for the current lightbody activation.
 */
export function trackProgress(level: number, chakra: string): void {
  setProgress(level, chakra);
}
