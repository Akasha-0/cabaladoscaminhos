import { describe, it, expect } from 'vitest';
import {
  getSephirotOrixa,
  getOrixaSephirot,
  getAllSephirotOrixas,
  SEPHIROT_ORIXA_MAPPINGS,
} from '@/lib/correlation/sephirot-orixa';

describe('sephirot-orixa', () => {
  describe('getSephirotOrixa', () => {
    it('returns mapping for valid sephirah', () => {
      const result = getSephirotOrixa('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
    });

    it('returns null for invalid sephirah', () => {
      const result = getSephirotOrixa('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getAllSephirotOrixas', () => {
    it('returns array of mappings', () => {
      const result = getAllSephirotOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
