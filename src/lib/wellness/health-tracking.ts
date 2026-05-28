/**
 * Health tracking with LocalStorage persistence
 */

export interface HealthEntry {
  date: string;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  steps?: number;
  calories?: number;
  water?: number;
  sleep?: number;
  notes?: string;
}

export interface HealthData {
  entries: HealthEntry[];
  lastUpdated: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STORAGE_KEY = 'health_tracking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStorage(): HealthData {
  if (typeof window === 'undefined') {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as HealthData;
    }
  } catch {
    // ignore parse errors
  }
  return { entries: [], lastUpdated: new Date().toISOString() };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveStorage(data: HealthData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

/**
 * Track health entry (weight, blood pressure, heart rate, steps, etc.)
 */
export function trackHealth(entry: HealthEntry): void {
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