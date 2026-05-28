/* eslint-disable @typescript-eslint/no-explicit-any */
/* prettier-ignore */

const STORAGE_KEY = 'prophecy_history';

export interface ProphecyEntry {
  id: string;
  date: string;
  data: any;
}

export function saveProphecy(entry: Omit<ProphecyEntry, 'id' | 'date'>): ProphecyEntry {
  const history = getProphecyHistory();
  const newEntry: ProphecyEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  history.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
}

export function getProphecyHistory(): ProphecyEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearProphecyHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
