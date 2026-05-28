// Desire journaling with localStorage persistence

const STORAGE_KEY = 'cabala-desire-journal';

export interface DesireEntry {
  id: string;
  desire: string;
  affirmation: string;
  createdAt: string;
}

export interface DesireJournal {
  entries: DesireEntry[];
  updatedAt: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadJournal(): DesireJournal {
  if (typeof window === 'undefined') {
    return { entries: [], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { entries: [], updatedAt: new Date().toISOString() };
    }
    return JSON.parse(raw) as DesireJournal;
  } catch {
    return { entries: [], updatedAt: new Date().toISOString() };
  }
}

function saveJournal(journal: DesireJournal): void {
  if (typeof window === 'undefined') return;
  try {
    journal.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
  } catch {
    // storage full or unavailable
  }
}

export function journalDesire(desire: string, affirmation: string): DesireEntry {
  const journal = loadJournal();
  const entry: DesireEntry = {
    id: generateId(),
    desire: desire.trim(),
    affirmation: affirmation.trim(),
    createdAt: new Date().toISOString(),
  };
  journal.entries.unshift(entry);
  saveJournal(journal);
  return entry;
}

export function getDesireJournal(): DesireJournal {
  return loadJournal();
}

export function removeDesireEntry(id: string): boolean {
  const journal = loadJournal();
  const before = journal.entries.length;
  journal.entries = journal.entries.filter((e) => e.id !== id);
  if (journal.entries.length < before) {
    saveJournal(journal);
    return true;
  }
  return false;
}
