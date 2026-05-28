const STORAGE_KEY = 'education_progress';

export interface ProgressEntry {
  id: string;
  completedAt: string;
  score?: number;
}

export interface Progress {
  [topicId: string]: ProgressEntry[];
}

function readStorage(): Progress {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Progress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function trackProgress(topicId: string, score?: number): void {
  const data = readStorage();
  const entry: ProgressEntry = {
    id: `${Date.now()}`,
    completedAt: new Date().toISOString(),
    ...(score !== undefined ? { score } : {}),
  };
  if (!data[topicId]) data[topicId] = [];
  data[topicId].push(entry);
  writeStorage(data);
}

export function getProgress(topicId?: string): Progress | ProgressEntry[] {
  const data = readStorage();
  if (topicId) return data[topicId] || [];
  return data;
}

export function calculateCompletion(
  topicId: string,
  totalItems: number
): number {
  const entries = getProgress(topicId) as ProgressEntry[];
  if (totalItems <= 0) return 0;
  return Math.min(100, Math.round((entries.length / totalItems) * 100));
}
