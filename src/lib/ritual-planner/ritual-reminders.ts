export type RitualReminder = {
  id: string;
  ritualId: string;
  title: string;
  message: string;
  scheduledAt: Date;
  notified: boolean;
};

const reminders = new Map<string, RitualReminder>();

export async function setReminder(params: {
  ritualId: string;
  title: string;
  message: string;
  scheduledAt: Date;
}): Promise<RitualReminder> {
  const id = `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const reminder: RitualReminder = {
    id,
    ritualId: params.ritualId,
    title: params.title,
    message: params.message,
    scheduledAt: params.scheduledAt,
    notified: false,
  };
  reminders.set(id, reminder);
  return reminder;
}

export function getReminder(id: string): RitualReminder | undefined {
  return reminders.get(id);
}

export function getRemindersByRitual(ritualId: string): RitualReminder[] {
  return Array.from(reminders.values()).filter((r) => r.ritualId === ritualId);
}

export function cancelReminder(id: string): boolean {
  return reminders.delete(id);
}

export function markNotified(id: string): void {
  const reminder = reminders.get(id);
  if (reminder) reminder.notified = true;
}

export function clearAllReminders(): void {
  reminders.clear();
}