/**
 * Practice Reminders Module
 * Handles notification scheduling and reminders for daily practice
 */

export interface ReminderOptions {
  title: string;
  body: string;
  time: Date;
  repeat?: 'daily' | 'weekly' | 'monthly';
  sound?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  repeat?: 'daily' | 'weekly' | 'monthly';
  sound?: boolean;
  active: boolean;
}

const activeReminders: Map<string, Reminder> = new Map();

/**
 * Set a practice reminder
 */
export async function setReminder(options: ReminderOptions): Promise<string> {
  const id = `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  const reminder: Reminder = {
    id,
    title: options.title,
    body: options.body,
    scheduledTime: options.time,
    repeat: options.repeat,
    sound: options.sound ?? true,
    active: true,
  };

  activeReminders.set(id, reminder);

  // Schedule browser notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    scheduleNotification(reminder);
  }

  return id;
}

/**
 * Schedule a browser notification for the reminder
 */
function scheduleNotification(reminder: Reminder): void {
  const now = Date.now();
  const scheduledMs = reminder.scheduledTime.getTime();
  const delay = scheduledMs - now;

  if (delay > 0) {
    setTimeout(() => {
      if (reminder.active) {
        const notification = new Notification(reminder.title, {
          body: reminder.body,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: reminder.id,
          requireInteraction: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Handle repeat
        if (reminder.repeat) {
          scheduleNextRepeat(reminder);
        }
      }
    }, delay);
  }
}

/**
 * Schedule the next occurrence for repeating reminders
 */
function scheduleNextRepeat(reminder: Reminder): void {
  if (!reminder.repeat || !reminder.active) return;

  const now = new Date();
  const nextTime = new Date(reminder.scheduledTime);

  switch (reminder.repeat) {
    case 'daily':
      nextTime.setDate(nextTime.getDate() + 1);
      break;
    case 'weekly':
      nextTime.setDate(nextTime.getDate() + 7);
      break;
    case 'monthly':
      nextTime.setMonth(nextTime.getMonth() + 1);
      break;
  }

  if (nextTime > now) {
    reminder.scheduledTime = nextTime;
    scheduleNotification(reminder);
  }
}

/**
 * Cancel a reminder by ID
 */
export function cancelReminder(id: string): boolean {
  const reminder = activeReminders.get(id);
  if (reminder) {
    reminder.active = false;
    activeReminders.delete(id);
    return true;
  }
  return false;
}

/**
 * Get all active reminders
 */
export function getReminders(): Reminder[] {
  return Array.from(activeReminders.values()).filter(r => r.active);
}

/**
 * Clear all reminders
 */
export function clearAllReminders(): void {
  activeReminders.clear();
}

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied' as NotificationPermission;
  }
  return Notification.requestPermission();
}