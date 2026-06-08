import { describe, it, expect } from 'vitest';
import { trackStreak, getStreak, getMilestones, resetStreak, type Streak } from '@/lib/gamification/streaks';

describe('gamification/streaks', () => {
  describe('trackStreak', () => {
    it('returns Streak object', () => {
      const streak = trackStreak();
      expect(streak.current).toBeGreaterThanOrEqual(0);
      expect(typeof streak.longest).toBe('number');
      expect(typeof streak.totalDays).toBe('number');
    });
  });

  describe('getStreak', () => {
    it('returns Streak object', () => {
      const streak = getStreak();
      expect(typeof streak.current).toBe('number');
    });
  });

  describe('getMilestones', () => {
    it('returns array of milestones', () => {
      const milestones = getMilestones();
      expect(milestones.length).toBeGreaterThan(0);
      for (const m of milestones) {
        expect(m.days).toBeGreaterThan(0);
        expect(m.label).toBeTruthy();
      }
    });
  });

  describe('resetStreak', () => {
    it('resets without error', () => {
      resetStreak();
      expect(getStreak().current).toBe(0);
    });
  });
});
