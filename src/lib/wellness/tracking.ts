/**
 * Wellness tracking with LocalStorage persistence
 */

export interface WellnessEntry {
  date: string;
  mood?: number;
  energy?: number;
  sleep?: number;
  notes?: string;
}

export interface WellnessData {
  entries: WellnessEntry[];
  lastUpdated: string;
}

 
const STORAGE_KEY = 'wellness_tracking';

 
function getStorage(): WellnessData {
  if (typeof window === 'undefined') {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as WellnessData;
    }
  } catch {
    // ignore parse errors
  }
  return { entries: [], lastUpdated: new Date().toISOString() };
}

 
function saveStorage(data: WellnessData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

/**
 * Track wellness entry (mood, energy, sleep, notes)
 */
export function trackWellness(entry: WellnessEntry): void {
  const data = getStorage();
  const existing = data.entries.findIndex((e) => e.date === entry.date);
  if (existing >= 0) {
    data.entries[existing] = entry;
  } else {
    data.entries.push(entry);
  }
  data.lastUpdated = new Date().toISOString();
  saveStorage(data);
}
