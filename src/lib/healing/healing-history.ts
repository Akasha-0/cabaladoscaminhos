const STORAGE_KEY = 'healing-history';

export interface HealingRecord {
  id: string;
  timestamp: number;
  sessionId?: string;
  type?: string;
  notes?: string;
}

export function getHistory(): HealingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecord(record: Omit<HealingRecord, 'id' | 'timestamp'>): HealingRecord {
  const entry: HealingRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
