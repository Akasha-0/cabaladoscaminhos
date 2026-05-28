// Source tracking with localStorage persistence

const STORAGE_KEY = 'source_tracking';

export interface SourceTrackingData {
  completedSources: string[];
  lastUpdated: string;
}

function getStoredData(): SourceTrackingData {
  if (typeof window === 'undefined') {
    return { completedSources: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { completedSources: [], lastUpdated: new Date().toISOString() };
    }
    return JSON.parse(raw) as SourceTrackingData;
  } catch {
    return { completedSources: [], lastUpdated: new Date().toISOString() };
  }
}

function persistData(data: SourceTrackingData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function trackProgress(sourceId: string, completed: boolean): void {
  const data = getStoredData();
  if (completed) {
    if (!data.completedSources.includes(sourceId)) {
      data.completedSources.push(sourceId);
    }
  } else {
    data.completedSources = data.completedSources.filter(id => id !== sourceId);
  }
  data.lastUpdated = new Date().toISOString();
  persistData(data);
}

export function isCompleted(sourceId: string): boolean {
  const data = getStoredData();
  return data.completedSources.includes(sourceId);
}

export function getCompletedSources(): string[] {
  return getStoredData().completedSources;
}

export function clearTracking(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}