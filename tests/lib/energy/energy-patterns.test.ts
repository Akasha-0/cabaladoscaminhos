import { describe, it, expect } from 'vitest';
// @ts-ignore
import {
  getPatterns,
  getPatternById,
  getPatternsByCategory,
  getDayPattern,
  getLunarPattern,
  getElementPattern,
  type EnergyPattern,
} from '@/lib/energy/energy-patterns';

describe('energy-patterns module', () => {
  describe('getPatterns', () => {
    it('returns all patterns', () => {
      const patterns = getPatterns();
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('returns patterns with correct structure', () => {
      const patterns = getPatterns();
      patterns.forEach((pattern) => {
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('category');
        expect(pattern).toHaveProperty('intensity');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('correspondences');
        expect(pattern).toHaveProperty('recommendations');
      });
    });

    it('all patterns have valid category', () => {
      const patterns = getPatterns();
      const validCategories = ['day', 'week', 'month', 'lunar', 'elemental'];
      patterns.forEach((pattern) => {
        expect(validCategories).toContain(pattern.category);
      });
    });

    it('all patterns have intensity between 1 and 5', () => {
      const patterns = getPatterns();
      patterns.forEach((pattern) => {
        expect(pattern.intensity).toBeGreaterThanOrEqual(1);
        expect(pattern.intensity).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('getPatternById', () => {
    it('returns pattern for valid id', () => {
      const pattern = getPatternById('monday');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('monday');
      expect(pattern?.name).toBe('Segunda-feira');
    });

    it('returns pattern for sunday', () => {
      const pattern = getPatternById('sunday');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('sunday');
      expect(pattern?.name).toBe('Domingo');
    });

    it('returns pattern for lunar phases', () => {
      const newMoon = getPatternById('new-moon');
      expect(newMoon).toBeDefined();
      expect(newMoon?.category).toBe('lunar');

      const fullMoon = getPatternById('full-moon');
      expect(fullMoon).toBeDefined();
      expect(fullMoon?.category).toBe('lunar');
    });

    it('returns pattern for elemental patterns', () => {
      const fire = getPatternById('fire-element');
      expect(fire).toBeDefined();
      expect(fire?.category).toBe('elemental');

      const water = getPatternById('water-element');
      expect(water).toBeDefined();
      expect(water?.category).toBe('elemental');
    });

    it('returns undefined for unknown id', () => {
      const pattern = getPatternById('unknown-pattern');
      expect(pattern).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const pattern = getPatternById('');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns day patterns', () => {
      const patterns = getPatternsByCategory('day');
      expect(patterns.length).toBe(7);
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe('day');
      });
    });

    it('returns lunar patterns', () => {
      const patterns = getPatternsByCategory('lunar');
      expect(patterns.length).toBe(4);
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe('lunar');
      });
    });

    it('returns elemental patterns', () => {
      const patterns = getPatternsByCategory('elemental');
      expect(patterns.length).toBe(5);
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe('elemental');
      });
    });

    it('returns week pattern', () => {
      const patterns = getPatternsByCategory('week');
      expect(patterns.length).toBe(1);
      expect(patterns[0].id).toBe('weekly-cycle');
    });

    it('returns month pattern', () => {
      const patterns = getPatternsByCategory('month');
      expect(patterns.length).toBe(1);
      expect(patterns[0].id).toBe('monthly-cycle');
    });

    it('returns empty array for non-existent category', () => {
      const patterns = getPatternsByCategory('year' as EnergyPattern['category']);
      expect(patterns).toEqual([]);
    });
  });

  describe('getDayPattern', () => {
    it('returns a pattern', () => {
      const pattern = getDayPattern();
      expect(pattern).toBeDefined();
    });

    it('returns pattern with day category', () => {
      const pattern = getDayPattern();
      expect(pattern?.category).toBe('day');
    });

    it('returns pattern with valid day id', () => {
      const pattern = getDayPattern();
      const validDayIds = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      expect(validDayIds).toContain(pattern?.id);
    });
  });

  describe('getLunarPattern', () => {
    it('returns new moon pattern', () => {
      const pattern = getLunarPattern('new');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('new-moon');
      expect(pattern?.category).toBe('lunar');
    });

    it('returns waxing moon pattern', () => {
      const pattern = getLunarPattern('waxing');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('waxing-moon');
    });

    it('returns full moon pattern', () => {
      const pattern = getLunarPattern('full');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('full-moon');
    });

    it('returns waning moon pattern', () => {
      const pattern = getLunarPattern('waning');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('waning-moon');
    });
  });

  describe('getElementPattern', () => {
    it('returns fire element pattern', () => {
      const pattern = getElementPattern('fire');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('fire-element');
      expect(pattern?.category).toBe('elemental');
    });

    it('returns water element pattern', () => {
      const pattern = getElementPattern('water');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('water-element');
    });

    it('returns earth element pattern', () => {
      const pattern = getElementPattern('earth');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('earth-element');
    });

    it('returns air element pattern', () => {
      const pattern = getElementPattern('air');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('air-element');
    });

    it('returns ether element pattern', () => {
      const pattern = getElementPattern('ether');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('ether-element');
    });
  });

  describe('pattern correspondences', () => {
    it('monday pattern has correct correspondences', () => {
      const pattern = getPatternById('monday');
      expect(pattern?.correspondences.orixas).toContain('Omolu');
      expect(pattern?.correspondences.planetas).toContain('Lua');
      expect(pattern?.correspondences.cores).toContain('Vermelho');
    });

    it('full moon pattern has highest intensity', () => {
      const pattern = getPatternById('full-moon');
      expect(pattern?.intensity).toBe(5);
    });

    it('friday pattern is associated with Oxalá', () => {
      const pattern = getPatternById('friday');
      expect(pattern?.correspondences.orixas).toContain('Oxalá');
    });
  });

  describe('pattern recommendations', () => {
    it('all patterns have action recommendation', () => {
      const patterns = getPatterns();
      patterns.forEach((pattern) => {
        expect(pattern.recommendations.action).toBeDefined();
        expect(pattern.recommendations.action.length).toBeGreaterThan(0);
      });
    });

    it('day patterns have evitar recommendations', () => {
      const patterns = getPatternsByCategory('day');
      patterns.forEach((pattern) => {
        expect(pattern.recommendations.evitar).toBeDefined();
        expect(Array.isArray(pattern.recommendations.evitar)).toBe(true);
      });
    });
  });
});
