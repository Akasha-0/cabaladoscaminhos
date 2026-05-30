import { describe, it, expect } from 'vitest';
import {
  getPatterns,
  getPattern,
  getPatternsByCategory,
  getPatternsBySeverity,
  analyzePatterns,
  calculateSeverityScore,
  type KarmaPattern
} from '@/lib/karma/karma-patterns';

describe('karma/karma-patterns', () => {
  describe('getPatterns', () => {
    it('returns an array of patterns', () => {
      const patterns = getPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('each pattern has required properties', () => {
      const patterns = getPatterns();
      patterns.forEach((p: KarmaPattern) => {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('category');
        expect(p).toHaveProperty('severity');
      });
    });
  });

  describe('getPattern', () => {
    it('returns a specific pattern by id', () => {
      const pattern = getPattern('repeated-mistakes');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('repeated-mistakes');
    });

    it('returns undefined for unknown pattern', () => {
      const pattern = getPattern('non-existent-pattern');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('filters patterns by category', () => {
      const patterns = getPatternsByCategory('relationship');
      expect(Array.isArray(patterns)).toBe(true);
      patterns.forEach((p) => expect(p.category).toBe('relationship'));
    });
  });

  describe('getPatternsBySeverity', () => {
    it('filters patterns by severity', () => {
      const patterns = getPatternsBySeverity('critical');
      expect(Array.isArray(patterns)).toBe(true);
      patterns.forEach((p) => expect(p.severity).toBe('critical'));
    });
  });

  describe('calculateSeverityScore', () => {
    it('calculates score based on pattern severities', () => {
      const patterns = getPatterns().slice(0, 3);
      const score = calculateSeverityScore(patterns);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});