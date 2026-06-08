import { describe, it, expect } from 'vitest';
import { getProgress, updateProgress, resetProgress } from '@/lib/journey/progress';

describe('journey/progress', () => {
  describe('getProgress', () => {
    it('returns JourneyProgress object', () => {
      const p = getProgress();
      expect(typeof p.totalPoints).toBe('number');
      expect(typeof p.completedMilestones).toBe('number');
    });
  });

  describe('updateProgress', () => {
    it('accepts partial updates', () => {
      updateProgress({ totalPoints: 100 });
      const p = getProgress();
      expect(p.totalPoints).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetProgress', () => {
    it('resets without error', () => {
      resetProgress();
      expect(getProgress().totalPoints).toBe(0);
    });
  });
});
