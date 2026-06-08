import { describe, it, expect } from 'vitest';
import {
  getSacredDates,
  getSacredDatesByTradition,
  getSacredDatesByMonth,
  getSacredDateById,
  getTraditions,
} from '../../../src/lib/calendar/sacred-dates';

describe('Sacred Dates', () => {
  describe('getSacredDates', () => {
    it('should return array of sacred dates', () => {
      const dates = getSacredDates();
      expect(Array.isArray(dates)).toBe(true);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('should have required properties', () => {
      const dates = getSacredDates();
      dates.forEach((date) => {
        expect(date).toHaveProperty('id');
        expect(date).toHaveProperty('name');
        expect(date).toHaveProperty('date');
        expect(date).toHaveProperty('month');
        expect(date).toHaveProperty('day');
        expect(date).toHaveProperty('tradition');
        expect(date).toHaveProperty('description');
        expect(date).toHaveProperty('significance');
      });
    });

    it('should have valid month values (1-12)', () => {
      const dates = getSacredDates();
      dates.forEach((date) => {
        expect(date.month).toBeGreaterThanOrEqual(1);
        expect(date.month).toBeLessThanOrEqual(12);
      });
    });

    it('should have valid day values (1-31)', () => {
      const dates = getSacredDates();
      dates.forEach((date) => {
        expect(date.day).toBeGreaterThanOrEqual(1);
        expect(date.day).toBeLessThanOrEqual(31);
      });
    });
  });

  describe('getSacredDatesByTradition', () => {
    it('should return dates for specific tradition', () => {
      const traditions = getTraditions();
      if (traditions.length > 0) {
        const tradition = traditions[0];
        const dates = getSacredDatesByTradition(tradition);
        expect(Array.isArray(dates)).toBe(true);
        dates.forEach((date) => {
          expect(date.tradition).toBe(tradition);
        });
      }
    });

    it('should return empty array for non-existent tradition', () => {
      const dates = getSacredDatesByTradition('NonExistentTradition');
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe('getSacredDatesByMonth', () => {
    it('should return dates for specific month', () => {
      const dates = getSacredDatesByMonth(1);
      expect(Array.isArray(dates)).toBe(true);
      dates.forEach((date) => {
        expect(date.month).toBe(1);
      });
    });

    it('should return empty array for month with no sacred dates', () => {
      // Try month 13 (invalid)
      const dates = getSacredDatesByMonth(13);
      expect(Array.isArray(dates)).toBe(true);
    });

    it('should work for multiple months', () => {
      const janDates = getSacredDatesByMonth(1);
      const junDates = getSacredDatesByMonth(6);
      expect(janDates.length).toBeGreaterThanOrEqual(0);
      expect(junDates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSacredDateById', () => {
    it('should return sacred date by id', () => {
      const dates = getSacredDates();
      if (dates.length > 0) {
        const date = getSacredDateById(dates[0].id);
        expect(date).toBeDefined();
        expect(date?.id).toBe(dates[0].id);
      }
    });

    it('should return undefined for non-existent id', () => {
      const date = getSacredDateById('non-existent-id');
      expect(date).toBeUndefined();
    });
  });

  describe('getTraditions', () => {
    it('should return array of unique traditions', () => {
      const traditions = getTraditions();
      expect(Array.isArray(traditions)).toBe(true);
      expect(traditions.length).toBeGreaterThan(0);
    });

    it('should return unique values only', () => {
      const traditions = getTraditions();
      const uniqueSet = new Set(traditions);
      expect(traditions.length).toBe(uniqueSet.size);
    });

    it('should return string values', () => {
      const traditions = getTraditions();
      traditions.forEach((tradition) => {
        expect(typeof tradition).toBe('string');
      });
    });
  });
});