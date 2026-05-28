export interface RitualReminder {
  ritualId: string;
  title: string;
  scheduledAt: Date;
  repeatPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId: string;
  notified: boolean;
}

export interface SetReminderOptions {
  ritualId: string;
  title: string;
  scheduledAt: Date;
  repeatPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId: string;
}

const reminders = new Map<string, RitualReminder>();

export function setReminder(options: SetReminderOptions): RitualReminder {
  const reminder: RitualReminder = {
    ritualId: options.ritualId,
    title: options.title,
    scheduledAt: options.scheduledAt,
    repeatPattern: options.repeatPattern,
    userId: options.userId,
    notified: false,
  };
  reminders.set(options.ritualId, reminder);
  return reminder;
}

export function getReminder(ritualId: string): RitualReminder | undefined {
  return reminders.get(ritualId);
}

export function cancelReminder(ritualId: string): boolean {
  return reminders.delete(ritualId);
}

export function listReminders(userId: string): RitualReminder[] {
  return Array.from(reminders.values()).filter(r => r.userId === userId);
}

export function markNotified(ritualId: string): void {
  const reminder = reminders.get(ritualId);
  if (reminder) {
    reminder.notified = true;
  }
}
