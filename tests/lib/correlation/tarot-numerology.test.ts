import { describe, it, expect } from 'vitest';
import {
  getTarotNumerology,
  getNumerologyTarot,
  getAllTarotNumerology,
  getAllTarotNumerologies,
  getAllArcanos,
  hasTarotNumerology,
  getArcanoByNumber,
  getNumerologyByCardNumber,
  getTarotNumerologyByElement,
  getTarotByNumerologyNumber,
  getAllNumerologyNumbers,
  getAllElements,
  TAROT_NUMEROLOGY_MAPPINGS,
  type TarotNumerologyMapping,
} from '@/lib/correlation/tarot-numerology';

describe('tarot-numerology', () => {
  // ─── getTarotNumerology: valid arcano names ──────────────────────────────────

  describe('getTarotNumerology', () => {
    it('returns mapping for O Louco (number 0)', () => {
      const result = getTarotNumerology('O Louco');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(0);
      expect(result!.numero_numerologia).toBe(0);
      expect(result!.elemento).toBe('Éter');
    });

    it('returns mapping for O Mago (number 1)', () => {
      const result = getTarotNumerology('O Mago');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(1);
      expect(result!.numero_numerologia).toBe(1);
      expect(result!.elemento).toBe('Água');
    });

    it('returns mapping for A Alta Sacerdotisa (number 2)', () => {
      const result = getTarotNumerology('A Alta Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(2);
      expect(result!.numero_numerologia).toBe(2);
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for A Imperatriz (number 3)', () => {
      const result = getTarotNumerology('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(3);
      expect(result!.numero_numerologia).toBe(3);
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for O Imperador (number 4)', () => {
      const result = getTarotNumerology('O Imperador');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(4);
      expect(result!.numero_numerologia).toBe(4);
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for O Hierofante (number 5)', () => {
      const result = getTarotNumerology('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(5);
      expect(result!.numero_numerologia).toBe(5);
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for Os Enamorados (number 6)', () => {
      const result = getTarotNumerology('Os Enamorados');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(6);
      expect(result!.numero_numerologia).toBe(6);
      expect(result!.elemento).toBe('Ar');
    });

    it('returns mapping for O Carro (number 7)', () => {
      const result = getTarotNumerology('O Carro');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(7);
      expect(result!.numero_numerologia).toBe(7);
      expect(result!.elemento).toBe('Água');
    });

    it('returns mapping for A Justiça (number 8)', () => {
      const result = getTarotNumerology('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(8);
      expect(result!.numero_numerologia).toBe(8);
      expect(result!.elemento).toBe('Ar');
    });

    it('returns mapping for O Eremita (number 9)', () => {
      const result = getTarotNumerology('O Eremita');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(9);
      expect(result!.numero_numerologia).toBe(9);
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for A Roda da Fortuna (number 10)', () => {
      const result = getTarotNumerology('A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(10);
      expect(result!.numero_numerologia).toBe(1); // 1+0=1
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for A Força (number 11)', () => {
      const result = getTarotNumerology('A Força');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(11);
      expect(result!.numero_numerologia).toBe(2); // 1+1=2
      expect(result!.elemento).toBe('Ar');
    });

    it('returns mapping for O Enforcado (number 12)', () => {
      const result = getTarotNumerology('O Enforcado');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(12);
      expect(result!.numero_numerologia).toBe(3); // 1+2=3
      expect(result!.elemento).toBe('Água');
    });

    it('returns mapping for A Morte (number 13)', () => {
      const result = getTarotNumerology('A Morte');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(13);
      expect(result!.numero_numerologia).toBe(4); // 1+3=4
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for A Temperança (number 14)', () => {
      const result = getTarotNumerology('A Temperança');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(14);
      expect(result!.numero_numerologia).toBe(5); // 1+4=5
      expect(result!.elemento).toBe('Água');
    });

    it('returns mapping for O Diabo (number 15)', () => {
      const result = getTarotNumerology('O Diabo');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(15);
      expect(result!.numero_numerologia).toBe(6); // 1+5=6
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for A Torre (number 16)', () => {
      const result = getTarotNumerology('A Torre');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(16);
      expect(result!.numero_numerologia).toBe(7); // 1+6=7
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for A Estrela (number 17)', () => {
      const result = getTarotNumerology('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(17);
      expect(result!.numero_numerologia).toBe(8); // 1+7=8
      expect(result!.elemento).toBe('Ar');
    });

    it('returns mapping for A Lua (number 18)', () => {
      const result = getTarotNumerology('A Lua');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(18);
      expect(result!.numero_numerologia).toBe(9); // 1+8=9
      expect(result!.elemento).toBe('Água');
    });

    it('returns mapping for O Sol (number 19)', () => {
      const result = getTarotNumerology('O Sol');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(19);
      expect(result!.numero_numerologia).toBe(1); // 1+9=10→1
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for O Julgamento (number 20)', () => {
      const result = getTarotNumerology('O Julgamento');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(20);
      expect(result!.numero_numerologia).toBe(2); // 2+0=2
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns mapping for O Mundo (number 21)', () => {
      const result = getTarotNumerology('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(21);
      expect(result!.numero_numerologia).toBe(3); // 2+1=3
      expect(result!.elemento).toBe('Terra');
    });

    it('returns null for unknown arcano', () => {
      const result = getTarotNumerology('Unknown Arcano');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getTarotNumerology('');
      expect(result).toBeNull();
    });
  });

  // ─── getNumerologyTarot ──────────────────────────────────────────────────────

  describe('getNumerologyTarot', () => {
    it('returns arcanos with numerology number 0 (O Louco only)', () => {
      const result = getNumerologyTarot(0);
      expect(result).toHaveLength(1);
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
    });

    it('returns arcanos with numerology number 1', () => {
      const result = getNumerologyTarot(1);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('O Mago');
      expect(result.map(m => m.arcano)).toContain('A Roda da Fortuna');
      expect(result.map(m => m.arcano)).toContain('O Sol');
    });

    it('returns arcanos with numerology number 2', () => {
      const result = getNumerologyTarot(2);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('A Alta Sacerdotisa');
      expect(result.map(m => m.arcano)).toContain('A Força');
      expect(result.map(m => m.arcano)).toContain('O Julgamento');
    });

    it('returns arcanos with numerology number 3', () => {
      const result = getNumerologyTarot(3);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('A Imperatriz');
      expect(result.map(m => m.arcano)).toContain('O Enforcado');
      expect(result.map(m => m.arcano)).toContain('O Mundo');
    });

    it('returns arcanos with numerology number 4', () => {
      const result = getNumerologyTarot(4);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('O Imperador');
      expect(result.map(m => m.arcano)).toContain('A Morte');
    });

    it('returns arcanos with numerology number 5', () => {
      const result = getNumerologyTarot(5);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('O Hierofante');
      expect(result.map(m => m.arcano)).toContain('A Temperança');
    });

    it('returns arcanos with numerology number 6', () => {
      const result = getNumerologyTarot(6);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('Os Enamorados');
      expect(result.map(m => m.arcano)).toContain('O Diabo');
    });

    it('returns arcanos with numerology number 7', () => {
      const result = getNumerologyTarot(7);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('O Carro');
      expect(result.map(m => m.arcano)).toContain('A Torre');
    });

    it('returns arcanos with numerology number 8', () => {
      const result = getNumerologyTarot(8);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('A Justiça');
      expect(result.map(m => m.arcano)).toContain('A Estrela');
    });

    it('returns arcanos with numerology number 9', () => {
      const result = getNumerologyTarot(9);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(m => m.arcano)).toContain('O Eremita');
      expect(result.map(m => m.arcano)).toContain('A Lua');
    });

    it('returns empty array for invalid numerology number', () => {
      const result = getNumerologyTarot(10);
      expect(result).toHaveLength(0);
    });

    it('returns empty array for negative number', () => {
      const result = getNumerologyTarot(-1);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllTarotNumerology ───────────────────────────────────────────────────

  describe('getAllTarotNumerology', () => {
    it('returns all 22 Major Arcana mappings', () => {
      const result = getAllTarotNumerology();
      expect(result).toHaveLength(22);
    });

    it('returns mappings sorted by card number', () => {
      const result = getAllTarotNumerology();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero_carta).toBeLessThan(result[i + 1].numero_carta);
      }
    });

    it('includes all required fields in each mapping', () => {
      const result = getAllTarotNumerology();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('numero_numerologia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
      }
    });

    it('first mapping is O Louco with number 0', () => {
      const result = getAllTarotNumerology();
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
      expect(result[0].numero_numerologia).toBe(0);
    });

    it('last mapping is O Mundo with number 21', () => {
      const result = getAllTarotNumerology();
      expect(result[result.length - 1].arcano).toBe('O Mundo');
      expect(result[result.length - 1].numero_carta).toBe(21);
  // ─── getAllTarotNumerologies (plural - alias) ───────────────────────────────
  describe('getAllTarotNumerologies', () => {
    it('returns all 22 Major Arcana mappings', () => {
      const result = getAllTarotNumerologies();
      expect(result).toHaveLength(22);
    });
    it('returns mappings sorted by card number', () => {
      const result = getAllTarotNumerologies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero_carta).toBeLessThan(result[i + 1].numero_carta);
      }
    });
    it('returns same data as getAllTarotNumerology', () => {
      const result = getAllTarotNumerologies();
      const expected = getAllTarotNumerology();
      expect(result).toEqual(expected);
    });
  });
  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns all 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('returns names sorted by card number', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe('O Louco');
      expect(result[21]).toBe('O Mundo');
    });

    it('includes all major arcana names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mago');
      expect(result).toContain('A Alta Sacerdotisa');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Imperador');
      expect(result).toContain('A Justiça');
      expect(result).toContain('O Sol');
 });
  });

  // ─── hasTarotNumerology ───────────────────────────────────────────────────────

  describe('hasTarotNumerology', () => {
    it('returns true for valid arcano names', () => {
      expect(hasTarotNumerology('O Louco')).toBe(true);
      expect(hasTarotNumerology('O Mago')).toBe(true);
      expect(hasTarotNumerology('A Imperatriz')).toBe(true);
      expect(hasTarotNumerology('O Mundo')).toBe(true);
    });

    it('returns false for invalid arcano names', () => {
      expect(hasTarotNumerology('Unknown')).toBe(false);
      expect(hasTarotNumerology('')).toBe(false);
      expect(hasTarotNumerology('Minor Arcana')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ───────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns correct arcano for each card number 0-21', () => {
      const mappings: [number, string][] = [
        [0, 'O Louco'],
        [1, 'O Mago'],
        [2, 'A Alta Sacerdotisa'],
        [3, 'A Imperatriz'],
        [4, 'O Imperador'],
        [5, 'O Hierofante'],
        [6, 'Os Enamorados'],
        [7, 'O Carro'],
        [8, 'A Justiça'],
        [9, 'O Eremita'],
        [10, 'A Roda da Fortuna'],
        [11, 'A Força'],
        [12, 'O Enforcado'],
        [13, 'A Morte'],
        [14, 'A Temperança'],
        [15, 'O Diabo'],
        [16, 'A Torre'],
        [17, 'A Estrela'],
        [18, 'A Lua'],
        [19, 'O Sol'],
        [20, 'O Julgamento'],
        [21, 'O Mundo'],
      ];

      for (const [numero, expected] of mappings) {
        expect(getArcanoByNumber(numero)).toBe(expected);
      }
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(100)).toBeNull();
    });
  });

  // ─── getNumerologyByCardNumber ───────────────────────────────────────────────

  describe('getNumerologyByCardNumber', () => {
    it('returns numerology number 0 for O Louco', () => {
      expect(getNumerologyByCardNumber(0)).toBe(0);
    });

    it('returns numerology number 1 for O Mago', () => {
      expect(getNumerologyByCardNumber(1)).toBe(1);
    });

    it('returns numerology number 8 for A Justiça', () => {
      expect(getNumerologyByCardNumber(8)).toBe(8);
    });

    it('returns numerology number 1 for A Roda da Fortuna (1+0=1)', () => {
      expect(getNumerologyByCardNumber(10)).toBe(1);
    });

    it('returns numerology number 2 for A Força (1+1=2)', () => {
      expect(getNumerologyByCardNumber(11)).toBe(2);
    });

    it('returns numerology number 3 for O Enforcado (1+2=3)', () => {
      expect(getNumerologyByCardNumber(12)).toBe(3);
    });

    it('returns numerology number 9 for A Lua (1+8=9)', () => {
      expect(getNumerologyByCardNumber(18)).toBe(9);
    });

    it('returns numerology number 1 for O Sol (1+9=10→1)', () => {
      expect(getNumerologyByCardNumber(19)).toBe(1);
    });

    it('returns numerology number 3 for O Mundo (2+1=3)', () => {
      expect(getNumerologyByCardNumber(21)).toBe(3);
    });

    it('returns null for invalid card number', () => {
      expect(getNumerologyByCardNumber(-1)).toBeNull();
      expect(getNumerologyByCardNumber(22)).toBeNull();
    });
  });

  // ─── getTarotNumerologyByElement ─────────────────────────────────────────────

  describe('getTarotNumerologyByElement', () => {
    it('returns arcanos with Fogo element', () => {
      const result = getTarotNumerologyByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Fogo')).toBe(true);
      expect(result.map(m => m.arcano)).toContain('O Imperador');
      expect(result.map(m => m.arcano)).toContain('A Torre');
      expect(result.map(m => m.arcano)).toContain('O Sol');
    });

    it('returns arcanos with Água element', () => {
      const result = getTarotNumerologyByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Água')).toBe(true);
      expect(result.map(m => m.arcano)).toContain('O Mago');
      expect(result.map(m => m.arcano)).toContain('A Lua');
    });

    it('returns arcanos with Terra element', () => {
      const result = getTarotNumerologyByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Terra')).toBe(true);
      expect(result.map(m => m.arcano)).toContain('A Alta Sacerdotisa');
      expect(result.map(m => m.arcano)).toContain('O Mundo');
    });

    it('returns arcanos with Ar element', () => {
      const result = getTarotNumerologyByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Ar')).toBe(true);
      expect(result.map(m => m.arcano)).toContain('A Justiça');
      expect(result.map(m => m.arcano)).toContain('A Estrela');
    });

    it('returns arcanos with Éter element (only O Louco)', () => {
      const result = getTarotNumerologyByElement('Éter');
      expect(result.length).toBe(1);
      expect(result[0].arcano).toBe('O Louco');
    });

    it('is case-insensitive', () => {
      const result1 = getTarotNumerologyByElement('fogo');
      const result2 = getTarotNumerologyByElement('FOGO');
      const result3 = getTarotNumerologyByElement('Fogo');
      expect(result1.length).toBe(result2.length);
      expect(result2.length).toBe(result3.length);
    });

    it('returns empty array for unknown element', () => {
      const result = getTarotNumerologyByElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getTarotByNumerologyNumber ───────────────────────────────────────────────

  describe('getTarotByNumerologyNumber', () => {
    it('returns mappings for numerology number 0', () => {
      const result = getTarotByNumerologyNumber(0);
      expect(result.length).toBe(1);
      expect(result[0].arcano).toBe('O Louco');
    });

    it('returns mappings for numerology number 1', () => {
      const result = getTarotByNumerologyNumber(1);
      expect(result.length).toBeGreaterThan(1);
      expect(result.every(m => m.numero_numerologia === 1)).toBe(true);
    });

    it('returns empty array for invalid number', () => {
      const result = getTarotByNumerologyNumber(10);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllNumerologyNumbers ──────────────────────────────────────────────────

  describe('getAllNumerologyNumbers', () => {
    it('returns all unique numerology numbers 0-9', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toContain(0);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
      expect(result).toContain(5);
      expect(result).toContain(6);
      expect(result).toContain(7);
      expect(result).toContain(8);
      expect(result).toContain(9);
    });

    it('returns numbers sorted in ascending order', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── getAllElements ──────────────────────────────────────────────────────────

  describe('getAllElements', () => {
    it('returns all unique elements', () => {
      const result = getAllElements();
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Terra');
      expect(result).toContain('Ar');
      expect(result).toContain('Éter');
    });

    it('returns elements sorted alphabetically', () => {
      const result = getAllElements();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i] < result[i + 1]).toBe(true);
      }
    });
  });

  // ─── TAROT_NUMEROLOGY_MAPPINGS constant ──────────────────────────────────────

  describe('TAROT_NUMEROLOGY_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_NUMEROLOGY_MAPPINGS)).toBe(true);
    });

    it('contains22 entries', () => {
      expect(Object.keys(TAROT_NUMEROLOGY_MAPPINGS)).toHaveLength(22);
    });

    it('has all major arcana names as keys', () => {
      const expectedKeys = [
        'O Louco', 'O Mago', 'A Alta Sacerdotisa', 'A Imperatriz', 'O Imperador',
        'O Hierofante', 'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita',
        'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
        'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo',
      ];
      for (const key of expectedKeys) {
        expect(TAROT_NUMEROLOGY_MAPPINGS).toHaveProperty(key);
      }
    });

    it('nested objects are frozen', () => {
      for (const mapping of Object.values(TAROT_NUMEROLOGY_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── TarotNumerologyMapping interface completeness ──────────────────────────

  describe('TarotNumerologyMapping interface completeness', () => {
    it('has all required fields for O Louco', () => {
      const mapping = TAROT_NUMEROLOGY_MAPPINGS['O Louco'];
      expect(mapping.arcano).toBe('O Louco');
      expect(mapping.numero_carta).toBe(0);
      expect(mapping.numero_numerologia).toBe(0);
      expect(mapping.elemento).toBe('Éter');
      expect(typeof mapping.significado_espiritual).toBe('string');
      expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
    });

    it('has all required fields for O Mago', () => {
      const mapping = TAROT_NUMEROLOGY_MAPPINGS['O Mago'];
      expect(mapping.arcano).toBe('O Mago');
      expect(mapping.numero_carta).toBe(1);
      expect(mapping.numero_numerologia).toBe(1);
      expect(mapping.elemento).toBe('Água');
      expect(typeof mapping.significado_espiritual).toBe('string');
    });

    it('has all required fields for O Mundo', () => {
      const mapping = TAROT_NUMEROLOGY_MAPPINGS['O Mundo'];
      expect(mapping.arcano).toBe('O Mundo');
      expect(mapping.numero_carta).toBe(21);
      expect(mapping.numero_numerologia).toBe(3);
      expect(mapping.elemento).toBe('Terra');
      expect(typeof mapping.significado_espiritual).toBe('string');
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has correct number of Fogo arcanos', () => {
      const fogo = getTarotNumerologyByElement('Fogo');
      expect(fogo.length).toBeGreaterThan(0);
    });

    it('has correct number of Água arcanos', () => {
      const agua = getTarotNumerologyByElement('Água');
      expect(agua.length).toBeGreaterThan(0);
    });

    it('has correct number of Terra arcanos', () => {
      const terra = getTarotNumerologyByElement('Terra');
      expect(terra.length).toBeGreaterThan(0);
    });

    it('has correct number of Ar arcanos', () => {
      const ar = getTarotNumerologyByElement('Ar');
      expect(ar.length).toBeGreaterThan(0);
    });

    it('has exactly one Éter arcano (O Louco)', () => {
      const ether = getTarotNumerologyByElement('Éter');
      expect(ether.length).toBe(1);
      expect(ether[0].arcano).toBe('O Louco');
    });

    it('all arcanos are accounted for in element distribution', () => {
      const fogo = getTarotNumerologyByElement('Fogo');
      const agua = getTarotNumerologyByElement('Água');
      const terra = getTarotNumerologyByElement('Terra');
      const ar = getTarotNumerologyByElement('Ar');
      const ether = getTarotNumerologyByElement('Éter');
      expect(fogo.length + agua.length + terra.length + ar.length + ether.length).toBe(22);
    });
  });

  // ─── Numerology number distribution ─────────────────────────────────────────

  describe('Numerology number distribution', () => {
    it('has one arcano with numerology number 0 (O Louco)', () => {
      const result = getNumerologyTarot(0);
      expect(result.length).toBe(1);
      expect(result[0].arcano).toBe('O Louco');
    });

    it('has multiple arcanos with numerology number 1', () => {
      const result = getNumerologyTarot(1);
      expect(result.length).toBeGreaterThan(1);
    });

    it('all arcanos are distributed across numerology numbers 0-9', () => {
      const allNumbers = getAllNumerologyNumbers();
      expect(allNumbers).toContain(0);
      expect(allNumbers).toContain(1);
      expect(allNumbers).toContain(2);
      expect(allNumbers).toContain(3);
      expect(allNumbers).toContain(4);
      expect(allNumbers).toContain(5);
      expect(allNumbers).toContain(6);
      expect(allNumbers).toContain(7);
      expect(allNumbers).toContain(8);
      expect(allNumbers).toContain(9);
    });

    it('sum of all numerology tarots equals 22', () => {
      let total = 0;
      for (let i = 0; i <= 9; i++) {
        total += getNumerologyTarot(i).length;
      }
      expect(total).toBe(22);
    });
  });

  // ─── Cross-reference with card numbers ──────────────────────────────────────

  describe('Cross-reference with card numbers', () => {
    it('all card numbers 0-21 are present', () => {
      const allMappings = getAllTarotNumerology();
      const cardNumbers = allMappings.map(m => m.numero_carta).sort((a, b) => a - b);
      expect(cardNumbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
    });

    it('each card number maps to a unique arcano', () => {
      const allMappings = getAllTarotNumerology();
      const cardNumbers = allMappings.map(m => m.numero_carta);
      const uniqueNumbers = new Set(cardNumbers);
      expect(uniqueNumbers.size).toBe(22);
    });

    it('numerology numbers are consistent with card number digit sums', () => {
      // This test verifies the numerology reduction logic
      const testCases: [number, number][] = [
        [0, 0],   // O Louco - special case
        [1, 1],   // O Mago
        [2, 2],   // A Alta Sacerdotisa
        [3, 3],   // A Imperatriz
        [4, 4],   // O Imperador
        [5, 5],   // O Hierofante
        [6, 6],   // Os Enamorados
        [7, 7],   // O Carro
        [8, 8],   // A Justiça
        [9, 9],   // O Eremita
        [10, 1],  // A Roda da Fortuna - 1+0=1
        [11, 2],  // A Força - 1+1=2
        [12, 3],  // O Enforcado - 1+2=3
        [13, 4],  // A Morte - 1+3=4
        [14, 5],  // A Temperança - 1+4=5
        [15, 6],  // O Diabo - 1+5=6
        [16, 7],  // A Torre - 1+6=7
        [17, 8],  // A Estrela - 1+7=8
        [18, 9],  // A Lua - 1+8=9
        [19, 1],  // O Sol - 1+9=10→1
        [20, 2],  // O Julgamento - 2+0=2
        [21, 3],  // O Mundo - 2+1=3
      ];

      for (const [cardNum, expectedNum] of testCases) {
        const result = getNumerologyByCardNumber(cardNum);
        expect(result).toBe(expectedNum);
      }
    });
  });
});
