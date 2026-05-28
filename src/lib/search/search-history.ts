'use client';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 50;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function getHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;

  const history = getHistory();
  const filtered = history.filter((item) => item.query !== query);
  const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or unavailable
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(query: string): void {
  if (typeof window === 'undefined') return;

  const history = getHistory();
  const filtered = history.filter((item) => item.query !== query);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    // Storage unavailable
  }
}
