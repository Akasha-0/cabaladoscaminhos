import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateMoonPhase,
  calculateIllumination,
  getNextFullMoon,
  getNextNewMoon,
  getMoonPhaseForDate,
  getMoonPhases,
  getPhases,
  getMoonPhasesForRange,
  createPhaseEntry,
  getPhaseRecommendations,
  getMonthlyPhases,
} from '../../../src/lib/calendar/moon-phases';

describe('Moon Phases', () => {
  describe('calculateMoonPhase', () => {
    it('should return valid moon phase names', () => {
      const date = new Date('2024-01-15');
      const phase = calculateMoonPhase(date);
      const validPhases = [
        'new',
        'waxing_crescent',
        'first_quarter',
        'waxing_gibbous',
        'full',
        'waning_gibbous',
        'last_quarter',
        'waning_crescent',
      ];
      expect(validPhases).toContain(phase);
    });

    it('should return a string for any valid date', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
      ];
      dates.forEach((date) => {
        const phase = calculateMoonPhase(date);
        expect(typeof phase).toBe('string');
      });
    });
  });

  describe('calculateIllumination', () => {
    it('should return a number between 0 and 100', () => {
      const date = new Date('2024-01-15');
      const illumination = calculateIllumination(date);
      expect(illumination).toBeGreaterThanOrEqual(0);
      expect(illumination).toBeLessThanOrEqual(100);
    });

    it('should return a number', () => {
      const date = new Date();
      const illumination = calculateIllumination(date);
      expect(typeof illumination).toBe('number');
    });
  });

  describe('getNextFullMoon', () => {
    it('should return a Date', () => {
      const fromDate = new Date('2024-01-01');
      const nextFull = getNextFullMoon(fromDate);
      expect(nextFull).toBeInstanceOf(Date);
    });

    it('should return a date after the fromDate', () => {
      const fromDate = new Date('2024-01-01');
      const nextFull = getNextFullMoon(fromDate);
      expect(nextFull.getTime()).toBeGreaterThan(fromDate.getTime());
    });
  });

  describe('getNextNewMoon', () => {
    it('should return a Date', () => {
      const fromDate = new Date('2024-01-01');
      const nextNew = getNextNewMoon(fromDate);
      expect(nextNew).toBeInstanceOf(Date);
    });

    it('should return a date after the fromDate', () => {
      const fromDate = new Date('2024-01-01');
      const nextNew = getNextNewMoon(fromDate);
      expect(nextNew.getTime()).toBeGreaterThan(fromDate.getTime());
    });
  });

  describe('getMoonPhaseForDate', () => {
    it('should return moon phase data with required fields', () => {
      const date = new Date('2024-01-15');
      const data = getMoonPhaseForDate(date);
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('phase.name');
      expect(data).toHaveProperty('phase.illumination');
      expect(data).toHaveProperty('nextFullMoon');
      expect(data).toHaveProperty('nextNewMoon');
      expect(data).toHaveProperty('cycleDay');
    });

    it('should have illumination between 0 and 100 in phase', () => {
      const date = new Date('2024-01-15');
      const data = getMoonPhaseForDate(date);
      expect(data.phase.illumination).toBeGreaterThanOrEqual(0);
      expect(data.phase.illumination).toBeLessThanOrEqual(100);
    });
  });

  describe('getMoonPhases', () => {
    it('should return moon phase data', () => {
      const data = getMoonPhases();
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('phase.illumination');
    });

    it('should accept Date object', () => {
      const date = new Date('2024-01-15');
      const data = getMoonPhases(date);
      expect(data).toHaveProperty('phase');
    });

    it('should accept string date', () => {
      const data = getMoonPhases('2024-01-15');
      expect(data).toHaveProperty('phase');
    });
  });

  describe('getPhases', () => {
    it('should return moon phase data (alias for getMoonPhases)', () => {
      const data = getPhases();
      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('date');
    });
  });

  describe('getMoonPhasesForRange', () => {
    it('should return an array of moon phase data', () => {
      const startDate = new Date('2024-01-01');
      const data = getMoonPhasesForRange(startDate, 7);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(7);
    });

    it('should have correct number of entries', () => {
      const startDate = new Date('2024-01-01');
      const data = getMoonPhasesForRange(startDate, 30);
      expect(data.length).toBe(30);
    });

    it('should include phase with illumination in each entry', () => {
      const startDate = new Date('2024-01-01');
      const data = getMoonPhasesForRange(startDate, 5);
      data.forEach((entry) => {
        expect(entry).toHaveProperty('phase');
        expect(entry.phase).toHaveProperty('illumination');
      });
    });
  });

  describe('createPhaseEntry', () => {
    it('should return moon phase history entry', () => {
      const entry = createPhaseEntry();
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('phaseName');
      expect(entry).toHaveProperty('loggedAt');
    });

    it('should accept custom date', () => {
      const customDate = new Date('2024-06-15');
      const entry = createPhaseEntry(customDate);
      expect(entry.date).toBe('2024-06-15');
    });

    it('should have valid phaseName', () => {
      const entry = createPhaseEntry();
      const validPhases = [
        'new',
        'waxing_crescent',
        'first_quarter',
        'waxing_gibbous',
        'full',
        'waning_gibbous',
        'last_quarter',
        'waning_crescent',
      ];
      expect(validPhases).toContain(entry.phaseName);
    });
  });

  describe('getPhaseRecommendations', () => {
    it('should return recommendations object', () => {
      const recommendations = getPhaseRecommendations();
      expect(recommendations).toHaveProperty('recommended');
      expect(recommendations).toHaveProperty('avoided');
      expect(recommendations).toHaveProperty('affirmation');
    });

    it('should have arrays for recommended and avoided', () => {
      const recommendations = getPhaseRecommendations();
      expect(Array.isArray(recommendations.recommended)).toBe(true);
      expect(Array.isArray(recommendations.avoided)).toBe(true);
      expect(typeof recommendations.affirmation).toBe('string');
    });

    it('should accept Date parameter', () => {
      const date = new Date('2024-01-15');
      const recommendations = getPhaseRecommendations(date);
      expect(recommendations).toHaveProperty('recommended');
    });
  });

  describe('getMonthlyPhases', () => {
    it('should return array of moon phase data for month', () => {
      const phases = getMonthlyPhases(2024, 1);
      expect(Array.isArray(phases)).toBe(true);
      expect(phases.length).toBeGreaterThan(0);
    });

    it('should return phases for different months', () => {
      const jan = getMonthlyPhases(2024, 1);
      const jun = getMonthlyPhases(2024, 6);
      expect(jan.length).toBeGreaterThan(0);
      expect(jun.length).toBeGreaterThan(0);
    });
  });
});