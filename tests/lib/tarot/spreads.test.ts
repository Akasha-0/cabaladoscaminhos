import { describe, it, expect } from 'vitest';
import { getSpread, getAllSpreadTypes } from '@/lib/tarot/spreads';

describe('tarot/spreads', () => {
  describe('getAllSpreadTypes', () => {
    it('returns all spread types', () => {
      const types = getAllSpreadTypes();
      expect(types).toContain('celtic-cross');
      expect(types).toContain('three-card');
      expect(types).toContain('single-card');
    });
  });

  describe('Celtic Cross (10 positions', () => {
    const s = getSpread('celtic-cross');
    it('has 10 positions', () => expect(s.positions).toHaveLength(10));
    it('each position has name/description/orientation', () => {
      for (const p of s.positions) {
        expect(typeof p.name).toBe('string');
        expect(typeof p.description).toBe('string');
        expect(['upright', 'reversed', 'both']).toContain(p.orientation);
      }
    });
    it('totalCards is 10', () => expect(s.totalCards).toBe(10));
  });

  describe('Three Card spread', () => {
    const s = getSpread('three-card');
    it('has 3 positions', () => expect(s.positions).toHaveLength(3));
  });

  describe('Single Card spread', () => {
    const s = getSpread('single-card');
    it('has 1 position', () => expect(s.positions).toHaveLength(1));
  });
});
