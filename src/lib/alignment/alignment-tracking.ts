// Alignment tracking with LocalStorage persistence

const STORAGE_KEY = 'alignment_progress';

export interface AlignmentProgress {
  lastUpdated: string;
  stageId: string;
  completed: boolean;
  metadata?: Record<string, unknown>;
}

export interface AlignmentTracking {
  progress: AlignmentProgress[];
  version: number;
}

export function trackProgress(
  stageId: string,
  metadata?: Record<string, unknown>
): AlignmentProgress {
  const now = new Date().toISOString();
  const entry: AlignmentProgress = {
    lastUpdated: now,
    stageId,
    completed: true,
    metadata,
  };

  const stored = getTrackingData();
  const existingIndex = stored.progress.findIndex((p) => p.stageId === stageId);

  if (existingIndex >= 0) {
    stored.progress[existingIndex] = { ...stored.progress[existingIndex], ...entry };
  } else {
    stored.progress.push(entry);
  }

  persistTrackingData(stored);
  return entry;
}

export function getProgress(stageId: string): AlignmentProgress | null {
  const stored = getTrackingData();
  return stored.progress.find((p) => p.stageId === stageId) ?? null;
}

export function clearProgress(stageId?: string): void {
  if (stageId) {
    const stored = getTrackingData();
    stored.progress = stored.progress.filter((p) => p.stageId !== stageId);
    persistTrackingData(stored);
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function getTrackingData(): AlignmentTracking {
  if (typeof window === 'undefined') {
    return { progress: [], version: 1 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: [], version: 1 };
    return JSON.parse(raw) as AlignmentTracking;
  } catch {
    return { progress: [], version: 1 };
  }
}

function persistTrackingData(data: AlignmentTracking): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded or unavailable
  }
}