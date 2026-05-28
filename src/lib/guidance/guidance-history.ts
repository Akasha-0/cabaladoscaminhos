const STORAGE_KEY = 'cabala_guidance_history';

export interface GuidanceRecord {
  id: string;
  timestamp: number;
  input: string;
  response: string;
  archetype?: string;
}

export function saveGuidance(record: Omit<GuidanceRecord, 'id' | 'timestamp'>): GuidanceRecord {
  const history = getGuidanceHistory();
  const newRecord: GuidanceRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(newRecord);
  // Keep last 50 entries
  if (history.length > 50) history.splice(50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

export function getGuidanceHistory(): GuidanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearGuidanceHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
