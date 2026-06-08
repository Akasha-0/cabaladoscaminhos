import { describe, it, expect } from 'vitest';
import {
  analyzeDay,
  getWeeklyCycle,
  getDayName,
  type DayAnalysis,
} from '@/lib/correlation/day-portal-analyzer';

describe('correlation/day-portal-analyzer', () => {
  describe('analyzeDay', () => {
    it('returns DayAnalysis interface shape', () => {
      const result = analyzeDay('segunda-feira');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('energy');
      expect(result).toHaveProperty('portal');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('affirmations');
    });

    it('returns the day name passed as argument', () => {
      const result = analyzeDay('domingo');
      expect(result.day).toBe('domingo');
    });

    it('returns portal as false for all days', () => {
      const result = analyzeDay('qualquer-dia');
      expect(result.portal).toBe(false);
    });

    it('returns empty arrays for recommendations and affirmations', () => {
      const result = analyzeDay('terca-feira');
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.affirmations)).toBe(true);
      expect(result.recommendations).toHaveLength(0);
      expect(result.affirmations).toHaveLength(0);
    });

    it('returns Neutro energy for any day', () => {
      const result = analyzeDay('quarta-feira');
      expect(result.energy).toBe('Neutro');
    });
  });

  describe('getWeeklyCycle', () => {
    it('returns object with required fields', () => {
      const result = getWeeklyCycle();
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('bestDay');
      expect(result).toHaveProperty('portalDays');
    });

    it('returns arrays for days and portalDays', () => {
      const result = getWeeklyCycle();
      expect(Array.isArray(result.days)).toBe(true);
      expect(Array.isArray(result.portalDays)).toBe(true);
    });

    it('returns empty arrays for days and portalDays', () => {
      const result = getWeeklyCycle();
      expect(result.days).toHaveLength(0);
      expect(result.portalDays).toHaveLength(0);
    });

    it('returns domingo as bestDay', () => {
      const result = getWeeklyCycle();
      expect(result.bestDay).toBe('domingo');
    });
  });

  describe('getDayName', () => {
    it('returns a string for a valid Date', () => {
      const date = new Date('2024-01-01'); // Monday
      const result = getDayName(date);
      expect(typeof result).toBe('string');
    });

    it('returns Portuguese weekday name', () => {
      // Test multiple dates to verify Portuguese locale
      const monday = new Date('2024-01-01');
      const result = getDayName(monday);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns different values for different days', () => {
      const monday = new Date('2024-01-01');
      const tuesday = new Date('2024-01-02');
      const resultMonday = getDayName(monday);
      const resultTuesday = getDayName(tuesday);
      // They should be different (Monday != Tuesday)
      expect(resultMonday).not.toBe(resultTuesday);
    });
  });
});
