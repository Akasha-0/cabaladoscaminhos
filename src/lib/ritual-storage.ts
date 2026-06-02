// fallow-ignore-file unused-file
// In-memory storage for ritual completions

export interface RitualCompletion {
  userId: string;
  ritualId: string;
  date: Date;
  duration: number; // minutes
  notes?: string;
}

interface RitualStats {
  totalCompletions: number;
  totalDuration: number;
  averageDuration: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

// In-memory store
const completions: RitualCompletion[] = [];

/**
 * Add a ritual completion record
 */
export function addRitualCompletion(
  userId: string,
  ritualId: string,
  date: Date,
  duration: number,
  notes?: string
): RitualCompletion {
  const completion: RitualCompletion = { userId, ritualId, date, duration, notes };
  completions.push(completion);
  return completion;
}

/**
 * Get ritual history for a user
 */
export function getRitualHistory(userId: string): RitualCompletion[] {
  return completions
    .filter(c => c.userId === userId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Get ritual statistics for a user
 */
export function getRitualStats(userId: string): RitualStats {
  const userCompletions = completions
    .filter(c => c.userId === userId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalCompletions = userCompletions.length;
  const totalDuration = userCompletions.reduce((sum, c) => sum + c.duration, 0);
  const averageDuration = totalCompletions > 0 ? totalDuration / totalCompletions : 0;

  // Calculate streak
  const { currentStreak, longestStreak } = calculateStreak(userCompletions);

  // Completion rate (based on daily practice assumption)
  const completionRate = calculateCompletionRate(userCompletions);

  return {
    totalCompletions,
    totalDuration,
    averageDuration: Math.round(averageDuration * 10) / 10,
    currentStreak,
    longestStreak,
    completionRate,
  };
}

function calculateStreak(sortedCompletions: RitualCompletion[]): { currentStreak: number; longestStreak: number } {
  if (sortedCompletions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique dates (day-level)
  const dates = new Set<string>();
  sortedCompletions.forEach(c => {
    const d = c.date;
    dates.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  });

  const uniqueDays = Array.from(dates)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if streak is still active (last completion was today or yesterday)
  const lastDate = uniqueDays[uniqueDays.length - 1];
  const lastDateNormalized = new Date(lastDate);
  lastDateNormalized.setHours(0, 0, 0, 0);

  const streakActive = lastDateNormalized.getTime() === today.getTime() ||
                       lastDateNormalized.getTime() === yesterday.getTime();

  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = uniqueDays[i].getTime() - uniqueDays[i - 1].getTime();
    const dayDiff = Math.round(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  currentStreak = streakActive ? streak : 0;

  return { currentStreak, longestStreak };
}

function calculateCompletionRate(completions: RitualCompletion[]): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;

  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const uniqueDates = new Set<string>();
  completions.forEach(c => {
    const d = c.date;
    uniqueDates.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  });

  return Math.round((uniqueDates.size / totalDays) * 100 * 10) / 10;
}

/**
 * Reset in-memory store (for testing)
 */
export function resetRitualStore(): void {
  completions.length = 0;
}
