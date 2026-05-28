// Reading history management with LocalStorage persistence

export interface Reading {
  id: string;
  type: string;
  date: string;
  question?: string;
  cards?: string[];
  interpretation?: string;
  context?: Record<string, unknown>;
}

const STORAGE_KEY = 'divination_reading_history';
const MAX_HISTORY = 100;

export function getReadingHistory(): Reading[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveReading(reading: Omit<Reading, 'id' | 'date'>): Reading {
  const history = getReadingHistory();
  const newReading: Reading = {
    ...reading,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  history.unshift(newReading);

  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  return newReading;
}

export function getReadingById(id: string): Reading | undefined {
  return getReadingHistory().find((r) => r.id === id);
}

export function clearReadingHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function deleteReading(id: string): boolean {
  const history = getReadingHistory();
  const index = history.findIndex((r) => r.id === id);
  if (index === -1) return false;

  history.splice(index, 1);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  return true;
}