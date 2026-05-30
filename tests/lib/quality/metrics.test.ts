import { describe, it, expect } from 'vitest';
import {
  calculateGrade,
  getGradeColor,
  validateMetricValue,
  calculateScoreFromValue,
} from '@/lib/quality/metrics-framework';

describe('quality/metrics-framework', () => {
  describe('calculateGrade', () => {
    it('returns a valid grade string', () => {
      const grade = calculateGrade(0.5);
      expect(typeof grade).toBe('string');
      expect(grade.length).toBeGreaterThan(0);
    });

    it('returns consistent grade for same score', () => {
      expect(calculateGrade(0.5)).toBe(calculateGrade(0.5));
    });
  });

  describe('getGradeColor', () => {
    it('returns a color string', () => {
      const color = getGradeColor('A+');
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });

  describe('validateMetricValue', () => {
    it('validates gte operator', () => {
      expect(validateMetricValue(80, 70, 'gte')).toBe(true);
      expect(validateMetricValue(60, 70, 'gte')).toBe(false);
    });

    it('validates lte operator', () => {
      expect(validateMetricValue(60, 70, 'lte')).toBe(true);
      expect(validateMetricValue(80, 70, 'lte')).toBe(false);
    });

    it('validates eq operator', () => {
      expect(validateMetricValue(70, 70, 'eq')).toBe(true);
      expect(validateMetricValue(71, 70, 'eq')).toBe(false);
    });

    it('defaults to gte operator', () => {
      expect(validateMetricValue(80, 70)).toBe(true);
    });
  });

  describe('calculateScoreFromValue', () => {
    it('returns a number', () => {
      const score = calculateScoreFromValue(80, { critical: 90, high: 80, medium: 70, low: 60 });
      expect(typeof score).toBe('number');
    });

    it('returns value between 0 and 100', () => {
      const score = calculateScoreFromValue(80, { critical: 90, high: 80, medium: 70, low: 60 });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
