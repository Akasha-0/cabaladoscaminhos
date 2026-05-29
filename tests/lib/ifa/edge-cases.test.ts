/**
 * IFA / Odu Edge Cases Tests
 */

import { describe, it, expect } from 'vitest';
import { drawOdu, getOduByNumber, getAllOdu, drawMultipleOdu } from '@/lib/ifa/draw';

describe('Odu Edge Cases', () => {
  describe('getOduByNumber — valid range', () => {
    it('returns valid Odu for numbers 1-16', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i);
        expect(odu).not.toBeNull();
        expect(odu!.numero).toBe(i);
      }
    });
    it('returns null for number 0', () => { expect(getOduByNumber(0)).toBeNull(); });
    it('returns null for negative numbers', () => { expect(getOduByNumber(-1)).toBeNull(); });
    it('returns null for number 17', () => { expect(getOduByNumber(17)).toBeNull(); });
    it('returns null for very large numbers', () => { expect(getOduByNumber(999)).toBeNull(); });
    it('all 16 odus have required fields', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(odu.numero).toBe(i);
        expect(typeof odu.nome).toBe('string');
        expect(odu.nome.length).toBeGreaterThan(0);
        expect(odu.opeCima).toBeDefined();
        expect(odu.opeBaixo).toBeDefined();
        expect(typeof odu.orixaRegente).toBe('string');
        expect(typeof odu.elementos).toBe('string');
        expect(typeof odu.significado).toBe('string');
      }
    });
    it('all 16 odus have valid ope combinations', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(odu.opeCima.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeCima.id).toBeLessThanOrEqual(7);
        expect(odu.opeBaixo.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeBaixo.id).toBeLessThanOrEqual(7);
      }
    });
    it('each Odu has unique nome', () => {
      const nomes = new Set<string>();
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(nomes.has(odu.nome)).toBe(false);
        nomes.add(odu.nome);
      }
      expect(nomes.size).toBe(16);
    });
  });

  describe('drawOdu — Random Drawing', () => {
    it('returns valid number 1-16', () => {
      for (let i = 0; i < 100; i++) {
        const result = drawOdu();
        expect(result.numero).toBeGreaterThanOrEqual(1);
        expect(result.numero).toBeLessThanOrEqual(16);
      }
    });
    it('returns DrawResult structure', () => {
      const result = drawOdu();
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('nome');
      expect(result).toHaveProperty('opeCima');
      expect(result).toHaveProperty('opeBaixo');
      expect(result).toHaveProperty('linhas');
      expect(result).toHaveProperty('linhasVisuais');
      expect(result).toHaveProperty('timestamp');
    });
    it('returns 8 linhas (4 top + 4 bottom)', () => {
      const result = drawOdu();
      expect(result.linhas.length).toBe(8);
      expect(result.opeCima.linhas.length).toBe(4);
      expect(result.opeBaixo.linhas.length).toBe(4);
    });
    it('linhas are boolean values', () => {
      const result = drawOdu();
      for (const linha of result.linhas) { expect(typeof linha).toBe('boolean'); }
    });
    it('linhasVisuais is a string', () => {
      const result = drawOdu();
      expect(typeof result.linhasVisuais).toBe('string');
      expect(result.linhasVisuais.length).toBeGreaterThan(0);
    });
    it('has timestamp', () => { expect(drawOdu().timestamp).toBeDefined(); });
    it('can be seeded for deterministic results', () => {
      expect(drawOdu({ seed: 42 }).numero).toBe(drawOdu({ seed: 42 }).numero);
    });
    it('different seeds produce different results', () => {
      const results = new Set<number>();
      for (let seed = 1; seed <= 10; seed++) { results.add(drawOdu({ seed }).numero); }
      expect(results.size).toBeGreaterThan(1);
    });
    it('produces distribution across 1-16 over many draws', () => {
      const counts: Record<number, number> = {};
      for (let i = 0; i < 1600; i++) { const r = drawOdu({ seed: i }); counts[r.numero] = (counts[r.numero] || 0) + 1; }
      for (let n = 1; n <= 16; n++) { expect(counts[n]).toBeGreaterThan(0); }
    });
  });

  describe('drawMultipleOdu', () => {
    it('returns correct count', () => { expect(drawMultipleOdu(3)).toHaveLength(3); });
    it('returns valid odus', () => {
      for (const r of drawMultipleOdu(5)) {
        expect(r.numero).toBeGreaterThanOrEqual(1);
        expect(r.numero).toBeLessThanOrEqual(16);
      }
    });
    it('handles count of 0', () => { expect(drawMultipleOdu(0)).toHaveLength(0); });
    it('handles large count', () => { expect(drawMultipleOdu(100)).toHaveLength(100); });
  });

  describe('getAllOdu', () => {
    it('returns array of 16 odus', () => { expect(getAllOdu()).toHaveLength(16); });
    it('contains all odus 1-16', () => {
      const allOdu = getAllOdu();
      const numeros = allOdu.map(o => o.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });
    it('each Odu in getAllOdu matches getOduByNumber', () => {
      for (const odu of getAllOdu()) { expect(getOduByNumber(odu.numero)).toEqual(odu); }
    });
  });

  describe('Odu nome uniqueness', () => {
    it('Ogbe is Odu 1', () => { expect(getOduByNumber(1)?.nome.toLowerCase()).toBe('ogbe'); });
    it('Ogunda is Odu 2', () => { expect(getOduByNumber(2)?.nome.toLowerCase()).toBe('ogunda'); });
    it('Ose is Odu 3', () => { expect(getOduByNumber(3)?.nome.toLowerCase()).toBe('ose'); });
    it('Oworin is Odu 4', () => { expect(getOduByNumber(4)?.nome.toLowerCase()).toBe('oworin'); });
  });

  describe('Odu Orixa regentes', () => {
    it('all 16 odus have orixa regente', () => {
      for (let i = 1; i <= 16; i++) { expect(getOduByNumber(i)!.orixaRegente.length).toBeGreaterThan(0); }
    });
  });

  describe('Odu elementos', () => {
    it('all 16 odus have elementos string', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(typeof odu.elementos).toBe('string');
        expect(odu.elementos.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Odu significado', () => {
    it('all 16 odus have significado', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(typeof odu.significado).toBe('string');
        expect(odu.significado.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Odu Ope combinations', () => {
    it('each Odu has 8-bit Ope representation (4 top + 4 bottom)', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        const topBits = odu.opeCima.linhas.filter(Boolean).length;
        const bottomBits = odu.opeBaixo.linhas.filter(Boolean).length;
        expect(topBits).toBeGreaterThanOrEqual(0);
        expect(topBits).toBeLessThanOrEqual(4);
        expect(bottomBits).toBeGreaterThanOrEqual(0);
        expect(bottomBits).toBeLessThanOrEqual(4);
      }
    });
    it('each Ope has valid id 0-7', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(odu.opeCima.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeCima.id).toBeLessThanOrEqual(7);
        expect(odu.opeBaixo.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeBaixo.id).toBeLessThanOrEqual(7);
      }
    });
    it('each Ope has name and simbolo', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(typeof odu.opeCima.nome).toBe('string');
        expect(typeof odu.opeCima.simbolo).toBe('string');
        expect(typeof odu.opeBaixo.nome).toBe('string');
        expect(typeof odu.opeBaixo.simbolo).toBe('string');
      }
    });
  });
});
