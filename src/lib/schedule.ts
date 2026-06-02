// fallow-ignore-file unused-file
/**
 * Schedule module - stub for reminder system
 * TODO: Implement reminder system when needed
 */

// Re-export types for future use
export type Reminder = {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
};

export type ReminderStatus = 'pending' | 'completed' | 'cancelled';
export type SetReminderInput = {
  title: string;
  description?: string;
  scheduledAt: Date;
};
export type NotificationOptions = {
  body?: string;
  icon?: string;
  badge?: string;
};

// Stub implementations
export const requestNotificationPermission = async (): Promise<boolean> => false;
export const canSendNotifications = (): boolean => false;
export const setReminder = async (input: SetReminderInput): Promise<Reminder | null> => null;
export const getReminder = async (id: string): Promise<Reminder | null> => null;
export const getUserReminders = async (userId: string): Promise<Reminder[]> => [];
export const getPendingReminders = async (): Promise<Reminder[]> => [];
export const cancelReminder = async (id: string): Promise<boolean> => false;
export const cancelAllReminders = async (userId: string): Promise<number> => 0;
export const dismissReminder = async (id: string): Promise<boolean> => false;
export const clearOldReminders = async (): Promise<number> => 0;
export const rescheduleReminder = async (id: string, newTime: Date): Promise<Reminder | null> => null;
export const notify = async (reminder: Reminder): Promise<void> => {};
export const getReminderStats = async (userId: string) => ({ total: 0, pending: 0, completed: 0 });