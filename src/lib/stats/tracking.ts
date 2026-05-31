/**
 * Stats tracking with LocalStorage persistence
 */

 
export interface StatsEntry {
  timestamp: number;
  key: string;
   
  data?: Record<string, any>;
}

export interface StatsState {
  entries: StatsEntry[];
}

const STORAGE_KEY = 'cabala_stats';

function loadState(): StatsState {
  if (typeof window === 'undefined') {
    return { entries: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function saveState(state: StatsState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Track a stats event
 */
 
export function trackStats(key: string, data?: Record<string, any>): void {
  const state = loadState();
  state.entries.push({
    timestamp: Date.now(),
    key,
    data,
  });
  saveState(state);
}

export function getStats(): StatsState {
  return loadState();
}
