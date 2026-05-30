/**
 * Schedule module - re-exports from schedule/reminder-system
 */
export {
  requestNotificationPermission,
  canSendNotifications,
  setReminder,
  getReminder,
  getUserReminders,
  getPendingReminders,
  cancelReminder,
  cancelAllReminders,
  dismissReminder,
  clearOldReminders,
  rescheduleReminder,
  notify,
  getReminderStats,
  type Reminder,
  type ReminderStatus,
  type SetReminderInput,
  type NotificationOptions,
} from './schedule/reminder-system';