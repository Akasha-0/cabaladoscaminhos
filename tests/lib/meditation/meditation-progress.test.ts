import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProgress,
  addProgress,
  clearProgress,
  type ProgressData,
} from '@/lib/meditation/meditation-progress';

describe('meditation-progress', () => {
  beforeEach(() => {
    clearProgress();
  });

  describe('addProgress', () => {
    it('adds a progress entry', () => {
      addProgress(600, true);
      const result = getProgress(1);
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].seconds).toBe(600);
      expect(result.entries[0].completed).toBe(true);
    });

    it('accumulates seconds on same day', () => {
      addProgress(300, false);
      addProgress(400, true);
      const result = getProgress(1);
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].seconds).toBe(700);
      expect(result.entries[0].completed).toBe(true);
    });

    it('marks completed as true if any session completed', () => {
      addProgress(100, false);
      addProgress(200, false);
      addProgress(300, true);
      const result = getProgress(1);
      expect(result.entries[0].completed).toBe(true);
    });
  });

  describe('getProgress', () => {
    it('returns empty data when no entries', () => {
      const result = getProgress(30);
      expect(result.entries).toEqual([]);
      expect(result.totalSeconds).toBe(0);
      expect(result.totalSessions).toBe(0);
      expect(result.completedSessions).toBe(0);
    });

    it('calculates total seconds correctly', () => {
      addProgress(300, true);
      addProgress(600, false);
      const result = getProgress(1);
      expect(result.totalSeconds).toBe(900);
    });

    it('counts completed sessions', () => {
      addProgress(100, true);
      addProgress(200, false);
      addProgress(300, true);
      const result = getProgress(1);
      expect(result.completedSessions).toBe(2);
      expect(result.totalSessions).toBe(3);
    });

    it('respects days cutoff', () => {
      // Add entry for today (simulated)
      addProgress(100, true);
      // getProgress with 0 days should still return current day
      const result = getProgress(0);
      // Should return current day entry
      expect(result.entries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('clearProgress', () => {
    it('clears all progress data', () => {
      addProgress(500, true);
      clearProgress();
      const result = getProgress(1);
      expect(result.entries).toEqual([]);
      expect(result.totalSeconds).toBe(0);
    });
  });

  describe('dateKey', () => {
    it('includes date in YYYY-MM-DD format', () => {
      addProgress(100, true);
      const result = getProgress(1);
      const today = new Date().toISOString().split('T')[0];
      expect(result.entries[0].date).toBe(today);
    });
  });
});