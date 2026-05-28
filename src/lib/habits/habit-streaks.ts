/**
 * Habit Streaks
 * Calculates and manages streak data for habit tracking
 */

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompletions: number;
}

export interface StreaksResult {
  success: boolean;
  streaks?: HabitStreak[];
  error?: string;
}

const STREAK_STORAGE_KEY = "habit_streaks";

function getStoredRecords(): Record<string, string[]> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveRecords(records: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function daysBetween(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isConsecutive(prev: string | null, current: string): boolean {
  if (!prev) return false;
  return daysBetween(prev, current) === 1;
}

function isSameDay(dateStr: string, today: string): boolean {
  return dateStr === today;
}

function calculateStreak(completedDates: string[]): {
  current: number;
  longest: number;
  lastCompleted: string | null;
  total: number;
} {
  if (completedDates.length === 0) {
    return { current: 0, longest: 0, lastCompleted: null, total: 0 };
  }

  const sorted = [...completedDates].sort().reverse();
  const lastCompleted = sorted[0];
  const today = getToday();
  const daysSinceLast = daysBetween(lastCompleted, today);

  // Sort chronologically for streak calculation
  const chronological = [...completedDates].sort();
  let longest = 1;
  let current = 0;

  // Calculate longest streak
  let streakCount = 1;
  for (let i = 1; i < chronological.length; i++) {
    const prev = chronological[i - 1];
    const curr = chronological[i];
    if (daysBetween(prev, curr) === 1) {
      streakCount++;
      if (streakCount > longest) {
        longest = streakCount;
      }
    } else {
      streakCount = 1;
    }
  }

  // Calculate current streak
  // Check if streak is still active (completed today or yesterday)
  if (daysSinceLast <= 1) {
    current = 1;
    // Count backwards from last completion
    for (let i = 1; i < chronological.length; i++) {
      const idx = sorted.length - i - 1;
      if (idx < 0) break;
      const prev = sorted[idx + 1];
      const curr = sorted[idx];
      if (daysBetween(curr, prev) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return {
    current,
    longest,
    lastCompleted,
    total: completedDates.length,
  };
}

/**
 * Get all habit streaks
 */
export function getStreaks(): StreaksResult {
  try {
    const records = getStoredRecords();
    const streaks: HabitStreak[] = [];

    for (const [habitId, completedDates] of Object.entries(records)) {
      const { current, longest, lastCompleted, total } = calculateStreak(completedDates);
      streaks.push({
        habitId,
        currentStreak: current,
        longestStreak: longest,
        lastCompletedDate: lastCompleted,
        totalCompletions: total,
      });
    }

    return { success: true, streaks };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Get streak for a specific habit
 */
export function getHabitStreak(habitId: string): HabitStreak {
  const records = getStoredRecords();
  const completedDates = records[habitId] || [];
  const { current, longest, lastCompleted, total } = calculateStreak(completedDates);

  return {
    habitId,
    currentStreak: current,
    longestStreak: longest,
    lastCompletedDate: lastCompleted,
    totalCompletions: total,
  };
}

/**
 * Record a habit completion
 */
export function recordHabitCompletion(habitId: string, date?: string): HabitStreak {
  const targetDate = date || getToday();
  const records = getStoredRecords();

  if (!records[habitId]) {
    records[habitId] = [];
  }

  // Add date if not already present
  if (!records[habitId].includes(targetDate)) {
    records[habitId].push(targetDate);
    saveRecords(records);
  }

  return getHabitStreak(habitId);
}

/**
 * Reset streak for a specific habit
 */
export function resetHabitStreak(habitId: string): void {
  const records = getStoredRecords();
  if (records[habitId]) {
    delete records[habitId];
    saveRecords(records);
  }
}
