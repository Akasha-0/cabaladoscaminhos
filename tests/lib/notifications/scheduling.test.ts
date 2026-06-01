import { describe, it, expect } from 'vitest';
import { scheduleNotification, getScheduled } from '@/lib/notifications/scheduling';
import type { ScheduledNotification, ScheduleInput } from '@/lib/notifications/scheduling';

describe('notifications/scheduling', () => {
  describe('scheduleNotification', () => {
    it('creates scheduled notification', () => {
      const input: ScheduleInput = {
        type: 'ritual',
        title: 'Test Notification',
        message: 'Test body',
        scheduledAt: Date.now() + 1000,
      };
      const result = scheduleNotification(input);
      expect(result.id).toBeTruthy();
    });
  });
  describe('getScheduled', () => {
    it('returns array', () => {
      const results = getScheduled();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
