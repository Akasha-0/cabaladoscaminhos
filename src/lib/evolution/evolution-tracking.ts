const STORAGE_KEY = 'evolution_tracking';

export interface EvolutionEntry {
  timestamp: number;
  label: string;
  value: number;
}

export interface EvolutionData {
  entries: EvolutionEntry[];
}

function loadFromStorage(): EvolutionData {
  if (typeof window === 'undefined') return { entries: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function saveToStorage(data: EvolutionData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function trackProgress(label: string, value: number): EvolutionEntry {
  const data = loadFromStorage();
  const entry: EvolutionEntry = {
    timestamp: Date.now(),
    label,
    value,
  };
  data.entries.push(entry);
  saveToStorage(data);
  return entry;
}

export function getEvolutionEntries(): EvolutionEntry[] {
  return loadFromStorage().entries;
}

export function clearEvolution(): void {
  saveToStorage({ entries: [] });
}
