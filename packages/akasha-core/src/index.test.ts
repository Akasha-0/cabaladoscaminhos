/**
 * @akasha/core - Test coverage for barrel exports
 * Tests correlation-map functions and practices-guardrails functions
 */

import { describe, it, expect } from 'vitest';
import {
  // correlation-map
  getIchingsByIfa,
  getIfasByIching,
  getSefirotByTrigram,
  getSefirotByIfa,
  getCorrelationStrength,
  findCorrelations,
  IFA_ODUS,
  SEFIRot,
  // practices-guardrails
  isSafePractice,
  validatePractice,
  type Practice,
} from './index';

describe('correlation-map exports', () => {
  describe('getIchingsByIfa', () => {
    it('returns hexagrams for a valid Ifa Odu', () => {
      const hexagrams = getIchingsByIfa('Ogbe');
      expect(Array.isArray(hexagrams)).toBe(true);
    });

    it('returns empty array for unknown Odu', () => {
      const hexagrams = getIchingsByIfa('UnknownOdu' as any);
      expect(hexagrams).toEqual([]);
    });

    it('handles all known IFA_ODUS without throwing', () => {
      IFA_ODUS.forEach(odu => {
        expect(() => getIchingsByIfa(odu)).not.toThrow();
      });
    });
  });

  describe('getIfasByIching', () => {
    it('returns odus for a valid hexagram number', () => {
      const odus = getIfasByIching(1);
      expect(Array.isArray(odus)).toBe(true);
    });

    it('returns empty array for unknown hexagram', () => {
      const odus = getIfasByIching(999);
      expect(odus).toEqual([]);
    });

    it('handles hexagram boundary 1-64 without throwing', () => {
      [1, 32, 64].forEach(hex => {
        expect(() => getIfasByIching(hex)).not.toThrow();
      });
    });
  });

  describe('getSefirotByTrigram', () => {
    it('returns sefirot for a valid trigram', () => {
      const sefirot = getSefirotByTrigram(1);
      expect(Array.isArray(sefirot)).toBe(true);
    });

    it('returns empty array for unknown trigram', () => {
      const sefirot = getSefirotByTrigram(99);
      expect(sefirot).toEqual([]);
    });
  });

  describe('getSefirotByIfa', () => {
    it('returns sefirot for a valid Odu', () => {
      const sefirot = getSefirotByIfa('Ogbe');
      expect(Array.isArray(sefirot)).toBe(true);
    });

    it('returns empty array for unknown Odu', () => {
      const sefirot = getSefirotByIfa('Unknown' as any);
      expect(sefirot).toEqual([]);
    });
  });

  describe('getCorrelationStrength', () => {
    it('returns strong for iching-ifa pair', () => {
      const strength = getCorrelationStrength('iching', 'ifa');
      expect(strength).toBe('strong');
    });

    it('returns medium for iching-cabala pair', () => {
      const strength = getCorrelationStrength('iching', 'cabala');
      expect(strength).toBe('medium');
    });

    it('returns weak for unrelated traditions', () => {
      const strength = getCorrelationStrength('astrology', 'chakra');
      expect(strength).toBe('weak');
    });

    it('is symmetric regardless of argument order', () => {
      expect(getCorrelationStrength('iching', 'ifa')).toBe(getCorrelationStrength('ifa', 'iching'));
      expect(getCorrelationStrength('cabala', 'astrology')).toBe(getCorrelationStrength('astrology', 'cabala'));
    });
  });

  describe('findCorrelations', () => {
    it('returns correlations for iching archetype', () => {
      const correlations = findCorrelations('iching', 1);
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('returns correlations for ifa archetype', () => {
      const correlations = findCorrelations('ifa', 'Ogbe');
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('returns empty array for unknown archetype in ifa tradition', () => {
      const correlations = findCorrelations('ifa', 'UnknownXyz' as any);
      expect(correlations).toEqual([]);
    });

    it('each correlation has required fields', () => {
      const correlations = findCorrelations('iching', 1);
      correlations.forEach(corr => {
        expect(corr).toHaveProperty('id');
        expect(corr).toHaveProperty('source');
        expect(corr).toHaveProperty('target');
        expect(corr).toHaveProperty('strength');
        expect(corr).toHaveProperty('description');
        expect(['strong', 'medium', 'weak']).toContain(corr.strength);
      });
    });
  });
});

describe('practices-guardrails exports', () => {
  const makePractice = (overrides: Partial<Practice> = {}): Practice => ({
    id: 'test-practice',
    name: 'Test Prática',
    tradition: 'iching',
    category: 'meditation',
    associations: {},
    lifeAreas: ['saude'],
    howTo: 'Faça a prática com atenção e respiração consciente.',
    frequency: 'Diário',
    isSafe: true,
    ...overrides,
  });

  describe('isSafePractice', () => {
    it('returns true for a safe practice', () => {
      const practice = makePractice({ isSafe: true });
      expect(isSafePractice(practice)).toBe(true);
    });

    it('returns false for an unsafe practice', () => {
      const practice = makePractice({ isSafe: false });
      expect(isSafePractice(practice)).toBe(false);
    });

    it('handles empty practice object gracefully', () => {
      const practice = { isSafe: true } as Practice;
      expect(() => isSafePractice(practice)).not.toThrow();
    });
  });

  describe('validatePractice', () => {
    it('returns isValid true for a well-formed safe practice', () => {
      const practice = makePractice();
      const result = validatePractice(practice);
      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('returns isValid false for an unsafe practice', () => {
      const practice = makePractice({ isSafe: false });
      const result = validatePractice(practice);
      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('flags practice with very short howTo as incomplete', () => {
      const practice = makePractice({ howTo: 'x' });
      const result = validatePractice(practice);
      expect(result.warnings.some(w => w.includes('incompletas'))).toBe(true);
    });

    it('flags practice with very short frequency', () => {
      const practice = makePractice({ frequency: 'a' });
      const result = validatePractice(practice);
      expect(result.warnings.some(w => w.includes('Frequência'))).toBe(true);
    });

    it('flags practice with prohibited terms in name', () => {
      const practice = makePractice({ name: 'Ritual de trabalho sexual' });
      const result = validatePractice(practice);
      expect(result.warnings.some(w => w.includes('problemática'))).toBe(true);
    });

    it('flags practice with prohibited terms in howTo', () => {
      const practice = makePractice({ howTo: 'Isso inclui cura de doenças e manipulação de terceiros' });
      const result = validatePractice(practice);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('accepts optional userCode parameter without throwing', () => {
      const practice = makePractice();
      expect(() => validatePractice(practice, 'OGBE-1')).not.toThrow();
    });

    it('returns non-empty recommendations for unsafe practice', () => {
      const practice = makePractice({ isSafe: false });
      const result = validatePractice(practice);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
