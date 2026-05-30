import { describe, it, expect } from 'vitest';
import { getMeanings, getMeaning, getMasterNumbers, getCoreNumbers, getAllNumbers } from '@/lib/numerologia/number-meanings';

describe('numerologia/number-meanings', () => {
  describe('getMeanings', () => {
    it('returns all number meanings', () => {
      const meanings = getMeanings();
      expect(Object.keys(meanings).length).toBeGreaterThan(0);
    });

    it('each meaning has required fields', () => {
      const meanings = getMeanings();
      for (const [num, m] of Object.entries(meanings)) {
        expect(m.numero).toBe(parseInt(num));
        expect(m.nome).toBeTruthy();
        expect(m.planeta).toBeTruthy();
        expect(m.significado).toBeTruthy();
        expect(m.forca).toBeTruthy();
        expect(m.desafio).toBeTruthy();
        expect(m.sefira).toBeTruthy();
        expect(m.arco).toBeTruthy();
        expect(m.cor).toBeTruthy();
        expect(m.pedra).toBeTruthy();
        expect(m.qualidade).toBeTruthy();
        expect(m.palavraChave).toBeTruthy();
        expect(m.affirmation).toBeTruthy();
      }
    });
  });

  describe('getMeaning', () => {
    it('finds meaning for number 1', () => {
      const m = getMeaning(1);
      expect(m).toBeDefined();
      expect(m?.numero).toBe(1);
    });

    it('finds meaning for master number 11', () => {
      const m = getMeaning(11);
      expect(m).toBeDefined();
      expect(m?.numero).toBe(11);
    });

    it('finds meaning for master number 22', () => {
      const m = getMeaning(22);
      expect(m).toBeDefined();
      expect(m?.numero).toBe(22);
    });

    it('finds meaning for master number 33', () => {
      const m = getMeaning(33);
      expect(m).toBeDefined();
      expect(m?.numero).toBe(33);
    });
  });

  describe('getMasterNumbers', () => {
    it('returns [11, 22, 33]', () => {
      const masters = getMasterNumbers();
      expect(masters).toEqual([11, 22, 33]);
    });
  });

  describe('getCoreNumbers', () => {
    it('returns 9 core numbers', () => {
      const cores = getCoreNumbers();
      expect(cores).toHaveLength(9);
      expect(cores).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('getAllNumbers', () => {
    it('returns 12 numbers', () => {
      const all = getAllNumbers();
      expect(all).toHaveLength(12);
    });

    it('includes core and master numbers', () => {
      const all = getAllNumbers();
      expect(all).toContain(1);
      expect(all).toContain(9);
      expect(all).toContain(11);
      expect(all).toContain(22);
      expect(all).toContain(33);
    });
  });
});
