// fallow-ignore-file unused-file
const STORAGE_KEY = 'cabala-progress';

 
type ProgressData = Record<string, any>;

export interface ProgressEntry {
  timestamp: number;
  data: ProgressData;
}

export interface ProgressState {
  entries: ProgressEntry[];
  completed: string[];
}

function loadState(): ProgressState {
  if (typeof window === 'undefined') {
    return { entries: [], completed: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: [], completed: [] };
  } catch {
    return { entries: [], completed: [] };
  }
}

function saveState(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function trackProgress(key: string, data: ProgressData = {}): void {
  const state = loadState();
  state.entries.push({ timestamp: Date.now(), data: { ...data, key } });
  if (!state.completed.includes(key)) {
    state.completed.push(key);
  }
  saveState(state);
}

export function getProgress(): ProgressState {
  return loadState();
}