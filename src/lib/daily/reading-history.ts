const STORAGE_KEY = 'reading-history';

export interface ReadingEntry {
  date: string;
  path: string;
  timestamp: number;
}

export function saveReading(path: string): void {
  if (typeof window === 'undefined') return;

  const history = getReadingHistory();
  const entry: ReadingEntry = {
    date: new Date().toISOString().split('T')[0],
    path,
    timestamp: Date.now(),
  };

  history.unshift(entry);
  const trimmed = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getReadingHistory(): ReadingEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReadingEntry[];
  } catch {
    return [];
  }
}

export function clearReadingHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}