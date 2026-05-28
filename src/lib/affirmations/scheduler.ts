 import type { Affirmation } from './categories';

export interface ScheduledAffirmation {
  affirmation: Affirmation;
  scheduledAt: Date;
  repeatInterval?: number; // minutes
}

const scheduled = new Map<string, ScheduledAffirmation>();

export function scheduleAffirmation(
  affirmation: Affirmation,
  scheduledAt: Date,
  repeatInterval?: number
): void {
  scheduled.set(affirmation.id, {
    affirmation,
    scheduledAt,
    repeatInterval,
  });
}

export function getScheduledAffirmations(): ScheduledAffirmation[] {
  return Array.from(scheduled.values());
}

export function cancelScheduledAffirmation(affirmationId: string): boolean {
  return scheduled.delete(affirmationId);
}

export function clearAllScheduled(): void {
  scheduled.clear();
}
