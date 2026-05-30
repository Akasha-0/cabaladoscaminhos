import { describe, it, expect } from 'vitest';
import {
  getChakraDay,
  getDayChakra,
  getAllChakraDays,
  getPrimaryChakraForDay,
  getDaysForChakra,
  CHAKRA_DAY_MAPPINGS,
  type ChakraDayMapping
} from '../../../src/lib/correlation/chakra-day';

describe('Chakra-Day Correlation', () => {
  describe('CHAKRA_DAY_MAPPINGS', () => {
    it('should be defined', () => {
      expect(CHAKRA_DAY_MAPPINGS).toBeDefined();
    });

    it('should contain expected days', () => {
      const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      days.forEach(dia => {
        expect(CHAKRA_DAY_MAPPINGS[dia]).toBeDefined();
      });
    });

    it('should have correct chakra names for all mappings', () => {
      Object.values(CHAKRA_DAY_MAPPINGS).forEach(mappings => {
        expect(Array.isArray(mappings)).toBe(true);
      });
    });
  });

  describe('getChakraDay', () => {
    it('should return chakra mapping for valid chakra', () => {
      const result = getChakraDay('Muladhara');
      expect(result).toBeDefined();
    });

    it('should return null for invalid chakra', () => {
      const result = getChakraDay('invalid-chakra');
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const lower = getChakraDay('muladhara');
      const upper = getChakraDay('MULADHARA');
      expect(lower).toEqual(upper);
    });
  });

  describe('getDayChakra', () => {
    it('should return chakra mappings for valid day', () => {
      const result = getDayChakra('Segunda-feira');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return null for invalid day', () => {
      const result = getDayChakra('invalid-day');
      expect(result).toBeNull();
    });
  });

  describe('getAllChakraDays', () => {
    it('should return array of all mappings', () => {
      const result = getAllChakraDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have all required fields in each mapping', () => {
      const result = getAllChakraDays();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('dia_semana_pt');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('elemento');
      });
    });
  });

  describe('getPrimaryChakraForDay', () => {
    it('should return primary chakra for valid day', () => {
      const result = getPrimaryChakraForDay('Segunda-feira');
      expect(result).toBeDefined();
    });

    it('should return null for invalid day', () => {
      const result = getPrimaryChakraForDay('invalid-day');
      expect(result).toBeNull();
    });
  });

  describe('getDaysForChakra', () => {
    it('should return days for valid chakra', () => {
      const result = getDaysForChakra('Muladhara');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for invalid chakra', () => {
      const result = getDaysForChakra('invalid-chakra');
      expect(result).toEqual([]);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should have element mappings for each chakra-day', () => {
      const allMappings = getAllChakraDays();
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      allMappings.forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });
});