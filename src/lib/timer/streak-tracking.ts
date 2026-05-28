/**
 * Streak tracking utilities
 */

const STREAK_KEY = 'streak_data';

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
}

function getStoredData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, lastCompletedDate: null };
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, lastCompletedDate: null };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { currentStreak: 0, lastCompletedDate: null };
  }
}

function saveData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function getStreak(): number {
  const data = getStoredData();
  if (!data.lastCompletedDate) return 0;

  const today = formatDate(new Date());
  const daysSinceLast = daysBetween(data.lastCompletedDate, today);

  // Streak continues if completed today or yesterday
  if (daysSinceLast === 0 || daysSinceLast === 1) {
    return data.currentStreak;
  }

  // Streak broken
  return 0;
}

export function recordDay(): number {
  const data = getStoredData();
  const today = formatDate(new Date());

  if (data.lastCompletedDate === today) {
    return data.currentStreak;
  }

  const daysSinceLast = data.lastCompletedDate
    ? daysBetween(data.lastCompletedDate, today)
    : 999;

  let newStreak: number;
  if (daysSinceLast <= 1) {
    newStreak = data.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    lastCompletedDate: today,
  };
  saveData(updated);
  return newStreak;
}