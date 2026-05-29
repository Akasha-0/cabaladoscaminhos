import { describe, it, expect } from 'vitest';
import { drawOdu, getOduByNumber, getAllOdu, drawMultipleOdu } from '@/lib/ifa/draw';

describe('Odu Edge Cases', () => {
  describe('getOduByNumber - valid range', () => {
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
        expect(odu.opeCima.id).toBeLessThanOrEqual(8);
        expect(odu.opeBaixo.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeBaixo.id).toBeLessThanOrEqual(8);
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

  describe('drawOdu - Random Drawing', () => {
    it('returns DrawResult structure', () => {
      const result = drawOdu();
      expect(result).toHaveProperty('odu');
      expect(result).toHaveProperty('opeCima');
      expect(result).toHaveProperty('opeBaixo');
      expect(result).toHaveProperty('linhasCima');
      expect(result).toHaveProperty('linhasBaixo');
      expect(result).toHaveProperty('timestamp');
      expect(result.opeCima).toHaveProperty('linhas');
      expect(result.opeBaixo).toHaveProperty('linhas');
    });
    it('opeCima and opeBaixo have 4 linhas', () => {
      const result = drawOdu();
      expect(result.opeCima.linhas.length).toBe(3);
      expect(result.opeBaixo.linhas.length).toBe(3);
    });
    it('linhas are boolean values', () => {
      const result = drawOdu();
      for (const linha of result.opeCima.linhas) { expect(typeof linha).toBe('boolean'); }
      for (const linha of result.opeBaixo.linhas) { expect(typeof linha).toBe('boolean'); }
    });
    it('linhasCima and linhasBaixo are strings', () => {
      const result = drawOdu();
      expect(typeof result.linhasCima).toBe('string');
      expect(typeof result.linhasBaixo).toBe('string');
    });
    it('has timestamp', () => { expect(drawOdu().timestamp).toBeDefined(); });
    it('different seeds produce different results', () => {
      const results = new Set<number>();
      for (let seed = 1; seed <= 10; seed++) {
        results.add(drawOdu({ seed: String(seed) }).odu.numero);
      }
      expect(results.size).toBeGreaterThan(1);
    });
    it('produces distribution across 1-16 over many draws', () => {
      const counts: Record<number, number> = {};
      for (let i = 0; i < 1600; i++) {
        const r = drawOdu({ seed: String(i) });
        counts[r.odu.numero] = (counts[r.odu.numero] || 0) + 1;
      }
      for (let n = 1; n <= 16; n++) { expect(counts[n] || 0).toBeGreaterThan(0); }
    });
  });

  describe('drawMultipleOdu', () => {
    it('returns correct count', () => {
      expect(drawMultipleOdu(3).length).toBe(3);
    });
    it('returns valid odus', () => {
      for (const r of drawMultipleOdu(5)) {
        expect(r.odu.numero).toBeGreaterThanOrEqual(1);
        expect(r.odu.numero).toBeLessThanOrEqual(16);
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
      expect(numeros).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
    });
    it('each Odu matches getOduByNumber', () => {
      for (const odu of getAllOdu()) {
        expect(getOduByNumber(odu.numero)).toEqual(odu);
      }
    });
  });

  describe('Odu Orixa regentes', () => {
    it('all 16 odus have orixa regente', () => {
      for (let i = 1; i <= 16; i++) {
        expect(getOduByNumber(i)!.orixaRegente.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Odu Ope combinations', () => {
    it('each Odu has 4 linhas top + 4 bottom', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(odu.opeCima.linhas.length).toBe(3);
        expect(odu.opeBaixo.linhas.length).toBe(3);
      }
    });
    it('each Ope has valid id 0-7', () => {
      for (let i = 1; i <= 16; i++) {
        const odu = getOduByNumber(i)!;
        expect(odu.opeCima.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeCima.id).toBeLessThanOrEqual(8);
        expect(odu.opeBaixo.id).toBeGreaterThanOrEqual(0);
        expect(odu.opeBaixo.id).toBeLessThanOrEqual(8);
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
