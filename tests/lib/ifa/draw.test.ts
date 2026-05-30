import { describe, it, expect } from 'vitest';
import { getOpe, getAllOdu, getOduNome, drawOdu, drawMultipleOdu, getOduByNumber } from '@/lib/ifa/draw';

describe('ifa/draw', () => {
  describe('opes (trigrams)', () => {
    it('getOpe returns valid Ope', () => {
      const ope = getOpe(1);
      expect(ope.id).toBe(1);
      expect(ope.nome).toBeTruthy();
      expect(ope.linhas).toBeTruthy();
    });

    it('opes have8 trigrams', () => {
      const ope = getOpe(8);
      expect(ope).toBeDefined();
    });
  });

  describe('getAllOdu', () => {
    it('returns 16 Odu', () => {
      const odus = getAllOdu();
      expect(odus.length).toBe(16);
    });

    it('each Odu has required fields', () => {
      for (const o of getAllOdu()) {
        expect(o.numero).toBeGreaterThan(0);
        expect(o.nome).toBeTruthy();
        expect(o.elementos).toBeTruthy();
        expect(o.orixaRegente).toBeTruthy();
        expect(o.significado).toBeTruthy();
      }
    });
  });

  describe('getOduNome', () => {
    it('returns name for valid Odu number', () => {
      const nome = getOduNome(1);
      expect(nome).toBeTruthy();
    });

    it('returns Desconhecido for invalid number', () => {
      const nome = getOduNome(99);
      expect(nome).toBe('Desconhecido');
    });
  });

  describe('drawOdu', () => {
    it('returns valid DrawResult', () => {
      const result = drawOdu();
      expect(result.odu).toBeTruthy();
      expect(result.opeCima).toBeTruthy();
      expect(result.opeBaixo).toBeTruthy();
      expect(result.linhasCima).toBeTruthy();
      expect(result.linhasBaixo).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it('returns numbered Odu', () => {
      const result = drawOdu();
      expect(result.odu.numero).toBeGreaterThan(0);
      expect(result.odu.numero).toBeLessThanOrEqual(16);
    });

    it('opes are valid Ope objects', () => {
      const result = drawOdu();
      expect(result.opeCima.id).toBeGreaterThan(0);
      expect(result.opeBaixo.id).toBeGreaterThan(0);
    });

    it('linhas are non-empty strings', () => {
      const result = drawOdu();
      expect(result.linhasCima.length).toBeGreaterThan(0);
      expect(result.linhasBaixo.length).toBeGreaterThan(0);
    });
  });

  describe('drawMultipleOdu', () => {
    it('draws requested count', () => {
      const results = drawMultipleOdu(3);
      expect(results).toHaveLength(3);
    });

    it('each result is valid', () => {
      for (const r of drawMultipleOdu(3)) {
        expect(r.odu).toBeTruthy();
        expect(r.opeCima).toBeTruthy();
      }
    });
  });

  describe('getOduByNumber', () => {
    it('finds each Odu 1-16', () => {
      for (let i = 1; i <= 16; i++) {
        expect(getOduByNumber(i)).toBeDefined();
      }
    });

    it('returns null for invalid number', () => {
      expect(getOduByNumber(99)).toBeNull();
    });
  });
});
