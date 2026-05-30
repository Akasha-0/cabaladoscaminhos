import { describe, it, expect } from 'vitest';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';

describe('lenormand/mesa-real', () => {
  describe('MESA_REAL_SPREADS', () => {
    it('has 2 spread types', () => {
      expect(Object.keys(MESA_REAL_SPREADS).length).toBe(2);
    });

    it('includes 9x4 spread', () => {
      expect(MESA_REAL_SPREADS['9x4']).toBeTruthy();
    });

    it('includes 8x4+4 spread', () => {
      expect(MESA_REAL_SPREADS['8x4+4']).toBeTruthy();
    });
  });

  describe('realizarLeitura', () => {
    it('returns array', () => {
      const result = realizarLeitura('9x4');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
