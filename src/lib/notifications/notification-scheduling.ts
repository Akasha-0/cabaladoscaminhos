// ============================================================
// NOTIFICATION SCHEDULING - CABALA DOS CAMINHOS
// ============================================================
// Time-based notification scheduling
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// TYPES
// ============================================================

export interface ScheduledNotification {
  id: string;
  type: 'reminder' | 'alert' | 'reminder' | 'system';
  title: string;
  body?: string;
  scheduledAt: number; // Unix timestamp in ms
  createdAt: number;
  data?: Record<string, any>;
  dismissed?: boolean;
}

export interface ScheduleInput {
  title: string;
  body?: string;
  scheduledAt: number; // Unix timestamp in ms
  type?: ScheduledNotification['type'];
  data?: Record<string, any>;
}

// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = 'cabala_notification_schedules';

function getSchedules(): ScheduledNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSchedules(schedules: ScheduledNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

// ============================================================
// CORE SCHEDULING
// ============================================================

/**
 * Schedule a notification for a future time
 */
export function scheduleNotification(input: ScheduleInput): ScheduledNotification {
  const schedules = getSchedules();
  const now = Date.now();

  if (input.scheduledAt <= now) {
    throw new Error('scheduledAt must be in the future');
  }

  const notification: ScheduledNotification = {
    id: `notif_${now}_${Math.random().toString(36).slice(2, 9)}`,
    type: input.type ?? 'reminder',
    title: input.title,
    body: input.body,
    scheduledAt: input.scheduledAt,
    createdAt: now,
    data: input.data,
    dismissed: false,
  };

  schedules.push(notification);
  saveSchedules(schedules);

  return notification;
}

/**
 * Get all scheduled notifications
 */
export function getScheduled(): ScheduledNotification[] {
  return getSchedules().filter((n) => !n.dismissed);
}

/**
 * Get notifications that are due (scheduledAt <= now)
 */
export function getDue(): ScheduledNotification[] {
  const now = Date.now();
  return getSchedules().filter((n) => !n.dismissed && n.scheduledAt <= now);
}

/**
 * Cancel a scheduled notification by id
 */
export function cancelScheduled(id: string): boolean {
  const schedules = getSchedules();
  const index = schedules.findIndex((n) => n.id === id);
  if (index === -1) return false;
  schedules.splice(index, 1);
  saveSchedules(schedules);
  return true;
}

/**
 * Dismiss a notification (marks as read, keeps in storage)
 */
export function dismissNotification(id: string): boolean {
  const schedules = getSchedules();
  const notification = schedules.find((n) => n.id === id);
  if (!notification) return false;
  notification.dismissed = true;
  saveSchedules(schedules);
  return true;
}

/**
 * Clear old notifications older than maxAgeMs
 */
export function clearOldNotifications(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAgeMs;
  const schedules = getSchedules().filter((n) => n.createdAt >= cutoff || !n.dismissed);
  saveSchedules(schedules);
}
