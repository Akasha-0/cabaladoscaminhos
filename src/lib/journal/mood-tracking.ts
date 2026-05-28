'use client';

export interface MoodEntry {
  id: string;
  mood: number; // 1-5
  note?: string;
  timestamp: number;
}

const STORAGE_KEY = 'mood_entries';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MoodEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MoodEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

export function trackMood(mood: number, note?: string): MoodEntry {
  const entry: MoodEntry = {
    id: generateId(),
    mood: Math.min(5, Math.max(1, Math.round(mood))),
    note,
    timestamp: Date.now(),
  };
  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
  return entry;
}

export function getMoodHistory(): MoodEntry[] {
  return getEntries();
}
