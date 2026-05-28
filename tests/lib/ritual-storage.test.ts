/**
 * Ritual Storage Unit Tests
 *
 * Tests for ritual completion storage, history, and statistics.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addRitualCompletion,
  getRitualHistory,
  getRitualStats,
  resetRitualStore,
} from '@/lib/ritual-storage';

describe('Ritual Storage', () => {
  beforeEach(() => {
    resetRitualStore();
  });

  // ============================================
  // addRitualCompletion Tests
  // ============================================

  describe('addRitualCompletion', () => {
    it('should add a ritual completion and return it', () => {
      const completion = addRitualCompletion(
        'user-1',
        'ritual-morning',
        new Date('2024-01-15'),
        30,
        'Felt great'
      );

      expect(completion).toEqual({
        userId: 'user-1',
        ritualId: 'ritual-morning',
        date: new Date('2024-01-15'),
        duration: 30,
        notes: 'Felt great',
      });
    });

    it('should add completion without notes', () => {
      const completion = addRitualCompletion(
        'user-1',
        'ritual-evening',
        new Date('2024-01-16'),
        45
      );

      expect(completion.notes).toBeUndefined();
      expect(completion.duration).toBe(45);
    });

    it('should allow multiple completions for same user', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-1', 'ritual-2', new Date('2024-01-16'), 25);
      addRitualCompletion('user-1', 'ritual-3', new Date('2024-01-17'), 30);

      const history = getRitualHistory('user-1');
      expect(history.length).toBe(3);
    });

    it('should allow same ritual multiple times', () => {
      addRitualCompletion('user-1', 'ritual-daily', new Date('2024-01-15'), 15);
      addRitualCompletion('user-1', 'ritual-daily', new Date('2024-01-16'), 15);

      const history = getRitualHistory('user-1');
      expect(history.length).toBe(2);
    });
  });

  // ============================================
  // getRitualHistory Tests
  // ============================================

  describe('getRitualHistory', () => {
    it('should return empty array for user with no completions', () => {
      const history = getRitualHistory('nonexistent-user');
      expect(history).toEqual([]);
    });

    it('should return completions sorted by date (newest first)', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-1', 'ritual-2', new Date('2024-01-20'), 25);
      addRitualCompletion('user-1', 'ritual-3', new Date('2024-01-18'), 30);

      const history = getRitualHistory('user-1');
      expect(history[0].ritualId).toBe('ritual-2');
      expect(history[1].ritualId).toBe('ritual-3');
      expect(history[2].ritualId).toBe('ritual-1');
    });

    it('should only return completions for specified user', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-2', 'ritual-2', new Date('2024-01-16'), 30);

      const user1History = getRitualHistory('user-1');
      expect(user1History.length).toBe(1);
      expect(user1History[0].ritualId).toBe('ritual-1');
    });
  });

  // ============================================
  // getRitualStats Tests
  // ============================================

  describe('getRitualStats', () => {
    it('should return zero stats for user with no completions', () => {
      const stats = getRitualStats('nonexistent-user');
      expect(stats.totalCompletions).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.completionRate).toBe(0);
    });

    it('should calculate total completions correctly', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-1', 'ritual-2', new Date('2024-01-16'), 30);
      addRitualCompletion('user-1', 'ritual-3', new Date('2024-01-17'), 40);

      const stats = getRitualStats('user-1');
      expect(stats.totalCompletions).toBe(3);
    });

    it('should calculate total duration correctly', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-1', 'ritual-2', new Date('2024-01-16'), 30);
      addRitualCompletion('user-1', 'ritual-3', new Date('2024-01-17'), 50);

      const stats = getRitualStats('user-1');
      expect(stats.totalDuration).toBe(100);
    });

    it('should calculate average duration correctly', () => {
      addRitualCompletion('user-1', 'ritual-1', new Date('2024-01-15'), 20);
      addRitualCompletion('user-1', 'ritual-2', new Date('2024-01-16'), 30);
      addRitualCompletion('user-1', 'ritual-3', new Date('2024-01-17'), 50);

      const stats = getRitualStats('user-1');
      expect(stats.averageDuration).toBe(33.3);
    });

    it('should return 0 average duration for user with no completions', () => {
      const stats = getRitualStats('nonexistent-user');
      expect(stats.averageDuration).toBe(0);
    });
  });

  // ============================================
  // Streak Calculation Tests
  // ============================================

  describe('Streak Calculation', () => {
    it('should return zero streak for user with no completions', () => {
      const stats = getRitualStats('nonexistent-user');
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });

    it('should calculate current streak for consecutive days', () => {
      const today = new Date();
      const d1 = new Date(today); d1.setDate(today.getDate() - 2);
      const d2 = new Date(today); d2.setDate(today.getDate() - 1);
      const d3 = new Date(today);
      addRitualCompletion('user-1', 'ritual-1', d1, 20);
      addRitualCompletion('user-1', 'ritual-2', d2, 20);
      addRitualCompletion('user-1', 'ritual-3', d3, 20);

      const stats = getRitualStats('user-1');
      expect(stats.currentStreak).toBe(3);
      expect(stats.longestStreak).toBe(3);
    });

    it('should break streak on gap', () => {
      const today = new Date();
      const d1 = new Date(today); d1.setDate(today.getDate() - 5);
      const d2 = new Date(today); d2.setDate(today.getDate() - 4);
      const d3 = new Date(today); d3.setDate(today.getDate() - 1);
      addRitualCompletion('user-1', 'ritual-1', d1, 20);
      addRitualCompletion('user-1', 'ritual-2', d2, 20);
      addRitualCompletion('user-1', 'ritual-3', d3, 20);

      const stats = getRitualStats('user-1');
      expect(stats.currentStreak).toBe(1);
      expect(stats.longestStreak).toBe(2);
    });

    it('should track longest streak separately from current', () => {
      const today = new Date();
      const d1 = new Date(today); d1.setDate(today.getDate() - 10);
      const d2 = new Date(today); d2.setDate(today.getDate() - 9);
      const d3 = new Date(today); d3.setDate(today.getDate() - 8);
      addRitualCompletion('user-1', 'ritual-1', d1, 20);
      addRitualCompletion('user-1', 'ritual-2', d2, 20);
      addRitualCompletion('user-1', 'ritual-3', d3, 20);
      const d4 = new Date(today); d4.setDate(today.getDate() - 1);
      addRitualCompletion('user-1', 'ritual-4', d4, 20);

      const stats = getRitualStats('user-1');
      expect(stats.longestStreak).toBe(3);
    });

    it('should handle single completion', () => {
      const today = new Date();
      addRitualCompletion('user-1', 'ritual-1', today, 20);

      const stats = getRitualStats('user-1');
      expect(stats.currentStreak).toBe(1);
      expect(stats.longestStreak).toBe(1);
    });

    it('should handle multiple completions on same day', () => {
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      addRitualCompletion('user-1', 'ritual-1', yesterday, 20);
      addRitualCompletion('user-1', 'ritual-2', yesterday, 30);
      addRitualCompletion('user-1', 'ritual-3', yesterday, 25);
      addRitualCompletion('user-1', 'ritual-4', today, 20);

      const stats = getRitualStats('user-1');
      expect(stats.longestStreak).toBe(2);
    });
  });

  // ============================================
  // Completion Rate Calculation Tests
  // ============================================

  describe('Completion Rate Calculation', () => {
    it('should return 0 for user with no completions', () => {
      const stats = getRitualStats('nonexistent-user');
      expect(stats.completionRate).toBe(0);
    });

    it('should calculate 100% for daily completions', () => {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - 6 + i);
        addRitualCompletion('user-1', `ritual-${i}`, d, 20);
      }

      const stats = getRitualStats('user-1');
      expect(stats.completionRate).toBe(100);
    });

    it('should calculate partial rate correctly', () => {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - 13 + i * 2);
        addRitualCompletion('user-1', `ritual-${i}`, d, 20);
      }

      const stats = getRitualStats('user-1');
      expect(stats.completionRate).toBeGreaterThan(50);
    });

    it('should handle single completion', () => {
      const today = new Date();
      addRitualCompletion('user-1', 'ritual-1', today, 20);

      const stats = getRitualStats('user-1');
      expect(stats.completionRate).toBe(100);
    });

    it('should handle multiple completions same day', () => {
      const today = new Date();
      const d1 = new Date(today); d1.setDate(today.getDate() - 2);
      const d2 = new Date(today); d2.setDate(today.getDate() - 1);
      addRitualCompletion('user-1', 'ritual-1', d1, 20);
      addRitualCompletion('user-1', 'ritual-2', d1, 30);
      addRitualCompletion('user-1', 'ritual-3', d2, 20);

      const stats = getRitualStats('user-1');
      expect(stats.completionRate).toBe(100);
    });

    it('should count unique days only for completion rate', () => {
      const today = new Date();
      const d1 = new Date(today); d1.setDate(today.getDate() - 4);
      const d2 = new Date(today); d2.setDate(today.getDate() - 2);
      const d3 = new Date(today); d3.setDate(today.getDate() - 0);
      addRitualCompletion('user-1', 'ritual-1', d1, 20);
      addRitualCompletion('user-1', 'ritual-2', d1, 20);
      addRitualCompletion('user-1', 'ritual-3', d2, 20);
      addRitualCompletion('user-1', 'ritual-4', d3, 20);

      const stats = getRitualStats('user-1');
      expect(stats.completionRate).toBe(60);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('should track multiple users independently', () => {
      for (let i = 0; i < 10; i++) {
        const d = new Date('2024-01-01');
        d.setDate(1 + i);
        addRitualCompletion('user-1', `ritual-${i}`, d, 20 + i);
      }
      addRitualCompletion('user-2', 'ritual-a', new Date('2024-01-15'), 30);
      addRitualCompletion('user-2', 'ritual-b', new Date('2024-01-16'), 45);

      const user1Stats = getRitualStats('user-1');
      const user2Stats = getRitualStats('user-2');

      expect(user1Stats.totalCompletions).toBe(10);
      expect(user2Stats.totalCompletions).toBe(2);
      expect(user1Stats.totalDuration).toBeGreaterThan(user2Stats.totalDuration);
    });

    it('should handle complete workflow: add, get history, get stats', () => {
      addRitualCompletion('user-1', 'morning-meditation', new Date('2024-01-15'), 15, 'Peaceful');
      addRitualCompletion('user-1', 'evening-reflection', new Date('2024-01-15'), 30, 'Reflective');
      addRitualCompletion('user-1', 'morning-meditation', new Date('2024-01-16'), 15);

      const history = getRitualHistory('user-1');
      expect(history.length).toBe(3);

      const stats = getRitualStats('user-1');
      expect(stats.totalCompletions).toBe(3);
      expect(stats.totalDuration).toBe(60);
      expect(stats.averageDuration).toBe(20);
    });

    it('should handle large number of completions efficiently', () => {
      for (let i = 0; i < 100; i++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + Math.floor(i / 5));
        addRitualCompletion('user-1', `ritual-${i}`, date, 20);
      }

      const stats = getRitualStats('user-1');
      expect(stats.totalCompletions).toBe(100);
      expect(stats.totalDuration).toBe(2000);
      expect(stats.averageDuration).toBe(20);
    });
  });
});