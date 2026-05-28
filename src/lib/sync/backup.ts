/**
 * Backup and restore utilities for user data.
 * Handles favorites, history, and reminders.
 */

export interface BackupData {
  version: number;
  timestamp: string;
  favorites: unknown[];
  history: unknown[]
  reminders: unknown[];
}

export async function backupData(): Promise<BackupData> {
  const [favorites, history, reminders] = await Promise.all([
    loadFavorites(),
    loadHistory(),
    loadReminders(),
  ]);

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    favorites,
    history,
    reminders,
  };
}

export async function restoreData(data: BackupData): Promise<void> {
  if (!data.version || !data.timestamp) {
    throw new Error('Invalid backup format');
  }

  await Promise.all([
    saveFavorites(data.favorites),
    saveHistory(data.history),
    saveReminders(data.reminders),
  ]);
}

async function loadFavorites(): Promise<unknown[]> {
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveFavorites(favorites: unknown[]): Promise<void> {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function loadHistory(): Promise<unknown[]> {
  try {
    const stored = localStorage.getItem('history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveHistory(history: unknown[]): Promise<void> {
  localStorage.setItem('history', JSON.stringify(history));
}

async function loadReminders(): Promise<unknown[]> {
  try {
    const stored = localStorage.getItem('reminders');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveReminders(reminders: unknown[]): Promise<void> {
  localStorage.setItem('reminders', JSON.stringify(reminders));
}