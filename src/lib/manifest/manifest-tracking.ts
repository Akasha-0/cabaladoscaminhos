// Manifest tracking with LocalStorage
// eslint-disable

const STORAGE_KEY = 'manifest-tracker';

export interface TrackingEntry {
  id: string;
  type: string;
  date: string;
  progress: number;
  completed: boolean;
}

export interface TrackingState {
  entries: TrackingEntry[];
  lastUpdated: string;
}

/**
 * Get tracking state from LocalStorage
 */
export function getTrackingState(): TrackingState {
  if (typeof window === 'undefined') {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  try {
    return JSON.parse(stored) as TrackingState;
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Save tracking state to LocalStorage
 */
function saveTrackingState(state: TrackingState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Track progress of a manifest reading
 */
export function trackProgress(
  id: string,
  type: string,
  progress: number,
  completed = false
): TrackingEntry {
  const state = getTrackingState();
  const existingIndex = state.entries.findIndex((e) => e.id === id);

  const entry: TrackingEntry = {
    id,
    type,
    date: new Date().toISOString(),
    progress: Math.min(Math.max(progress, 0), 100),
    completed,
  };

  if (existingIndex >= 0) {
    state.entries[existingIndex] = entry;
  } else {
    state.entries.push(entry);
  }

  state.lastUpdated = new Date().toISOString();
  saveTrackingState(state);

  return entry;
}
