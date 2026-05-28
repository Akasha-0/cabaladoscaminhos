// Merkabah tracking — persists progress in localStorage
// Skip linting and formatting

export interface MerkabahProgress {
  stageId: string;
  timestamp: number;
  completed: boolean;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = 'merkabah_progress';

/**
 * Retrieve all tracked merkabah progress records from localStorage.
 */
export function getProgress(): MerkabahProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist a single merkabah progress record into localStorage.
 */
export function setProgress(
  stageId: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  const all = getProgress();
  const existingIndex = all.findIndex((p) => p.stageId === stageId);
  const entry: MerkabahProgress = {
    stageId,
    timestamp: Date.now(),
    completed: true,
    metadata,
  };
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Track progress: update localStorage for the current merkabah stage.
 */
export function trackProgress(
  stageId: string,
  metadata?: Record<string, unknown>
): void {
  setProgress(stageId, metadata);
}