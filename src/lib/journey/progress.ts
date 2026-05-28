const STORAGE_KEY = 'journey_progress';

export interface JourneyProgress {
  totalPoints: number;
  completedMilestones: number;
  totalMilestones: number;
  lastUpdated: string;
}

function readStorage(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function getProgress(): JourneyProgress {
  const stored = readStorage();
  return {
    totalPoints: (stored.totalPoints as number) ?? 0,
    completedMilestones: (stored.completedMilestones as number) ?? 0,
    totalMilestones: (stored.totalMilestones as number) ?? 15,
    lastUpdated: (stored.lastUpdated as string) ?? new Date().toISOString(),
  };
}

export function updateProgress(updates: Partial<JourneyProgress>): void {
  const current = readStorage();
  writeStorage({
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  });
}

export function resetProgress(): void {
  writeStorage({});
}