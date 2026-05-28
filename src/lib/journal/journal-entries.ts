'use client';

// Journal entries - skipped linting and formatting

export type JournalEntryStatus = 'draft' | 'published' | 'archived';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  status: JournalEntryStatus;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'journal_entries';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

export function createEntry(data: {
  title: string;
  content: string;
  type: string;
  tags?: string[];
}): JournalEntry {
  const now = Date.now();
  const entry: JournalEntry = {
    id: generateId(),
    title: data.title,
    content: data.content,
    type: data.type,
    tags: data.tags || [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  return entry;
}

export function updateEntry(
  id: string,
  data: Partial<Pick<JournalEntry, 'title' | 'content' | 'type' | 'tags' | 'status'>>
): JournalEntry | null {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  entries[index] = {
    ...entries[index],
    ...data,
    updatedAt: Date.now(),
  };
  saveEntries(entries);
  return entries[index];
}

export function deleteEntry(id: string): boolean {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return false;
  entries.splice(index, 1);
  saveEntries(entries);
  return true;
}

export function getEntryById(id: string): JournalEntry | null {
  const entries = getEntries();
  return entries.find((e) => e.id === id) || null;
}