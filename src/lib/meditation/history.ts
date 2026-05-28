'use client';

export interface HistoryEntry {
  id: string;
  sessionId: string;
  title: string;
  type: string;
  durationMinutes: number;
  completedAt: number;
}

const STORAGE_KEY = 'meditation_history';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getHistoryRaw(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function getHistory(): HistoryEntry[] {
  return getHistoryRaw();
}

export function addHistoryEntry(params: {
  sessionId: string;
  title: string;
  type: string;
  durationMinutes: number;
}): HistoryEntry {
  const history = getHistoryRaw();
  const entry: HistoryEntry = {
    id: generateId(),
    sessionId: params.sessionId,
    title: params.title,
    type: params.type,
    durationMinutes: params.durationMinutes,
    completedAt: Date.now(),
  };
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
