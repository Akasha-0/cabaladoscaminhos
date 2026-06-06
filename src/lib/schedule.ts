/**
/**
 * Schedule/Reminder Module
 * @module schedule
 *
 * Notification scheduling stubs for tests and lightweight deployments.
 * Replace with push service integration for production.
 */

export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed'

export interface Reminder {
  id: string
  userId: string
  type: string
  title: string
  message: string
  scheduledAt: number
  status: ReminderStatus
  createdAt: number
}

export type SetReminderInput = Omit<Reminder, 'id' | 'status' | 'createdAt'>

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return 'default'
}

export function canSendNotifications(): boolean {
  return false
}

export function setReminder(_input: SetReminderInput): Promise<Reminder> {
  return Promise.resolve({ ..._input, id: crypto.randomUUID(), status: 'pending', createdAt: Date.now() })
}

export function getReminder(_id: string): Reminder | undefined {
  return undefined
}

export function getUserReminders(_userId: string): Reminder[] {
  return []
}

export function getPendingReminders(): Reminder[] {
  return []
}

export function cancelReminder(_id: string): boolean {
  return false
}

export function cancelAllReminders(_userId: string): number {
  return 0
}

export function dismissReminder(_id: string): boolean {
  return false
}

export function clearOldReminders(_olderThan: Date): number {
  return 0
}

export function rescheduleReminder(_id: string, _newAt: Date): boolean {
  return false
}

export function notify(_userId: string, _title: string, _body: string): void {
  // no-op
}

export function getReminderStats(_userId: string) {
  return { total: 0, pending: 0, sent: 0 }
}
