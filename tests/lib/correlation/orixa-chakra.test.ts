/**
 * Orixá-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaChakra,
  getChakraOrixa,
  getAllOrixaChakras,
  getOrixasByChakra,
} from '@/lib/correlation/orixa-chakra';

describe('Orixá-Chakra Correlation', () => {
  describe('getOrixaChakra', () => {
    it('should return Oxalá mapping with Sahasrara (crown) chakra', () => {
      const result = getOrixaChakra('Oxalá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should return undefined for unknown orixa', () => {
      const result = getOrixaChakra('Invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('getChakraOrixa', () => {
    it('should return all chakra-to-orixá mappings', () => {
      const result = getChakraOrixa();
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should map Svadhisthana to Omolu', () => {
      const result = getChakraOrixa();
      expect(result['Svadhisthana']).toBe('Omolu');
    });

    it('should map Muladhara to Ogum', () => {
      const result = getChakraOrixa();
      expect(result['Muladhara']).toBe('Ogum');
    });
  });

  describe('getAllOrixaChakras', () => {
    it('should return all orixá-chakra mappings', () => {
      const result = getAllOrixaChakras();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not return modified array', () => {
      const result1 = getAllOrixaChakras();
      const result2 = getAllOrixaChakras();
      expect(result1).not.toBe(result2);
    });
  });

  describe('getOrixasByChakra', () => {
    it('should return Orixás by chakra name', () => {
      const result = getOrixasByChakra('Sahasrara');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
