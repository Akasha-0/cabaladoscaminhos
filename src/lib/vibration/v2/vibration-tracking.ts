// Vibration tracking with localStorage persistence

const STORAGE_KEY = 'vibration_tracking_v2';

export interface VibrationTrackEntry {
  id: string;
  timestamp: number;
  phase: string;
  notes?: string;
}

export interface VibrationTracking {
  entries: VibrationTrackEntry[];
  lastUpdated: number;
}

export function trackProgress(
  phase: string,
  notes?: string
): VibrationTrackEntry {
  const entry: VibrationTrackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    phase,
    notes,
  };

  const stored = loadTracking();
  stored.entries.push(entry);
  stored.lastUpdated = Date.now();
  saveTracking(stored);

  return entry;
}

export function loadTracking(): VibrationTracking {
  if (typeof window === 'undefined') {
    return { entries: [], lastUpdated: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], lastUpdated: 0 };
    return JSON.parse(raw) as VibrationTracking;
  } catch {
    return { entries: [], lastUpdated: 0 };
  }
}

export function clearTracking(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function saveTracking(data: VibrationTracking): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}