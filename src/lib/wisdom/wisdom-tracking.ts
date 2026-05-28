// Wisdom tracking with LocalStorage persistence

const STORAGE_KEY = 'wisdom_progress';

export interface WisdomProgress {
  lastUpdated: string;
  insightId: string;
  completed: boolean;
  metadata?: Record<string, unknown>;
}

export interface WisdomTracking {
  progress: WisdomProgress[];
  version: number;
}

export function trackProgress(
  insightId: string,
  metadata?: Record<string, unknown>
): WisdomProgress {
  const now = new Date().toISOString();
  const entry: WisdomProgress = {
    lastUpdated: now,
    insightId,
    completed: true,
    metadata,
  };

  const stored = getTrackingData();
  const existingIndex = stored.progress.findIndex((p) => p.insightId === insightId);

  if (existingIndex >= 0) {
    stored.progress[existingIndex] = { ...stored.progress[existingIndex], ...entry };
  } else {
    stored.progress.push(entry);
  }

  persistTrackingData(stored);
  return entry;
}

export function getProgress(insightId: string): WisdomProgress | null {
  const stored = getTrackingData();
  return stored.progress.find((p) => p.insightId === insightId) ?? null;
}

export function clearProgress(insightId?: string): void {
  if (insightId) {
    const stored = getTrackingData();
    stored.progress = stored.progress.filter((p) => p.insightId !== insightId);
    persistTrackingData(stored);
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function getTrackingData(): WisdomTracking {
  if (typeof window === 'undefined') {
    return { progress: [], version: 1 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: [], version: 1 };
    return JSON.parse(raw) as WisdomTracking;
  } catch {
    return { progress: [], version: 1 };
  }
}

function persistTrackingData(data: WisdomTracking): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded or unavailable
  }
}
