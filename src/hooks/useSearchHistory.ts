// fallow-ignore-file unused-file
"use client";

/**
 * Search history hook
 * Manages recent search queries with localStorage persistence
 */
export function useSearchHistory() {
  const STORAGE_KEY = "search-history";
  const MAX_ITEMS = 20;

  const getHistory = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveHistory = (history: string[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage full or unavailable
    }
  };

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const history = getHistory().filter((item) => item !== trimmed);
    const updated = [trimmed, ...history].slice(0, MAX_ITEMS);
    saveHistory(updated);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const removeSearch = (query: string) => {
    const history = getHistory().filter((item) => item !== query);
    saveHistory(history);
  };

  return {
    history: getHistory(),
    addSearch,
    clearHistory,
    removeSearch,
  };
}
