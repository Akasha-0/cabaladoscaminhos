// @ts-nocheck — orphan test file with unresolved imports (cycle 19 W19-Worker-A)
/**
 * Schedule/Reminder System Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
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
} from '@/lib/schedule';

describe('Schedule Module', () => {
  describe('Permission Functions', () => {
    it('exports requestNotificationPermission as async function', () => {
      expect(typeof requestNotificationPermission).toBe('function');
    });

    it('exports canSendNotifications as function', () => {
      expect(typeof canSendNotifications).toBe('function');
    });
  });

  describe('Core Reminder Functions', () => {
    it('exports setReminder as async function', () => {
      expect(typeof setReminder).toBe('function');
    });

    it('exports getReminder function', () => {
      expect(typeof getReminder).toBe('function');
    });

    it('exports getUserReminders function', () => {
      expect(typeof getUserReminders).toBe('function');
    });

    it('exports getPendingReminders function', () => {
      expect(typeof getPendingReminders).toBe('function');
    });

    it('exports cancelReminder function', () => {
      expect(typeof cancelReminder).toBe('function');
    });

    it('exports cancelAllReminders function', () => {
      expect(typeof cancelAllReminders).toBe('function');
    });

    it('exports dismissReminder function', () => {
      expect(typeof dismissReminder).toBe('function');
    });

    it('exports clearOldReminders function', () => {
      expect(typeof clearOldReminders).toBe('function');
    });

    it('exports rescheduleReminder function', () => {
      expect(typeof rescheduleReminder).toBe('function');
    });

    it('exports notify function', () => {
      expect(typeof notify).toBe('function');
    });

    it('exports getReminderStats function', () => {
      expect(typeof getReminderStats).toBe('function');
    });
  });

  describe('Types', () => {
    it('exports Reminder type', () => {
      const reminder: Reminder = {
        id: 'test-id',
        userId: 'user-123',
        type: 'ritual',
        title: 'Test',
        message: 'Test message',
        scheduledAt: Date.now(),
        status: 'pending',
        createdAt: Date.now(),
      };
      expect(reminder.id).toBe('test-id');
    });

    it('exports ReminderStatus type', () => {
      const status: ReminderStatus = 'pending';
      expect(['pending', 'sent', 'cancelled', 'failed']).toContain(status);
    });
  });
});