import { describe, it, expect } from 'vitest';
import {
  getTarotSephirot,
  getSephirotTarot,
  getAllTarotSephiroths,
  getAllArcanos,
  hasTarotSephirot,
  getArcanoByNumber,
  getSephirotByNumber,
  getArcanosBySephirot,
  getSephirotInTarot,
  getElementsInTarot,
  TAROT_SEPHIROT_MAPPINGS,
  type TarotSephirotMapping,
} from '@/lib/correlation/tarot-sephirot';

describe('tarot-sephirot', () => {
  // ─── getTarotSephirot: valid arcanos ─────────────────────────────────────────

  describe('getTarotSephirot', () => {
    it('should return mapping for O Louco', () => {
      const result = getTarotSephirot('O Louco');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Louco');
      expect(result!.numero_carta).toBe(0);
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento_conexao).toBe('Ar');
      expect(result!.numero_caminho).toBe(0);
      expect(result!.letra_hebraica).toBe('Aleph');
    });

    it('should return mapping for O Mago', () => {
      const result = getTarotSephirot('O Mago');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Mago');
      expect(result!.sephirah).toBe('Kether');
    });

    it('should return mapping for O Sol', () => {
      const result = getTarotSephirot('O Sol');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Sol');
      expect(result!.numero_carta).toBe(19);
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento_conexao).toBe('Fogo');
    });

    it('should return mapping for A Lua', () => {
      const result = getTarotSephirot('A Lua');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('A Lua');
      expect(result!.numero_carta).toBe(18);
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento_conexao).toBe('Água');
    });

    it('should return mapping for O Mundo', () => {
      const result = getTarotSephirot('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Mundo');
      expect(result!.numero_carta).toBe(21);
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('should return mapping for A Sacerdotisa', () => {
      const result = getTarotSephirot('A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
    });

    it('should return mapping for A Imperatriz', () => {
      const result = getTarotSephirot('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
    });

    it('should return mapping for O Imperador', () => {
      const result = getTarotSephirot('O Imperador');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
    });

    it('should return mapping for O Hierofante', () => {
      const result = getTarotSephirot('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
    });

    it('should return mapping for A Torre', () => {
      const result = getTarotSephirot('A Torre');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotSephirot('Unknown Card')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getTarotSephirot('')).toBeNull();
    });
  });

  // ─── getSephirotTarot ─────────────────────────────────────────────────────────

  describe('getSephirotTarot', () => {
    it('should return first arcano for Kether', () => {
      const result = getSephirotTarot('Kether');
      expect(result).toBe('O Louco');
    });

    it('should return first arcano for Tiphereth', () => {
      const result = getSephirotTarot('Tiphereth');
      expect(result).toBe('Os Enamorados');
    });

    it('should return first arcano for Malkuth', () => {
      const result = getSephirotTarot('Malkuth');
      expect(result).toBe('A Morte');
    });

    it('should return null for unknown Sephirah', () => {
      expect(getSephirotTarot('Unknown Sephirah')).toBeNull();
    });

    it('should be case-sensitive', () => {
      expect(getSephirotTarot('kether')).toBeNull();
      expect(getSephirotTarot('TIPHERETH')).toBeNull();
    });
  });

  // ─── getAllTarotSephiroths ─────────────────────────────────────────────────────

  describe('getAllTarotSephiroths', () => {
    it('should return all 22 Major Arcana mappings', () => {
      const result = getAllTarotSephiroths();
      expect(result).toHaveLength(22);
    });

    it('should include all expected arcanos', () => {
      const result = getAllTarotSephiroths();
      const arcanoNames = result.map(m => m.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('A Lua');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('should have valid sephirah for each mapping', () => {
      const result = getAllTarotSephiroths();
      for (const mapping of result) {
        expect(mapping.sephirah).toBeTruthy();
        expect(typeof mapping.sephirah).toBe('string');
      }
    });

    it('should have valid elemento_conexao for each mapping', () => {
      const result = getAllTarotSephiroths();
      for (const mapping of result) {
        expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(mapping.elemento_conexao);
      }
    });

    it('should return a new array each time', () => {
      const result1 = getAllTarotSephiroths();
      const result2 = getAllTarotSephiroths();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('should return array of 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('should include O Louco at index 0', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
    });

    it('should include O Mundo', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mundo');
    });

    it('should return a new array each time', () => {
      const result1 = getAllArcanos();
      const result2 = getAllArcanos();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── hasTarotSephirot ─────────────────────────────────────────────────────────

  describe('hasTarotSephirot', () => {
    it('should return true for existing arcanos', () => {
      expect(hasTarotSephirot('O Sol')).toBe(true);
      expect(hasTarotSephirot('A Lua')).toBe(true);
      expect(hasTarotSephirot('O Mago')).toBe(true);
      expect(hasTarotSephirot('O Louco')).toBe(true);
    });

    it('should return false for non-existing arcanos', () => {
      expect(hasTarotSephirot('Unknown')).toBe(false);
      expect(hasTarotSephirot('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('should return O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('should return A Lua for number 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('should return O Sol for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for out of range numbers', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(100)).toBeNull();
    });
  });

  // ─── getSephirotByNumber ──────────────────────────────────────────────────────

  describe('getSephirotByNumber', () => {
    it('should return Kether for number 0 (O Louco)', () => {
      expect(getSephirotByNumber(0)).toBe('Kether');
    });

    it('should return Kether for number 1 (O Mago)', () => {
      expect(getSephirotByNumber(1)).toBe('Kether');
    });

    it('should return Tiphereth for number 19 (O Sol)', () => {
      expect(getSephirotByNumber(19)).toBe('Tiphereth');
    });

    it('should return Malkuth for number 21 (O Mundo)', () => {
      expect(getSephirotByNumber(21)).toBe('Malkuth');
    });

    it('should return null for out of range numbers', () => {
      expect(getSephirotByNumber(-1)).toBeNull();
      expect(getSephirotByNumber(22)).toBeNull();
    });
  });

  // ─── getArcanosBySephirot ─────────────────────────────────────────────────────

  describe('getArcanosBySephirot', () => {
    it('should return multiple arcanos for Kether', () => {
      const result = getArcanosBySephirot('Kether');
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
    });

    it('should return multiple arcanos for Tiphereth', () => {
      const result = getArcanosBySephirot('Tiphereth');
      expect(result).toContain('Os Enamorados');
      expect(result).toContain('A Força');
      expect(result).toContain('A Estrela');
      expect(result).toContain('O Sol');
    });

    it('should return multiple arcanos for Malkuth', () => {
      const result = getArcanosBySephirot('Malkuth');
      expect(result).toContain('A Morte');
      expect(result).toContain('O Diabo');
      expect(result).toContain('O Julgamento');
      expect(result).toContain('O Mundo');
    });

    it('should return empty array for unknown Sephirah', () => {
      expect(getArcanosBySephirot('Unknown')).toEqual([]);
    });
  });

  // ─── getSephirotInTarot ─────────────────────────────────────────────────────

  describe('getSephirotInTarot', () => {
    it('should return unique Sephirot names', () => {
      const result = getSephirotInTarot();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });

    it('should include all major Sephirot', () => {
      const result = getSephirotInTarot();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Malkuth');
    });

    it('should return sorted array', () => {
      const result = getSephirotInTarot();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  // ─── getElementsInTarot ─────────────────────────────────────────────────────

  describe('getElementsInTarot', () => {
    it('should return all elements used', () => {
      const result = getElementsInTarot();
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Ar');
      expect(result).toContain('Terra');
    });

    it('should return unique elements', () => {
      const result = getElementsInTarot();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });
  });

  // ─── TAROT_SEPHIROT_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_SEPHIROT_MAPPINGS', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('should have 22 entries', () => {
      expect(Object.keys(TAROT_SEPHIROT_MAPPINGS)).toHaveLength(22);
    });

    it('should have all required properties', () => {
      const mapping = TAROT_SEPHIROT_MAPPINGS['O Sol'];
      expect(mapping.arcano).toBe('O Sol');
      expect(mapping.numero_carta).toBe(19);
      expect(mapping.sephirah).toBe('Tiphereth');
      expect(mapping.elemento_conexao).toBe('Fogo');
      expect(mapping.significado_espiritual).toBeTruthy();
      expect(mapping.numero_caminho).toBe(16);
      expect(mapping.letra_hebraica).toBe('Resh');
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotSephirotMapping interface completeness', () => {
    it('should have all required fields for O Louco', () => {
      const mapping = getTarotSephirot('O Louco')!;
      expect(mapping.arcano).toBeTruthy();
      expect(mapping.numero_carta).toBe(0);
      expect(mapping.sephirah).toBeTruthy();
      expect(mapping.elemento_conexao).toBeTruthy();
      expect(mapping.significado_espiritual).toBeTruthy();
      expect(mapping.numero_caminho).toBe(0);
      expect(mapping.letra_hebraica).toBeTruthy();
    });

    it('should have all required fields for O Mundo', () => {
      const mapping = getTarotSephirot('O Mundo')!;
      expect(mapping.arcano).toBe('O Mundo');
      expect(mapping.numero_carta).toBe(21);
      expect(mapping.sephirah).toBe('Malkuth');
      expect(mapping.elemento_conexao).toBe('Terra');
      expect(mapping.significado_espiritual).toBeTruthy();
    });

    it('should have Portuguese spiritual meanings for all arcanos', () => {
      const allMappings = getAllTarotSephiroths();
      for (const mapping of allMappings) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });
  });

  // ─── Sephirot-Arcano consistency ─────────────────────────────────────────────

  describe('Sephirot-Arcano consistency', () => {
    it('should have correct number_carta for each arcano', () => {
      const allMappings = getAllTarotSephiroths();
      for (const mapping of allMappings) {
        const byNumber = getArcanoByNumber(mapping.numero_carta);
        expect(byNumber).toBe(mapping.arcano);
      }
    });

    it('should have correct sephirah for each arcano by number', () => {
      const allMappings = getAllTarotSephiroths();
      for (const mapping of allMappings) {
        const byNumber = getSephirotByNumber(mapping.numero_carta);
        expect(byNumber).toBe(mapping.sephirah);
      }
    });

    it('should have correct sephirah for getTarotSephirot', () => {
      for (const arcano of getAllArcanos()) {
        const byArcano = getTarotSephirot(arcano);
        const bySephirot = getSephirotTarot(byArcano!.sephirah);
        expect(bySephirot).toBeTruthy();
      }
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('should have Fogo associated with at least one arcano', () => {
      const sol = getTarotSephirot('O Sol');
      expect(sol!.elemento_conexao).toBe('Fogo');
    });

    it('should have Água associated with at least one arcano', () => {
      const lua = getTarotSephirot('A Lua');
      expect(lua!.elemento_conexao).toBe('Água');
    });

    it('should have Ar associated with at least one arcano', () => {
      const mago = getTarotSephirot('O Mago');
      expect(mago!.elemento_conexao).toBe('Ar');
    });

    it('should have Terra associated with at least one arcano', () => {
      const morte = getTarotSephirot('A Morte');
      expect(morte!.elemento_conexao).toBe('Terra');
    });
  });
});