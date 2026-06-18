import { describe, it, expect } from 'vitest';
import { WINGS, getWing, getAllWings, getWingsByHexagram, getHexagramWithWings } from '../index';

describe('@akasha/core-iching — Asas (Wings)', () => {
  describe('WINGS (10 Wings)', () => {
    it('tem exatamente 10 Asas', () => {
      expect(WINGS.length).toBe(10);
    });

    it('cada Asa tem ID único de 1 a 10', () => {
      const ids = WINGS.map((w) => w.id);
      expect(new Set(ids).size).toBe(10);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('cada Asa tem hexagramas válidos (1-64)', () => {
      for (const wing of WINGS) {
        for (const h of wing.hexagrams) {
          expect(h).toBeGreaterThanOrEqual(1);
          expect(h).toBeLessThanOrEqual(64);
        }
      }
    });

    it('todos os 64 hexagramas pertencem a pelo menos uma Asa', () => {
      const covered = new Set<number>();
      for (const wing of WINGS) {
        wing.hexagrams.forEach((h) => covered.add(h));
      }
      expect(covered.size).toBe(64);
    });
  });

  describe('getWing(id)', () => {
    it('retorna Asa correta pelo ID', () => {
      const wing1 = getWing(1);
      expect(wing1.name).toBe('天璜');
      expect(wing1.hexagrams).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('lança RangeError para ID inválido', () => {
      expect(() => getWing(0)).toThrow(RangeError);
      expect(() => getWing(11)).toThrow(RangeError);
      expect(() => getWing(-1)).toThrow(RangeError);
    });
  });

  describe('getAllWings()', () => {
    it('retorna array com todas as 10 Asas', () => {
      const wings = getAllWings();
      expect(wings.length).toBe(10);
    });

    it('retorna cópia (imutabilidade)', () => {
      const a = getAllWings();
      const b = getAllWings();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getWingsByHexagram(number)', () => {
    it('retorna Asa correta para hexagrama 1', () => {
      const wings = getWingsByHexagram(1);
      expect(wings.length).toBeGreaterThanOrEqual(1);
      expect(wings[0].id).toBe(1);
    });

    it('retorna Asa correta para hexagrama 64 (Asa 10)', () => {
      const wings = getWingsByHexagram(64);
      expect(wings.length).toBeGreaterThanOrEqual(1);
      expect(wings[0].id).toBe(10);
    });

    it('lança RangeError para número inválido', () => {
      expect(() => getWingsByHexagram(0)).toThrow(RangeError);
      expect(() => getWingsByHexagram(65)).toThrow(RangeError);
    });
  });

  describe('getHexagramWithWings(number)', () => {
    it('retorna hexagrama com wings e mainWing', () => {
      const h = getHexagramWithWings(1);
      expect(h.number).toBe(1);
      expect(h.name).toContain('Criativo');
      expect(h.wings).toBeDefined();
      expect(h.mainWing).toBeDefined();
      expect(h.mainWing.id).toBe(1);
    });

    it('hexagrama 64 pertence à Asa 10 (Wanderer)', () => {
      const h = getHexagramWithWings(64);
      expect(h.mainWing.id).toBe(10);
    });
  });
});
