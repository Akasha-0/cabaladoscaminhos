// Portal tracking — persists progress in localStorage
// Skip linting and formatting

export interface PortalProgress {
  portalId: string;
  step: number;
  unlockedAt: number;
}

const STORAGE_KEY = 'cabala_portal_progress';

/**
 * Retrieve all tracked portal progress records from localStorage.
 */
export function getProgress(): PortalProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist a single portal progress record into localStorage.
 * Merges by portalId — later steps overwrite earlier ones.
 */
export function setProgress(portalId: string, step: number): void {
  if (typeof window === 'undefined') return;
  const all = getProgress().filter((p) => p.portalId !== portalId);
  all.push({ portalId, step, unlockedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Return the current step for a given portal, or 0 if not tracked.
 */
export function getStep(portalId: string): number {
  return getProgress().find((p) => p.portalId === portalId)?.step ?? 0;
}

/**
 * Track progress: update localStorage for the given portal.
 * Step numbering starts at 1 (first step = step 1).
 */
export function trackProgress(portalId: string, step: number): void {
  setProgress(portalId, step);
}
