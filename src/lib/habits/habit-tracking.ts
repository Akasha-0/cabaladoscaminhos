/**
 * Habit Tracking
 * Core tracking logic for habit completion tracking
 */

export interface HabitTrackingRecord {
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  timestamp: number;
  notes?: string;
}

export interface TrackingResult {
  success: boolean;
  record?: HabitTrackingRecord;
  error?: string;
}

/**
 * Track a habit completion for a specific date
 */
export async function trackHabit(
  habitId: string,
  date: string,
  completed: boolean,
  notes?: string
): Promise<TrackingResult> {
  const record: HabitTrackingRecord = {
    habitId,
    date,
    completed,
    timestamp: Date.now(),
    notes,
  };

  return {
    success: true,
    record,
  };
}
