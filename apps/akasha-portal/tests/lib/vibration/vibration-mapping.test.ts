import { describe, it, expect } from 'vitest';
import {
  getMapping,
  getByFrequency,
  getSolfeggioFrequencies,
  getByChakra,
  getByKeyword,
  getAllFrequencies,
} from '@/lib/vibration/vibration-mapping';

describe('vibration/vibration-mapping', () => {
  describe('getMapping', () => {
    it('returns all vibration mappings', () => {
      const mappings = getMapping();
      expect(mappings).toBeDefined();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('each mapping has required fields', () => {
      const mappings = getMapping();
      const mapping = mappings[0];
      expect(mapping).toHaveProperty('frequency');
      expect(mapping).toHaveProperty('name');
      expect(mapping).toHaveProperty('namePt');
      expect(mapping).toHaveProperty('healing');
      expect(mapping).toHaveProperty('healingPt');
      expect(mapping).toHaveProperty('affirmation');
      expect(mapping).toHaveProperty('affirmationPt');
      expect(mapping).toHaveProperty('keywords');
      expect(mapping).toHaveProperty('keywordsPt');
    });

    it('each mapping has numeric frequency', () => {
      const mappings = getMapping();
      for (const mapping of mappings) {
        expect(typeof mapping.frequency).toBe('number');
      }
    });
  });

  describe('getByFrequency', () => {
    it('returns mapping for known frequency', () => {
      const mapping = getByFrequency(396);
      expect(mapping).toBeDefined();
      expect(mapping?.frequency).toBe(396);
      expect(mapping?.name).toBe('Liberation');
    });

    it('returns undefined for unknown frequency', () => {
      const mapping = getByFrequency(9999);
      expect(mapping).toBeUndefined();
    });

    it('returns solfeggio flag when present', () => {
      const mapping = getByFrequency(396);
      expect(mapping?.solfeggio).toBe(true);
    });
  });

  describe('getSolfeggioFrequencies', () => {
    it('returns only solfeggio frequencies', () => {
      const solfeggioFreqs = getSolfeggioFrequencies();
      expect(solfeggioFreqs.length).toBeGreaterThan(0);
      for (const freq of solfeggioFreqs) {
        expect(freq.solfeggio).toBe(true);
      }
    });

    it('includes known solfeggio frequencies', () => {
      const solfeggioFreqs = getSolfeggioFrequencies();
      const frequencies = solfeggioFreqs.map((m) => m.frequency);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(528);
    });
  });
  describe('getByChakra', () => {
    it('returns mappings for known chakra', () => {
      const mappings = getByChakra('muladhara');
      expect(mappings).toBeDefined();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
    });
    it('each returned mapping has matching chakra', () => {
      const mappings = getByChakra('muladhara');
      for (const mapping of mappings) {
        expect(mapping.chakra).toBe('muladhara');
      }
    });
    it('returns empty array for unknown chakra', () => {
      const mappings = getByChakra('nonexistent-chakra');
      expect(mappings).toEqual([]);
    });
  });

  describe('getByKeyword', () => {
    it('returns mappings matching keyword', () => {
      const mappings = getByKeyword('healing');
      expect(mappings).toBeDefined();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('each returned mapping contains keyword in keywords array', () => {
      const mappings = getByKeyword('healing');
      for (const mapping of mappings) {
        const hasKeyword = mapping.keywords.some((k) =>
          k.toLowerCase().includes('healing')
        );
        expect(hasKeyword).toBe(true);
      }
    });

    it('returns empty array for unknown keyword', () => {
      const mappings = getByKeyword('xyznonexistent');
      expect(mappings).toEqual([]);
    });

    it('is case insensitive', () => {
      const mappingsLower = getByKeyword('healing');
      const mappingsUpper = getByKeyword('HEALING');
      expect(mappingsLower.length).toBe(mappingsUpper.length);
    });
  });

  describe('getAllFrequencies', () => {
    it('returns all unique frequencies', () => {
      const frequencies = getAllFrequencies();
      expect(frequencies).toBeDefined();
      expect(Array.isArray(frequencies)).toBe(true);
      expect(frequencies.length).toBeGreaterThan(0);
    });

    it('returns sorted frequencies in ascending order', () => {
      const frequencies = getAllFrequencies();
      for (let i = 1; i < frequencies.length; i++) {
        expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1]);
      }
    });

    it('contains no duplicates', () => {
      const frequencies = getAllFrequencies();
      const unique = new Set(frequencies);
      expect(unique.size).toBe(frequencies.length);
    });

    it('contains known frequencies', () => {
      const frequencies = getAllFrequencies();
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(174);
    });
  });
});
