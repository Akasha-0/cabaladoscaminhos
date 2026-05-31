 
/* prettier-ignore */
 

// ============================================================
// REMINDER SYSTEM - CABALA DOS CAMINHOS
// ============================================================
// Reminder scheduling with browser notifications
// ============================================================

import type { ReminderType } from '../notifications/reminders';

// ============================================================
// TYPES
// ============================================================

export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  message: string;
  scheduledAt: number;
  status: ReminderStatus;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface SetReminderInput {
  userId: string;
  type: ReminderType;
  title: string;
  message: string;
  scheduledAt: number;
  metadata?: Record<string, any>;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

// ============================================================
// IN-MEMORY STORE
// ============================================================

const reminderStore = new Map<string, Reminder>();
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ============================================================
// NOTIFICATION HELPERS
// ============================================================

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * Check if notifications are available and permitted
 */
export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a browser notification
 */
function sendBrowserNotification(options: NotificationOptions): Notification | null {
  if (!canSendNotifications()) return null;

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon ?? '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? false,
      data: options.data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch {
    return null;
  }
}

// ============================================================
// REMINDER TRIGGER
// ============================================================

function triggerReminder(reminder: Reminder): void {
  // Send browser notification
  sendBrowserNotification({
    title: reminder.title,
    body: reminder.message,
    tag: `reminder-${reminder.id}`,
    requireInteraction: true,
    data: { reminderId: reminder.id },
  });

  // Dispatch custom event for in-app handling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cabala-reminder', {
        detail: reminder,
      })
    );
  }

  // Update status
  reminder.status = 'sent';
  reminderStore.set(reminder.id, reminder);
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Set a reminder with scheduled notification
 */
export async function setReminder(input: SetReminderInput): Promise<Reminder> {
  const id = `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const reminder: Reminder = {
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    scheduledAt: input.scheduledAt,
    status: 'pending',
    createdAt: Date.now(),
    metadata: input.metadata,
  };

  // Store reminder
  reminderStore.set(id, reminder);

  // Calculate delay until scheduled time
  const now = Date.now();
  const delay = input.scheduledAt - now;

  if (delay > 0) {
    // Schedule the reminder
    const timer = setTimeout(() => {
      const stored = reminderStore.get(id);
      if (stored && stored.status === 'pending') {
        triggerReminder(stored);
      }
      activeTimers.delete(id);
    }, delay);

    activeTimers.set(id, timer);
  } else {
    // Already past scheduled time, trigger immediately
    triggerReminder(reminder);
  }

  return reminder;
}

/**
 * Get a reminder by ID
 */
export function getReminder(id: string): Reminder | undefined {
  return reminderStore.get(id);
}

/**
 * Get all reminders for a user
 */
export function getUserReminders(userId: string): Reminder[] {
  return Array.from(reminderStore.values()).filter((r) => r.userId === userId);
}

/**
 * Get pending reminders for a user
 */
export function getPendingReminders(userId: string): Reminder[] {
  return getUserReminders(userId).filter((r) => r.status === 'pending');
}

/**
 * Cancel a scheduled reminder
 */
export function cancelReminder(id: string): boolean {
  const reminder = reminderStore.get(id);
  if (!reminder) return false;

  // Clear any active timer
  const timer = activeTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(id);
  }

  // Update status
  reminder.status = 'cancelled';
  reminderStore.set(id, reminder);

  return true;
}

/**
 * Cancel all reminders for a user
 */
export function cancelAllReminders(userId: string): number {
  const userReminders = getUserReminders(userId);
  let count = 0;

  for (const reminder of userReminders) {
    if (cancelReminder(reminder.id)) {
      count++;
    }
  }

  return count;
}

/**
 * Dismiss a sent notification (mark as read)
 */
export function dismissReminder(id: string): boolean {
  const reminder = reminderStore.get(id);
  if (!reminder) return false;

  reminder.status = 'sent';
  reminderStore.set(id, reminder);

  return true;
}

/**
 * Clear old reminders
 */
export function clearOldReminders(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
  const cutoff = Date.now() - maxAgeMs;
  let count = 0;

  for (const [id, reminder] of reminderStore.entries()) {
    if (reminder.createdAt < cutoff && reminder.status !== 'pending') {
      reminderStore.delete(id);
      count++;
    }
  }

  return count;
}

/**
 * Reschedule a reminder to a new time
 */
export function rescheduleReminder(
  id: string,
  newScheduledAt: number
): Reminder | null {
  const reminder = reminderStore.get(id);
  if (!reminder) return null;

  // Cancel existing timer
  const existingTimer = activeTimers.get(id);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTimers.delete(id);
  }

  // Update scheduled time
  reminder.scheduledAt = newScheduledAt;
  reminder.status = 'pending';
  reminderStore.set(id, reminder);

  // Calculate new delay
  const now = Date.now();
  const delay = newScheduledAt - now;

  if (delay > 0) {
    const timer = setTimeout(() => {
      const stored = reminderStore.get(id);
      if (stored && stored.status === 'pending') {
        triggerReminder(stored);
      }
      activeTimers.delete(id);
    }, delay);

    activeTimers.set(id, timer);
  } else {
    triggerReminder(reminder);
  }

  return reminder;
}

// ============================================================
// UTILITY EXPORTS
// ============================================================

export { sendBrowserNotification as notify };

export function getReminderStats(userId: string): {
  total: number;
  pending: number;
  sent: number;
  cancelled: number;
} {
  const reminders = getUserReminders(userId);
  return {
    total: reminders.length,
    pending: reminders.filter((r) => r.status === 'pending').length,
    sent: reminders.filter((r) => r.status === 'sent').length,
    cancelled: reminders.filter((r) => r.status === 'cancelled').length,
  };
}
