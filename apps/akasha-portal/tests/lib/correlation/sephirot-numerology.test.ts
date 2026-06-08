import { describe, it, expect } from 'vitest';
import {
  getSephirotNumerology,
  getNumerologySephirot,
  getAllSephirotNumerology,
  getAllSephirotNumerologies,
  SEPHIROT_NUMEROLOGY_MAPPINGS,
  type SephirotNumerology,
} from '@/lib/correlation/sephirot-numerology';

describe('sephirot-numerology', () => {
  // ─── getSephirotNumerology: valid Sephiroth ──────────────────────────────────

  describe('getSephirotNumerology', () => {
    it('returns Kether mapping with numero 1 and Éter element', () => {
      const result = getSephirotNumerology('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.numero).toBe(1);
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
      expect(result?.energia_espiritual).toBe('Pureza Primordial / Unidade Absoluta / Coroa Divina');
    });

    it('returns Chokmah mapping with numero 2 and Éter element', () => {
      const result = getSephirotNumerology('Chokmah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.numero).toBe(2);
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(12);
      expect(result?.energia_espiritual).toBe('Impulso Primordial / Dinamismo Criativo / Força Vital');
    });

    it('returns Binah mapping with numero 3 and Ar element', () => {
      const result = getSephirotNumerology('Binah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.numero).toBe(3);
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.energia_espiritual).toBe('Forma / Limitação / Discernimento Superior / Compreensão');
    });

    it('returns Chesed mapping with numero 4 and Água element', () => {
      const result = getSephirotNumerology('Chesed');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.numero).toBe(4);
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.energia_espiritual).toBe('Expansão / Abundância / Misericórdia Divina / Graça');
    });

    it('returns Geburah mapping with numero 5 and Fogo element', () => {
      const result = getSephirotNumerology('Geburah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.numero).toBe(5);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.energia_espiritual).toBe('Força / Guerra Santa / Cortante / Rigidês Divina');
    });

    it('returns Tiphereth mapping with numero 6 and Fogo element', () => {
      const result = getSephirotNumerology('Tiphereth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.numero).toBe(6);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.energia_espiritual).toBe('Harmonia / Brilho Solar / Propósito de Vida / Beleza');
    });

    it('returns Netzach mapping with numero 7 and Água element', () => {
      const result = getSephirotNumerology('Netzach');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.numero).toBe(7);
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.energia_espiritual).toBe('Vitória Emocional / Amor Universal / Triunfo');
    });

    it('returns Hod mapping with numero 8 and Ar element', () => {
      const result = getSephirotNumerology('Hod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.numero).toBe(8);
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.energia_espiritual).toBe('Intelecto / Comunicação / Verdade Divina / Glória');
    });

    it('returns Yesod mapping with numero 9 and Água element', () => {
      const result = getSephirotNumerology('Yesod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.numero).toBe(9);
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.energia_espiritual).toBe('Imaginação / Base Subconsciente / Lua / Fundação');
    });

    it('returns Malkuth mapping with numero 10 and Terra element', () => {
      const result = getSephirotNumerology('Malkuth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.numero).toBe(10);
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.energia_espiritual).toBe('Manifestação / Aterramento / Matéria / Reino');
    });

    it('returns null for unknown Sephirah', () => {
      const result = getSephirotNumerology('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getSephirotNumerology('');
      expect(result).toBeNull();
    });
  });

  // ─── getNumerologySephirot ───────────────────────────────────────────────────

  describe('getNumerologySephirot', () => {
    it('returns Kether for numero 1', () => {
      const result = getNumerologySephirot(1);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Kether');
      expect(result[0]?.numero).toBe(1);
    });

    it('returns Chokmah for numero 2', () => {
      const result = getNumerologySephirot(2);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Chokmah');
      expect(result[0]?.numero).toBe(2);
    });

    it('returns Binah for numero 3', () => {
      const result = getNumerologySephirot(3);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Binah');
      expect(result[0]?.numero).toBe(3);
    });

    it('returns Chesed for numero 4', () => {
      const result = getNumerologySephirot(4);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Chesed');
      expect(result[0]?.numero).toBe(4);
    });

    it('returns Geburah for numero 5', () => {
      const result = getNumerologySephirot(5);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Geburah');
      expect(result[0]?.numero).toBe(5);
    });

    it('returns Tiphereth for numero 6', () => {
      const result = getNumerologySephirot(6);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Tiphereth');
      expect(result[0]?.numero).toBe(6);
    });

    it('returns Netzach for numero 7', () => {
      const result = getNumerologySephirot(7);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Netzach');
      expect(result[0]?.numero).toBe(7);
    });

    it('returns Hod for numero 8', () => {
      const result = getNumerologySephirot(8);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Hod');
      expect(result[0]?.numero).toBe(8);
    });

    it('returns Yesod for numero 9', () => {
      const result = getNumerologySephirot(9);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Yesod');
      expect(result[0]?.numero).toBe(9);
    });

    it('returns Malkuth for numero 10', () => {
      const result = getNumerologySephirot(10);
      expect(result).toHaveLength(1);
      expect(result[0]?.sephirah).toBe('Malkuth');
      expect(result[0]?.numero).toBe(10);
    });

    it('returns empty array for non-existent numero', () => {
      const result = getNumerologySephirot(11);
      expect(result).toHaveLength(0);
    });

    it('returns empty array for numero 0', () => {
      const result = getNumerologySephirot(0);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllSephirotNumerology ─────────────────────────────────────────────────

  describe('getAllSephirotNumerology', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotNumerology();
      expect(result).toHaveLength(10);
    });

    it('returns all Sephiroth in correct order', () => {
      const result = getAllSephirotNumerology();
      expect(result[0]?.sephirah).toBe('Kether');
      expect(result[1]?.sephirah).toBe('Chokmah');
      expect(result[2]?.sephirah).toBe('Binah');
      expect(result[3]?.sephirah).toBe('Chesed');
      expect(result[4]?.sephirah).toBe('Geburah');
      expect(result[5]?.sephirah).toBe('Tiphereth');
      expect(result[6]?.sephirah).toBe('Netzach');
      expect(result[7]?.sephirah).toBe('Hod');
      expect(result[8]?.sephirah).toBe('Yesod');
      expect(result[9]?.sephirah).toBe('Malkuth');
    });

    it('each mapping has all required fields', () => {
      const result = getAllSephirotNumerology();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      });
    });

    it('numerology numbers are unique', () => {
      const result = getAllSephirotNumerology();
      const numeros = result.map((r) => r.numero);
      const uniqueNumeros = new Set(numeros);
      expect(uniqueNumeros.size).toBe(10);
    });
  });

  // ─── SEPHIROT_NUMEROLOGY_MAPPINGS constant ─────────────────────────────────────

  describe('SEPHIROT_NUMEROLOGY_MAPPINGS', () => {
    it('is defined and not null', () => {
      expect(SEPHIROT_NUMEROLOGY_MAPPINGS).toBeDefined();
      expect(SEPHIROT_NUMEROLOGY_MAPPINGS).not.toBeNull();
    });

    it('has exactly 10 Sephiroth entries', () => {
      expect(Object.keys(SEPHIROT_NUMEROLOGY_MAPPINGS)).toHaveLength(10);
    });

    it('contains all expected Sephiroth names', () => {
      const expectedNames = [
        'Kether',
        'Chokmah',
        'Binah',
        'Chesed',
        'Geburah',
        'Tiphereth',
        'Netzach',
        'Hod',
        'Yesod',
        'Malkuth',
      ];
      const actualNames = Object.keys(SEPHIROT_NUMEROLOGY_MAPPINGS);
      expectedNames.forEach((name) => {
        expect(actualNames).toContain(name);
      });
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(SEPHIROT_NUMEROLOGY_MAPPINGS)).toBe(true);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('SephirotNumerology interface completeness', () => {
    it('mapping has correct structure for Kether', () => {
      const mapping = SEPHIROT_NUMEROLOGY_MAPPINGS.Kether;
      expect(mapping.sephirah).toBe('Kether');
      expect(typeof mapping.numero).toBe('number');
      expect(typeof mapping.elemento).toBe('string');
      expect(typeof mapping.numero_caminho).toBe('number');
      expect(typeof mapping.energia_espiritual).toBe('string');
    });

    it('all mappings have valid numero within 1-10 range', () => {
      const all = getAllSephirotNumerology();
      all.forEach((mapping) => {
        expect(mapping.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.numero).toBeLessThanOrEqual(10);
      });
    });

    it('all mappings have valid path numbers', () => {
      const all = getAllSephirotNumerology();
      all.forEach((mapping) => {
        expect(mapping.numero_caminho).toBeGreaterThan(0);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(22);
      });
    });

    it('all mappings have non-empty energia_espiritual', () => {
      const all = getAllSephirotNumerology();
      all.forEach((mapping) => {
        expect(mapping.energia_espiritual.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Numerology number distribution ─────────────────────────────────────────

  describe('Numerology number distribution', () => {
    it('covers all numbers 1-10', () => {
      const all = getAllSephirotNumerology();
      const numeros = all.map((m) => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('each number has exactly one Sephirah', () => {
      const all = getAllSephirotNumerology();
      const numberCount = new Map<number, number>();
      all.forEach((m) => {
        numberCount.set(m.numero, (numberCount.get(m.numero) || 0) + 1);
      });
      numberCount.forEach((count) => {
        expect(count).toBe(1);
      });
    });
  });
  // ─── getAllSephirotNumerologies (alias) ─────────────────────────────────────
  describe('getAllSephirotNumerologies', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotNumerologies();
      expect(result).toHaveLength(10);
    });
    it('returns same results as getAllSephirotNumerology', () => {
      const result1 = getAllSephirotNumerology();
      const result2 = getAllSephirotNumerologies();
      expect(result2).toEqual(result1);
    });
    it('each mapping has required fields', () => {
      const result = getAllSephirotNumerologies();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      });
    });
  });
});