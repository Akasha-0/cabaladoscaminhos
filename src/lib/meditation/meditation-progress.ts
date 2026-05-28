/**
 * Meditation progress tracking utilities
 */

export interface ProgressEntry {
  date: string; // YYYY-MM-DD
  seconds: number;
  completed: boolean;
}

export interface ProgressData {
  entries: ProgressEntry[];
  totalSeconds: number;
  totalSessions: number;
  completedSessions: number;
}

// Simple in-memory progress store
const progressStore: Map<string, ProgressEntry> = new Map();

function dateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get aggregated progress data.
 */
export function getProgress(days: number = 30): ProgressData {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const entries: ProgressEntry[] = [];
  let totalSeconds = 0;
  let completedSessions = 0;

  for (const [key, entry] of progressStore) {
    const entryDate = new Date(key);
    if (entryDate >= cutoff) {
      entries.push(entry);
      totalSeconds += entry.seconds;
      if (entry.completed) completedSessions++;
    }
  }

  return {
    entries,
    totalSeconds,
    totalSessions: entries.length,
    completedSessions,
  };
}

/**
 * Add a progress entry for a session.
 */
export function addProgress(seconds: number, completed: boolean): void {
  const key = dateKey();
  const existing = progressStore.get(key);

  if (existing) {
    existing.seconds += seconds;
    existing.completed = existing.completed || completed;
  } else {
    progressStore.set(key, {
      date: key,
      seconds,
      completed,
    });
  }
}

/**
 * Clear all progress data (for testing).
 */
export function clearProgress(): void {
  progressStore.clear();
}