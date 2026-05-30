import { describe, it, expect } from 'vitest';
import {
  TAROT_SEPHIROT_MAPPINGS,
  getTarotSephirot,
  getTarotSephirah,
  getSephirotTarot,
  getAllTarotSephiroth,
  getAllArcanos,
  hasTarotSephirot,
  getSephirotByPath,
  getArcanoByNumber,
  getSephirahByNumber,
  getArcanoBySephirah,
  getAllSephiroth,
  type TarotSephirot,
} from '@/lib/correlation/tarot-sephirot';

describe('correlation/tarot-sephirot', () => {
  describe('TAROT_SEPHIROT_MAPPINGS constant', () => {
    it('has 22 entries for all Major Arcana cards', () => {
      expect(Object.keys(TAROT_SEPHIROT_MAPPINGS)).toHaveLength(22);
    });

    it('maps O Louco to Kether', () => {
      expect(TAROT_SEPHIROT_MAPPINGS['O Louco'].sephirah).toBe('Kether');
    });

    it('maps O Mago to Chokmah', () => {
      expect(TAROT_SEPHIROT_MAPPINGS['O Mago'].sephirah).toBe('Chokmah');
    });

    it('contains expected keys', () => {
      expect('O Louco' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
      expect('O Mago' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
      expect('O Sol' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
      expect('O Mundo' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
    });

    it('each mapping has required fields', () => {
      const mapping = TAROT_SEPHIROT_MAPPINGS['O Louco'];
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('sephirah');
      expect(mapping).toHaveProperty('numero_caminho');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('significado_espiritual');
    });
  });

  describe('getTarotSephirot', () => {
    it('returns mapping for valid arcano', () => {
      const result = getTarotSephirot('O Louco');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns null for invalid arcano', () => {
      const result = getTarotSephirot('Invalid Card');
      expect(result).toBeNull();
    });

    it('returns mapping with correct structure', () => {
      const result = getTarotSephirot('O Mago');
      expect(result).toHaveProperty('arcano', 'O Mago');
      expect(result).toHaveProperty('numero_carta', 1);
      expect(result).toHaveProperty('sephirah', 'Chokmah');
    });
  });

  describe('getTarotSephirah (alias)', () => {
    it('returns same result as getTarotSephirot', () => {
      const result1 = getTarotSephirah('O Sol');
      const result2 = getTarotSephirot('O Sol');
      expect(result1).toEqual(result2);
    });
  });

  describe('getSephirotTarot', () => {
    it('returns mapping for valid sephirah', () => {
      const result = getSephirotTarot('Kether');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Louco');
    });

    it('returns null for invalid sephirah', () => {
      const result = getSephirotTarot('InvalidSephirah');
      expect(result).toBeNull();
    });

    it('returns first matching arcano for sephirah with multiple arcs', () => {
      // Kether maps to O Louco (path 1)
      const result = getSephirotTarot('Kether');
      expect(result!.arcano).toBe('O Louco');
    });
  });

  describe('getAllTarotSephiroth', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotSephiroth();
      expect(result).toHaveLength(22);
    });

    it('returns sorted by numero_carta', () => {
      const result = getAllTarotSephiroth();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThan(result[i - 1].numero_carta);
      }
    });

    it('first element is O Louco with numero_carta 0', () => {
      const result = getAllTarotSephiroth();
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
    });

    it('last element is O Mundo with numero_carta 21', () => {
      const result = getAllTarotSephiroth();
      expect(result[21].arcano).toBe('O Mundo');
      expect(result[21].numero_carta).toBe(21);
    });
  });

  describe('getAllArcanos', () => {
    it('returns array of 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('includes expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Alta Sacerdotisa');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });

    it('returns keys that exist in mappings', () => {
      const result = getAllArcanos();
      result.forEach(arcano => {
        expect(arcano in TAROT_SEPHIROT_MAPPINGS).toBe(true);
      });
    });
  });

  describe('hasTarotSephirot', () => {
    it('returns true for valid arcano', () => {
      expect(hasTarotSephirot('O Louco')).toBe(true);
      expect(hasTarotSephirot('O Sol')).toBe(true);
    });

    it('returns false for invalid arcano', () => {
      expect(hasTarotSephirot('Invalid Card')).toBe(false);
      expect(hasTarotSephirot('')).toBe(false);
    });
  });

  describe('getSephirotByPath', () => {
    it('returns mapping for valid path 1', () => {
      const result = getSephirotByPath(1);
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Louco');
    });

    it('returns mapping for valid path 22', () => {
      const result = getSephirotByPath(22);
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Mundo');
    });

    it('returns null for invalid path', () => {
      expect(getSephirotByPath(0)).toBeNull();
      expect(getSephirotByPath(23)).toBeNull();
      expect(getSephirotByPath(99)).toBeNull();
    });

    it('path number equals numero_caminho', () => {
      const result = getSephirotByPath(10);
      expect(result!.numero_caminho).toBe(10);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns arcano for valid card number 0', () => {
      const result = getArcanoByNumber(0);
      expect(result).toBe('O Louco');
    });

    it('returns arcano for valid card number 19', () => {
      const result = getArcanoByNumber(19);
      expect(result).toBe('O Sol');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('getSephirahByNumber', () => {
    it('returns sephirah for valid card number 0', () => {
      const result = getSephirahByNumber(0);
      expect(result).toBe('Kether');
    });

    it('returns sephirah for valid card number 1', () => {
      const result = getSephirahByNumber(1);
      expect(result).toBe('Chokmah');
    });

    it('returns null for invalid card number', () => {
      expect(getSephirahByNumber(-1)).toBeNull();
      expect(getSephirahByNumber(22)).toBeNull();
    });
  });

  describe('getArcanoBySephirah', () => {
    it('returns arcano for valid sephirah Kether', () => {
      const result = getArcanoBySephirah('Kether');
      expect(result).toBe('O Louco');
    });

    it('returns arcano for valid sephirah Chokmah', () => {
      const result = getArcanoBySephirah('Chokmah');
      expect(result).toBe('O Mago');
    });

    it('returns null for invalid sephirah', () => {
      expect(getArcanoBySephirah('Invalid')).toBeNull();
      expect(getArcanoBySephirah('')).toBeNull();
    });
  });

  describe('getAllSephiroth', () => {
    it('returns array of sephirah names', () => {
      const result = getAllSephiroth();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains expected sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Malkuth');
    });

    it('returns unique values only', () => {
      const result = getAllSephiroth();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('element distribution', () => {
    it('all arcanos have valid elemento', () => {
      const all = getAllTarotSephiroth();
      all.forEach(mapping => {
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.elemento.length).toBeGreaterThan(0);
      });
    });

    it('contains expected elements', () => {
      const all = getAllTarotSephiroth();
      const elements = all.map(m => m.elemento);
      expect(elements).toContain('Éter');
      expect(elements).toContain('Água');
      expect(elements).toContain('Terra');
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Ar');
    });
  });

  describe('numero_carta consistency', () => {
    it('numero_carta matches arcano position', () => {
      const all = getAllTarotSephiroth();
      all.forEach(mapping => {
        const expected = getArcanoByNumber(mapping.numero_carta);
        expect(expected).toBe(mapping.arcano);
      });
    });

    it('numero_caminho is unique across all mappings', () => {
      const all = getAllTarotSephiroth();
      const paths = all.map(m => m.numero_caminho);
      const unique = new Set(paths);
      expect(unique.size).toBe(paths.length);
    });

    it('numero_carta range is 0-21', () => {
      const all = getAllTarotSephiroth();
      const numbers = all.map(m => m.numero_carta);
      expect(Math.min(...numbers)).toBe(0);
      expect(Math.max(...numbers)).toBe(21);
    });
  });
});
