import { describe, it, expect } from 'vitest';
import {
  getNumerologySephirot,
  getSephirotNumerology,
  getAllNumerologySephiroths,
  NUMEROLOGIA_SEPHIROT_MAPPINGS,
  type NumerologiaSephirot,
} from '@/lib/correlation/numerology-sephirot';

describe('numerology-sephirot', () => {
  // ─── getNumerologySephirot: valid numerology numbers ─────────────────────────

  describe('getNumerologySephirot', () => {
    it('returns Kether mapping for numero 1 with Éter element', () => {
      const result = getNumerologySephirot(1);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
      expect(result?.numero_mestre).toBe(false);
      expect(result?.energia_espiritual).toBe('Iniciação / Liderança / Individualidade / Propósito Divino');
    });

    it('returns Binah mapping for numero 2 with Ar element', () => {
      const result = getNumerologySephirot(2);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(2);
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Chesed mapping for numero 3 with Água element', () => {
      const result = getNumerologySephirot(3);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(3);
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Tiphereth mapping for numero 4 with Fogo element', () => {
      const result = getNumerologySephirot(4);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(4);
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Geburah mapping for numero 5 with Fogo element', () => {
      const result = getNumerologySephirot(5);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(5);
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Netzach mapping for numero 6 with Água element', () => {
      const result = getNumerologySephirot(6);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(6);
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Hod mapping for numero 7 with Ar element', () => {
      const result = getNumerologySephirot(7);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(7);
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Yesod mapping for numero 8 with Água element', () => {
      const result = getNumerologySephirot(8);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(8);
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.numero_mestre).toBe(false);
    });

    it('returns Malkuth mapping for numero 9 with Terra element', () => {
      const result = getNumerologySephirot(9);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(9);
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.numero_mestre).toBe(false);
    });

    // ─── Master Numbers ─────────────────────────────────────────────────────────

    it('returns Kether mapping for master number 11 with Éter element', () => {
      const result = getNumerologySephirot(11);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(11);
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
      expect(result?.numero_mestre).toBe(true);
      expect(result?.energia_espiritual).toBe('Iluminação / Inspiração / Visão Profética / Canal Divino');
    });

    it('returns Chokmah mapping for master number 22 with Éter element', () => {
      const result = getNumerologySephirot(22);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(22);
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(12);
      expect(result?.numero_mestre).toBe(true);
      expect(result?.energia_espiritual).toBe('Realização Prática / Obra Maior / Poder Manifestador / Dinamismo');
    });

    it('returns Binah mapping for master number 33 with Ar element', () => {
      const result = getNumerologySephirot(33);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(33);
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.numero_mestre).toBe(true);
      expect(result?.energia_espiritual).toBe('Ensino Espiritual / Sacrifício / Amor Divino / Compreensão Superior');
    });

    // ─── Invalid numbers ───────────────────────────────────────────────────────

    it('returns null for number 0', () => {
      const result = getNumerologySephirot(0);
      expect(result).toBeNull();
    });

    it('returns null for number 10', () => {
      const result = getNumerologySephirot(10);
      expect(result).toBeNull();
    });

    it('returns null for negative numbers', () => {
      const result = getNumerologySephirot(-1);
      expect(result).toBeNull();
    });

    it('returns null for non-standard numbers', () => {
      const result = getNumerologySephirot(44);
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotNumerology ─────────────────────────────────────────────────

  describe('getSephirotNumerology', () => {
    it('returns all numerology mappings for Kether', () => {
      const result = getSephirotNumerology('Kether');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.sephirah === 'Kether')).toBe(true);
    });

    it('returns all numerology mappings for Kether case-insensitive', () => {
      const result = getSephirotNumerology('kether');
      expect(result).toBeDefined();
      expect(result.some((m) => m.sephirah === 'Kether')).toBe(true);
    });

    it('returns empty array for unknown Sephirah', () => {
      const result = getSephirotNumerology('UnknownSephirah');
      expect(result).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const result = getSephirotNumerology('');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllNumerologySephiroths ──────────────────────────────────────────────

  describe('getAllNumerologySephiroths', () => {
    it('returns all 12 mappings (1-9 plus master numbers 11, 22, 33)', () => {
      const result = getAllNumerologySephiroths();
      expect(result).toBeDefined();
      expect(result.length).toBe(12);
    });

    it('contains all standard numerology numbers 1-9', () => {
      const result = getAllNumerologySephiroths();
      const numeros = result.map((m) => m.numero);
      expect(numeros).toContain(1);
      expect(numeros).toContain(2);
      expect(numeros).toContain(3);
      expect(numeros).toContain(4);
      expect(numeros).toContain(5);
      expect(numeros).toContain(6);
      expect(numeros).toContain(7);
      expect(numeros).toContain(8);
      expect(numeros).toContain(9);
    });

    it('contains all master numbers 11, 22, 33', () => {
      const result = getAllNumerologySephiroths();
      const numeros = result.map((m) => m.numero);
      expect(numeros).toContain(11);
      expect(numeros).toContain(22);
      expect(numeros).toContain(33);
    });

    it('returns a new array on each call', () => {
      const result1 = getAllNumerologySephiroths();
      const result2 = getAllNumerologySephiroths();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  // ─── NUMEROLOGIA_SEPHIROT_MAPPINGS constant ──────────────────────────────────

  describe('NUMEROLOGIA_SEPHIROT_MAPPINGS', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(NUMEROLOGIA_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has 12 entries for numbers 1-9 and master numbers', () => {
      expect(Object.keys(NUMEROLOGIA_SEPHIROT_MAPPINGS).length).toBe(12);
    });

    it('contains valid elemento values', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água', 'Éter'];
      const result = getAllNumerologySephiroths();
      result.forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('contains valid numero_caminho values', () => {
      const result = getAllNumerologySephiroths();
      result.forEach((mapping) => {
        expect(mapping.numero_caminho).toBeGreaterThan(0);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(22);
      });
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('NumerologiaSephirot interface completeness', () => {
    it('returns objects with all required fields', () => {
      const result = getNumerologySephirot(1);
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('sephirah');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('numero_caminho');
      expect(result).toHaveProperty('energia_espiritual');
      expect(result).toHaveProperty('numero_mestre');
    });

    it('marks standard numbers as non-master', () => {
      for (let i = 1; i <= 9; i++) {
        const result = getNumerologySephirot(i);
        expect(result?.numero_mestre).toBe(false);
      }
    });

    it('marks master numbers as master', () => {
      const masterNumbers = [11, 22, 33];
      masterNumbers.forEach((num) => {
        const result = getNumerologySephirot(num);
        expect(result?.numero_mestre).toBe(true);
      });
    });
  });

  // ─── Element distribution ──────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('maps correct elements for standard numbers', () => {
      expect(getNumerologySephirot(1)?.elemento).toBe('Éter');
      expect(getNumerologySephirot(2)?.elemento).toBe('Ar');
      expect(getNumerologySephirot(3)?.elemento).toBe('Água');
      expect(getNumerologySephirot(4)?.elemento).toBe('Fogo');
      expect(getNumerologySephirot(5)?.elemento).toBe('Fogo');
      expect(getNumerologySephirot(6)?.elemento).toBe('Água');
      expect(getNumerologySephirot(7)?.elemento).toBe('Ar');
      expect(getNumerologySephirot(8)?.elemento).toBe('Água');
      expect(getNumerologySephirot(9)?.elemento).toBe('Terra');
    });
  });

  // ─── Path number verification ───────────────────────────────────────────────

  describe('Path number verification', () => {
    it('maps numbers to their path numbers on the Tree of Life', () => {
      expect(getNumerologySephirot(1)?.numero_caminho).toBe(11);
      expect(getNumerologySephirot(2)?.numero_caminho).toBe(3);
      expect(getNumerologySephirot(3)?.numero_caminho).toBe(4);
      expect(getNumerologySephirot(4)?.numero_caminho).toBe(6);
      expect(getNumerologySephirot(5)?.numero_caminho).toBe(5);
      expect(getNumerologySephirot(6)?.numero_caminho).toBe(7);
      expect(getNumerologySephirot(7)?.numero_caminho).toBe(8);
      expect(getNumerologySephirot(8)?.numero_caminho).toBe(9);
      expect(getNumerologySephirot(9)?.numero_caminho).toBe(10);
    });
  });
});