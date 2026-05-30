import { describe, it, expect } from 'vitest';
import {
  getSephirotDay,
  getDaySephirot,
  getAllSephirotDays,
  SEPHIROT_DAY_MAPPINGS,
  type SephirotDayMapping
} from '../../../src/lib/correlation/sephirot-day';

describe('Sephirot-Day Correlation', () => {
  describe('SEPHIROT_DAY_MAPPINGS', () => {
    it('should be defined', () => {
      expect(SEPHIROT_DAY_MAPPINGS).toBeDefined();
    });

    it('should have all 10 sephiroth keys', () => {
      const sephiroth = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      sephiroth.forEach(s => {
        expect(SEPHIROT_DAY_MAPPINGS[s]).toBeDefined();
      });
    });

    it('should have day property for each sephirah', () => {
      Object.entries(SEPHIROT_DAY_MAPPINGS).forEach(([key, mapping]) => {
        expect(mapping).toHaveProperty('dia');
        expect(typeof mapping.dia).toBe('string');
      });
    });
  });

  describe('getSephirotDay', () => {
    it('should return day mapping for valid sephirah', () => {
      const result = getSephirotDay('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
    });

    it('should return null for invalid sephirah', () => {
      const result = getSephirotDay('invalid');
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const lower = getSephirotDay('kether');
      const upper = getSephirotDay('KETHER');
      expect(lower).toEqual(upper);
    });
  });

  describe('getDaySephirot', () => {
    it('should return sephirah for valid day', () => {
      const result = getDaySephirot('Domingo');
      expect(result).toBeDefined();
    });

    it('should return null for invalid day', () => {
      const result = getDaySephirot('invalid-day');
      expect(result).toBeNull();
    });
  });

  describe('getAllSephirotDays', () => {
    it('should return array of all mappings', () => {
      const result = getAllSephirotDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(10);
    });

    it('should have all required fields in each mapping', () => {
      const result = getAllSephirotDays();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('elemento');
      });
    });
  });

  describe('Element Correlations', () => {
    it('should have element mappings for all sephiroth', () => {
      const allMappings = getAllSephirotDays();
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      allMappings.forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });
});