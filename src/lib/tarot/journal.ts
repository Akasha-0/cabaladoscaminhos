// fallow-ignore-file unused-file
// Tarot Journal — save and retrieve past readings
// Skip linting and formatting

export interface JournalEntry {
  id: string;
  date: string;
  spread: string;
  cards: string[];
  interpretation: string;
  notes?: string;
}

const STORAGE_KEY = 'tarot_journal';

function loadEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistEntries(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveReading(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const record: JournalEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  const entries = loadEntries();
  entries.unshift(record);
  persistEntries(entries);
  return record;
}

export function getJournal(): JournalEntry[] {
  return loadEntries();
}