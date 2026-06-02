// Streak tracking with LocalStorage persistence

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalCompletions: number;
}

const STORAGE_KEY = 'streak_data';

function getStoredData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalCompletions: 0 };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalCompletions: 0 };
}

function saveData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function trackStreak(): StreakData {
  const data = getStoredData();
  const today = getToday();

  if (data.lastActivityDate === null) {
    data.currentStreak = 1;
    data.longestStreak = 1;
    data.lastActivityDate = today;
    data.totalCompletions = 1;
  } else if (data.lastActivityDate === today) {
    // Already tracked today, return current data
    return data;
  } else {
    const daysDiff = daysBetween(data.lastActivityDate, today);
    if (daysDiff === 1) {
      data.currentStreak += 1;
    } else {
      data.currentStreak = 1;
    }
    data.lastActivityDate = today;
    data.totalCompletions += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
  }

  saveData(data);
  return data;
}

export function getStreak(): StreakData {
  return getStoredData();
}

export function resetStreak(): void {
  saveData({ currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalCompletions: 0 });
}