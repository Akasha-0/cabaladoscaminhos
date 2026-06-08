import { describe, it, expect } from 'vitest';
import {
  getPatterns,
  getPatternById,
  getPatternsByCategory,
  getDayPattern,
  getLunarPattern,
  getElementPattern,
} from '@/lib/energy/patterns';

describe('Energy Patterns', () => {
  describe('getPatterns', () => {
    it('returns all patterns and count is greater than 0', () => {
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

        expect(typeof pattern.id).toBe('string');
        expect(typeof pattern.name).toBe('string');
        expect(pattern.category).toMatch(/^(day|week|month|lunar|elemental)$/);
        expect(pattern.intensity).toBeGreaterThanOrEqual(1);
        expect(pattern.intensity).toBeLessThanOrEqual(5);
        expect(typeof pattern.description).toBe('string');
        expect(pattern.recommendations).toHaveProperty('action');
      });
    });
  });

  describe('getPatternById', () => {
    it('returns pattern for valid id monday', () => {
      const pattern = getPatternById('monday');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('monday');
      expect(pattern?.name).toBe('Segunda-feira');
    });

    it('returns pattern for valid id sunday', () => {
      const pattern = getPatternById('sunday');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('sunday');
      expect(pattern?.name).toBe('Domingo');
    });

    it('returns undefined for unknown id', () => {
      const pattern = getPatternById('nonexistent-pattern');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns patterns for day category', () => {
      const patterns = getPatternsByCategory('day');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((p) => expect(p.category).toBe('day'));
    });

    it('returns patterns for lunar category', () => {
      const patterns = getPatternsByCategory('lunar');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((p) => expect(p.category).toBe('lunar'));
    });

    it('returns patterns for elemental category', () => {
      const patterns = getPatternsByCategory('elemental');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((p) => expect(p.category).toBe('elemental'));
    });

    it('returns empty array for unknown category', () => {
      const patterns = getPatternsByCategory('unknown-category' as 'day');
      expect(patterns).toEqual([]);
    });
  });

  describe('getDayPattern', () => {
    it('returns a pattern based on current day of week', () => {
      const pattern = getDayPattern();
      expect(pattern).toBeDefined();
      expect(pattern?.category).toBe('day');
      expect(pattern?.id).toMatch(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
    });
  });

  describe('getLunarPattern', () => {
    it('returns pattern for new phase', () => {
      const pattern = getLunarPattern('new');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('new-moon');
    });

    it('returns pattern for waxing phase', () => {
      const pattern = getLunarPattern('waxing');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('waxing-moon');
    });

    it('returns pattern for full phase', () => {
      const pattern = getLunarPattern('full');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('full-moon');
    });

    it('returns pattern for waning phase', () => {
      const pattern = getLunarPattern('waning');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('waning-moon');
    });

    it('returns undefined for invalid phase', () => {
      const pattern = getLunarPattern('invalid' as 'new');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getElementPattern', () => {
    it('returns pattern for fire element', () => {
      const pattern = getElementPattern('fire');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('fire-element');
    });

    it('returns pattern for water element', () => {
      const pattern = getElementPattern('water');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('water-element');
    });

    it('returns pattern for earth element', () => {
      const pattern = getElementPattern('earth');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('earth-element');
    });

    it('returns pattern for air element', () => {
      const pattern = getElementPattern('air');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('air-element');
    });

    it('returns pattern for ether element', () => {
      const pattern = getElementPattern('ether');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('ether-element');
    });

    it('returns undefined for invalid element', () => {
      const pattern = getElementPattern('invalid' as 'fire');
      expect(pattern).toBeUndefined();
    });
  });

  describe('Pattern data integrity', () => {
    it('all patterns have valid correspondences', () => {
      const patterns = getPatterns();

      patterns.forEach((pattern) => {
        const { correspondences } = pattern;

        // At least one correspondence array should exist
        const hasCorrespondences =
          (correspondences.chakras && correspondences.chakras.length > 0) ||
          (correspondences.orixas && correspondences.orixas.length > 0) ||
          (correspondences.planets && correspondences.planets.length > 0) ||
          (correspondences.sephiroth && correspondences.sephiroth.length > 0) ||
          (correspondences.elements && correspondences.elements.length > 0) ||
          (correspondences.colors && correspondences.colors.length > 0);

        expect(hasCorrespondences).toBe(true);
      });
    });

    it('all patterns have valid recommendations with action string', () => {
      const patterns = getPatterns();

      patterns.forEach((pattern) => {
        expect(pattern.recommendations).toBeDefined();
        expect(typeof pattern.recommendations.action).toBe('string');
        expect(pattern.recommendations.action.length).toBeGreaterThan(0);
      });
    });
  });
});