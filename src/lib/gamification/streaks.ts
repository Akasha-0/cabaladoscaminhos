/**
 * Streak tracking for daily practice
 * Tracks consecutive days of user activity
 */

export interface Streak {
  current: number;
  longest: number;
  lastPracticeDate: string | null;
  totalDays: number;
}

export interface Milestone {
  days: number;
  label: string;
  achieved: boolean;
}

const MILESTONES: Milestone[] = [
  { days: 7, label: "1 Semana", achieved: false },
  { days: 14, label: "2 Semanas", achieved: false },
  { days: 21, label: "3 Semanas", achieved: false },
  { days: 30, label: "1 Mês", achieved: false },
  { days: 60, label: "2 Meses", achieved: false },
  { days: 90, label: "3 Meses", achieved: false },
  { days: 180, label: "6 Meses", achieved: false },
  { days: 365, label: "1 Ano", achieved: false },
];

const STREAK_STORAGE_KEY = "cabala_streak";

function getStoredStreak(): Streak {
  if (typeof window === "undefined") {
    return { current: 0, longest: 0, lastPracticeDate: null, totalDays: 0 };
  }
  const stored = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!stored) {
    return { current: 0, longest: 0, lastPracticeDate: null, totalDays: 0 };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { current: 0, longest: 0, lastPracticeDate: null, totalDays: 0 };
  }
}

function saveStreak(streak: Streak): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function isConsecutiveDay(lastDate: string | null, today: string): boolean {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const current = new Date(today);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isSameDay(dateStr: string, today: string): boolean {
  return dateStr === today;
}

/**
 * Track daily practice and update streak
 * Call this when user completes a daily activity
 */
export function trackStreak(): Streak {
  const today = getTodayString();
  const streak = getStoredStreak();

  // Already practiced today, no change needed
  if (streak.lastPracticeDate && isSameDay(streak.lastPracticeDate, today)) {
    return streak;
  }

  // Check if streak continues from yesterday
  if (isConsecutiveDay(streak.lastPracticeDate, today)) {
    streak.current += 1;
  } else if (!streak.lastPracticeDate || !isSameDay(streak.lastPracticeDate, today)) {
    // Start new streak if gap > 1 day or first time
    const lastDate = streak.lastPracticeDate;
    if (lastDate) {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffTime = current.getTime() - last.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        streak.current = 1;
      } else {
        streak.current += 1;
      }
    } else {
      streak.current = 1;
    }
  }

  // Update tracking
  streak.lastPracticeDate = today;
  streak.totalDays += 1;

  // Update longest if needed
  if (streak.current > streak.longest) {
    streak.longest = streak.current;
  }

  saveStreak(streak);
  return streak;
}

/**
 * Get current streak information
 */
export function getStreak(): Streak {
  return getStoredStreak();
}

/**
 * Get milestone progress
 */
export function getMilestones(): Milestone[] {
  const streak = getStreak();
  return MILESTONES.map((milestone) => ({
    ...milestone,
    achieved: streak.longest >= milestone.days,
  }));
}

/**
 * Reset streak (for testing or user request)
 */
export function resetStreak(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STREAK_STORAGE_KEY);
}