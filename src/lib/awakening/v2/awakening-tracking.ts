export interface AwakeningProgress {
  userId: string;
  track: 'awak' | 'vib' | 'transm' | 'asc';
  currentStep: number;
  totalSteps: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'awakening_progress';

export function trackProgress(userId: string, track: AwakeningProgress['track'], step: number): void {
  const progress: AwakeningProgress = {
    userId,
    track,
    currentStep: step,
    totalSteps: getTotalSteps(track),
    lastUpdated: Date.now(),
  };

  try {
    const stored = getAllProgress();
    stored[userId] = { ...stored[userId], [track]: progress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage unavailable
  }
}

export function getProgress(userId: string, track: AwakeningProgress['track']): AwakeningProgress | null {
  try {
    const stored = getAllProgress();
    return stored[userId]?.[track] ?? null;
  } catch {
    return null;
  }
}

function getAllProgress(): Record<string, Record<string, AwakeningProgress>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTotalSteps(track: AwakeningProgress['track']): number {
  switch (track) {
    case 'awak': return 12;
    case 'vib': return 9;
    case 'transm': return 7;
    case 'asc': return 5;
  }
}