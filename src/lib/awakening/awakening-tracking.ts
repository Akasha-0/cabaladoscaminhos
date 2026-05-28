const STORAGE_KEY = 'awakening_progress';

export interface AwakeningProgress {
  stage: number;
  updatedAt: number;
}

export function trackProgress(data: Partial<AwakeningProgress>): void {
  if (typeof window === 'undefined') return;
  
  const current: AwakeningProgress = getProgress();
  const next: AwakeningProgress = {
    stage: data.stage ?? current.stage,
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getProgress(): AwakeningProgress {
  if (typeof window === 'undefined') {
    return { stage: 0, updatedAt: 0 };
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stage: 0, updatedAt: 0 };
    return JSON.parse(raw) as AwakeningProgress;
  } catch {
    return { stage: 0, updatedAt: 0 };
  }
}
