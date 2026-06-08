import { describe, it, expect } from 'vitest';
import { getChakraPoliedro, POLIEDRO_DATA } from '@/lib/correlation/chakra-poliedro';

describe('correlation/chakra-poliedro', () => {
  describe('getChakraPoliedro', () => {
    it('returns valid chakra data', () => {
      const result = getChakraPoliedro('Muladhara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
    });
    it('returns data for known chakra', () => {
      const result = getChakraPoliedro('Ajna');
      expect(result).toBeDefined();
    });
  });
  describe('POLIEDRO_DATA', () => {
    it('contains chakra data', () => {
      expect(Object.keys(POLIEDRO_DATA).length).toBeGreaterThan(0);
    });
  });
});
