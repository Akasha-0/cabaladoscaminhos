/**
 * Ritual Scheduling
 *
 * Time-based ritual planning and scheduling utilities.
 */

export interface ScheduledRitual {
  id: string;
  name: string;
  scheduledAt: Date;
  duration: number; // minutes
  completed: boolean;
}

export interface SchedulingOptions {
  preferEvening?: boolean;
  preferMorning?: boolean;
  allowOverlap?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface ScheduleResult {
  success: boolean;
  ritual?: ScheduledRitual;
  conflicts?: ScheduledRitual[];
  reason?: string;
}

/**
 * Schedule a ritual at a specific time.
 */
export function scheduleRitual(
  name: string,
  scheduledAt: Date,
  duration = 60,
  _options: SchedulingOptions = {}
): ScheduleResult {
  if (!name || name.trim() === '') {
    return { success: false, reason: 'Ritual name is required' };
  }

  if (isNaN(scheduledAt.getTime())) {
    return { success: false, reason: 'Invalid scheduled time' };
  }

  if (duration <= 0) {
    return { success: false, reason: 'Duration must be positive' };
  }

  const scheduled: ScheduledRitual = {
    id: `ritual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    scheduledAt,
    duration,
    completed: false,
  };

  return { success: true, ritual: scheduled };
}

/**
 * Find the next available slot for a ritual.
 */
export function findNextSlot(
  rituals: ScheduledRitual[],
  duration: number,
  preferredHour?: number
): Date | null {
  const now = new Date();
  const start = new Date(now);
  start.setSeconds(0, 0);

  if (preferredHour !== undefined) {
    start.setHours(preferredHour, 0, 0, 0);
    if (start <= now) {
      start.setDate(start.getDate() + 1);
    }
  }

  // Try next 30 days
  for (let day = 0; day < 30; day++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + day);

    const dayEnd = new Date(candidate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasConflict = rituals.some((r) => {
      const rEnd = new Date(r.scheduledAt);
      rEnd.setMinutes(rEnd.getMinutes() + r.duration);
      return candidate < rEnd && new Date(candidate.getTime() + duration * 60000) > r.scheduledAt;
    });

    if (!hasConflict) {
      return candidate;
    }
  }

  return null;
}

/**
 * Reschedule a ritual to a new time.
 */
export function rescheduleRitual(
  ritual: ScheduledRitual,
  newTime: Date
): ScheduledRitual {
  return { ...ritual, scheduledAt: newTime };
}

/**
 * Cancel a scheduled ritual.
 */
export function cancelRitual(rituals: ScheduledRitual[], ritualId: string): ScheduledRitual[] {
  return rituals.filter((r) => r.id !== ritualId);
}

/**
 * Mark a ritual as completed.
 */
export function completeRitual(ritual: ScheduledRitual): ScheduledRitual {
  return { ...ritual, completed: true };
}

/**
 * Get rituals for a specific day.
 */
export function getRitualsForDay(rituals: ScheduledRitual[], date: Date): ScheduledRitual[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return rituals.filter((r) => {
    const t = new Date(r.scheduledAt);
    return t >= start && t <= end;
  });
}

/**
 * Check if a time slot conflicts with existing rituals.
 */
export function hasConflict(
  rituals: ScheduledRitual[],
  scheduledAt: Date,
  duration: number
): boolean {
  const end = new Date(scheduledAt.getTime() + duration * 60000);

  return rituals.some((r) => {
    const rStart = new Date(r.scheduledAt);
    const rEnd = new Date(rStart.getTime() + r.duration * 60000);
    return scheduledAt < rEnd && end > rStart;
  });
}