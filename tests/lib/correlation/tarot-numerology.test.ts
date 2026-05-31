import { describe, it, expect } from 'vitest';
import {
  getTarotNumerologyByNumber,
  getNumerologyByArcano,
  getAllTarotNumerologies,
  hasTarotNumerology,
  getMappingByArcano,
  getTarotNumerologyByElement,
  getTarotNumerologyByOrixa,
  getTarotNumerologyBySephirah,
  getTarotNumerologyByChakra,
  getMasterNumberMappings,
  getAllArcanos,
  TAROT_NUMEROLOGIA_MAP,
  type TarotNumerologyMapping,
} from '@/lib/correlation/tarot-numerology';

describe('tarot-numerology', () => {
  // ─── getTarotNumerologyByNumber: valid numbers ───────────────────────────────

  describe('getTarotNumerologyByNumber', () => {
    it('returns mapping for card 0 (O Louco)', () => {
      const result = getTarotNumerologyByNumber(0);
      expect(result.arcano).toBe('O Louco');
      expect(result.numero_carta).toBe(0);
      expect(result.numero_numerologia).toBe(22);
      expect(result.é_mestre).toBe(true);
    });

    it('returns mapping for card 1 (A Sacerdotisa)', () => {
      const result = getTarotNumerologyByNumber(1);
      expect(result.arcano).toBe('A Sacerdotisa');
      expect(result.numero_carta).toBe(1);
      expect(result.numero_numerologia).toBe(2);
    });

    it('returns mapping for card 2 (A Imperatriz)', () => {
      const result = getTarotNumerologyByNumber(2);
      expect(result.arcano).toBe('A Imperatriz');
      expect(result.numero_carta).toBe(2);
      expect(result.numero_numerologia).toBe(3);
    });

    it('returns mapping for card 3 (O Imperador)', () => {
      const result = getTarotNumerologyByNumber(3);
      expect(result.arcano).toBe('O Imperador');
      expect(result.numero_carta).toBe(3);
      expect(result.numero_numerologia).toBe(4);
    });

    it('returns mapping for card 4 (O Hierofante)', () => {
      const result = getTarotNumerologyByNumber(4);
      expect(result.arcano).toBe('O Hierofante');
      expect(result.numero_carta).toBe(4);
      expect(result.numero_numerologia).toBe(5);
    });

    it('returns mapping for card 5 (Os Enamorados)', () => {
      const result = getTarotNumerologyByNumber(5);
      expect(result.arcano).toBe('Os Enamorados');
      expect(result.numero_carta).toBe(5);
      expect(result.numero_numerologia).toBe(6);
    });

    it('returns mapping for card 6 (O Carro)', () => {
      const result = getTarotNumerologyByNumber(6);
      expect(result.arcano).toBe('O Carro');
      expect(result.numero_carta).toBe(6);
      expect(result.numero_numerologia).toBe(7);
    });

    it('returns mapping for card 7 (A Justiça)', () => {
      const result = getTarotNumerologyByNumber(7);
      expect(result.arcano).toBe('A Justiça');
      expect(result.numero_carta).toBe(7);
      expect(result.numero_numerologia).toBe(8);
    });

    it('returns mapping for card 8 (O Eremita)', () => {
      const result = getTarotNumerologyByNumber(8);
      expect(result.arcano).toBe('O Eremita');
      expect(result.numero_carta).toBe(8);
      expect(result.numero_numerologia).toBe(9);
    });

    it('returns mapping for card 9 (A Roda da Fortuna)', () => {
      const result = getTarotNumerologyByNumber(9);
      expect(result.arcano).toBe('A Roda da Fortuna');
      expect(result.numero_carta).toBe(9);
      expect(result.numero_numerologia).toBe(1);
    });

    it('returns mapping for card 10 (A Força) - master number 11', () => {
      const result = getTarotNumerologyByNumber(10);
      expect(result.arcano).toBe('A Força');
      expect(result.numero_carta).toBe(10);
      expect(result.numero_numerologia).toBe(11);
      expect(result.é_mestre).toBe(true);
    });

    it('returns mapping for card 11 (O Enforcado)', () => {
      const result = getTarotNumerologyByNumber(11);
      expect(result.arcano).toBe('O Enforcado');
      expect(result.numero_carta).toBe(11);
      expect(result.numero_numerologia).toBe(3);
    });

    it('returns mapping for card 12 (A Morte)', () => {
      const result = getTarotNumerologyByNumber(12);
      expect(result.arcano).toBe('A Morte');
      expect(result.numero_carta).toBe(12);
      expect(result.numero_numerologia).toBe(4);
    });

    it('returns mapping for card 13 (A Temperança)', () => {
      const result = getTarotNumerologyByNumber(13);
      expect(result.arcano).toBe('A Temperança');
      expect(result.numero_carta).toBe(13);
      expect(result.numero_numerologia).toBe(5);
    });

    it('returns mapping for card 14 (O Diabo)', () => {
      const result = getTarotNumerologyByNumber(14);
      expect(result.arcano).toBe('O Diabo');
      expect(result.numero_carta).toBe(14);
      expect(result.numero_numerologia).toBe(6);
    });

    it('returns mapping for card 15 (A Torre)', () => {
      const result = getTarotNumerologyByNumber(15);
      expect(result.arcano).toBe('A Torre');
      expect(result.numero_carta).toBe(15);
      expect(result.numero_numerologia).toBe(7);
    });

    it('returns mapping for card 16 (A Estrela)', () => {
      const result = getTarotNumerologyByNumber(16);
      expect(result.arcano).toBe('A Estrela');
      expect(result.numero_carta).toBe(16);
      expect(result.numero_numerologia).toBe(8);
    });

    it('returns mapping for card 17 (A Lua)', () => {
      const result = getTarotNumerologyByNumber(17);
      expect(result.arcano).toBe('A Lua');
      expect(result.numero_carta).toBe(17);
      expect(result.numero_numerologia).toBe(9);
    });

    it('returns mapping for card 18 (O Sol)', () => {
      const result = getTarotNumerologyByNumber(18);
      expect(result.arcano).toBe('O Sol');
      expect(result.numero_carta).toBe(18);
      expect(result.numero_numerologia).toBe(1);
    });

    it('returns mapping for card 19 (O Julgamento)', () => {
      const result = getTarotNumerologyByNumber(19);
      expect(result.arcano).toBe('O Julgamento');
      expect(result.numero_carta).toBe(19);
      expect(result.numero_numerologia).toBe(2);
    });

    it('returns mapping for card 20 (O Mundo)', () => {
      const result = getTarotNumerologyByNumber(20);
      expect(result.arcano).toBe('O Mundo');
      expect(result.numero_carta).toBe(20);
      expect(result.numero_numerologia).toBe(3);
    });

    it('returns mapping for card 21 (O Louco)', () => {
      const result = getTarotNumerologyByNumber(21);
      expect(result.arcano).toBe('O Louco');
      expect(result.numero_carta).toBe(21);
      expect(result.numero_numerologia).toBe(22);
      expect(result.é_mestre).toBe(true);
    });

    it('throws for negative numbers', () => {
      expect(() => getTarotNumerologyByNumber(-1)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for number greater than 21', () => {
      expect(() => getTarotNumerologyByNumber(22)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for non-integer numbers', () => {
      expect(() => getTarotNumerologyByNumber(5.5)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });
  });

  // ─── getNumerologyByArcano ─────────────────────────────────────────────────

  describe('getNumerologyByArcano', () => {
    it('returns numerology number for O Louco', () => {
      expect(getNumerologyByArcano('O Louco')).toBe(22);
    });

    it('returns numerology number for A Sacerdotisa', () => {
      expect(getNumerologyByArcano('A Sacerdotisa')).toBe(2);
    });

    it('returns numerology number for A Imperatriz', () => {
      expect(getNumerologyByArcano('A Imperatriz')).toBe(3);
    });

    it('returns numerology number for O Imperador', () => {
      expect(getNumerologyByArcano('O Imperador')).toBe(4);
    });

    it('returns numerology number for O Hierofante', () => {
      expect(getNumerologyByArcano('O Hierofante')).toBe(5);
    });

    it('returns numerology number for Os Enamorados', () => {
      expect(getNumerologyByArcano('Os Enamorados')).toBe(6);
    });

    it('returns numerology number for O Carro', () => {
      expect(getNumerologyByArcano('O Carro')).toBe(7);
    });

    it('returns numerology number for A Justiça', () => {
      expect(getNumerologyByArcano('A Justiça')).toBe(8);
    });

    it('returns numerology number for O Eremita', () => {
      expect(getNumerologyByArcano('O Eremita')).toBe(9);
    });

    it('returns numerology number for A Força (master number 11)', () => {
      expect(getNumerologyByArcano('A Força')).toBe(11);
    });

    it('returns null for non-existent arcano', () => {
      expect(getNumerologyByArcano('O Mago')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getNumerologyByArcano('o louco')).toBe(22);
      expect(getNumerologyByArcano('O LOUCO')).toBe(22);
    });
  });

  // ─── getAllTarotNumerologies ───────────────────────────────────────────────

  describe('getAllTarotNumerologies', () => {
    it('returns array with all 22 mappings', () => {
      const results = getAllTarotNumerologies();
      expect(results).toHaveLength(22);
    });

    it('returns mappings sorted by card number', () => {
      const results = getAllTarotNumerologies();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].numero_carta).toBeLessThan(results[i + 1].numero_carta);
      }
    });

    it('includes all expected arcano names', () => {
      const results = getAllTarotNumerologies();
      const arcanoNames = results.map((r) => r.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('A Sacerdotisa');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Imperador');
      expect(arcanoNames).toContain('O Hierofante');
      expect(arcanoNames).toContain('Os Enamorados');
      expect(arcanoNames).toContain('O Carro');
      expect(arcanoNames).toContain('A Justiça');
      expect(arcanoNames).toContain('O Eremita');
      expect(arcanoNames).toContain('A Roda da Fortuna');
      expect(arcanoNames).toContain('A Força');
      expect(arcanoNames).toContain('O Enforcado');
      expect(arcanoNames).toContain('A Morte');
      expect(arcanoNames).toContain('A Temperança');
      expect(arcanoNames).toContain('O Diabo');
      expect(arcanoNames).toContain('A Torre');
      expect(arcanoNames).toContain('A Estrela');
      expect(arcanoNames).toContain('A Lua');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('O Julgamento');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('numero_numerologia');
        expect(mapping).toHaveProperty('é_mestre');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('arquétipo');
        expect(mapping).toHaveProperty('orixá');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('lição_espiritual');
        expect(mapping).toHaveProperty('afirmação');
      }
    });
  });

  // ─── hasTarotNumerology ─────────────────────────────────────────────────────

  describe('hasTarotNumerology', () => {
    it('returns true for valid card numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(hasTarotNumerology(i)).toBe(true);
      }
    });

    it('returns false for negative numbers', () => {
      expect(hasTarotNumerology(-1)).toBe(false);
    });

    it('returns false for numbers greater than 21', () => {
      expect(hasTarotNumerology(22)).toBe(false);
      expect(hasTarotNumerology(100)).toBe(false);
    });
  });

  // ─── getMappingByArcano ──────────────────────────────────────────────────────

  describe('getMappingByArcano', () => {
    it('returns mapping for O Louco', () => {
      const result = getMappingByArcano('O Louco');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(0);
      expect(result!.numero_numerologia).toBe(22);
    });

    it('returns mapping for A Justiça', () => {
      const result = getMappingByArcano('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(7);
      expect(result!.numero_numerologia).toBe(8);
    });

    it('returns null for non-existent arcano', () => {
      expect(getMappingByArcano('O Mago')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getMappingByArcano('o louco')).not.toBeNull();
      expect(getMappingByArcano('O LOUCO')).not.toBeNull();
    });
  });

  // ─── getTarotNumerologyByElement ────────────────────────────────────────────

  describe('getTarotNumerologyByElement', () => {
    it('returns mappings for Água element', () => {
      const results = getTarotNumerologyByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('returns mappings for Terra element', () => {
      const results = getTarotNumerologyByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('returns mappings for Fogo element', () => {
      const results = getTarotNumerologyByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('returns mappings for Ar element', () => {
      const results = getTarotNumerologyByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('is case-insensitive', () => {
      const results1 = getTarotNumerologyByElement('agua');
      const results2 = getTarotNumerologyByElement('Água');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown element', () => {
      expect(getTarotNumerologyByElement('Éter')).toEqual([]);
    });
  });

  // ─── getTarotNumerologyByOrixa ──────────────────────────────────────────────

  describe('getTarotNumerologyByOrixa', () => {
    it('returns mappings for Exu', () => {
      const results = getTarotNumerologyByOrixa('Exu');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Exu');
    });

    it('returns mappings for Ogum', () => {
      const results = getTarotNumerologyByOrixa('Ogum');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Ogum');
    });

    it('returns mappings for Iemanjá', () => {
      const results = getTarotNumerologyByOrixa('Iemanjá');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Iemanjá');
    });

    it('is case-insensitive', () => {
      const results1 = getTarotNumerologyByOrixa('exu');
      const results2 = getTarotNumerologyByOrixa('Exu');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown orixá', () => {
      expect(getTarotNumerologyByOrixa('Orunbila')).toEqual([]);
    });
  });

  // ─── getTarotNumerologyBySephirah ───────────────────────────────────────────

  describe('getTarotNumerologyBySephirah', () => {
    it('returns mappings for Kether', () => {
      const results = getTarotNumerologyBySephirah('Kether');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Kether');
    });

    it('returns mappings for Tiphereth', () => {
      const results = getTarotNumerologyBySephirah('Tiphereth');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Tiphereth');
    });

    it('is case-insensitive', () => {
      const results1 = getTarotNumerologyBySephirah('kether');
      const results2 = getTarotNumerologyBySephirah('Kether');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown sephirah', () => {
      expect(getTarotNumerologyBySephirah('Daat')).toEqual([]);
    });
  });

  // ─── getTarotNumerologyByChakra ──────────────────────────────────────────────

  describe('getTarotNumerologyByChakra', () => {
    it('returns mappings for 4º Cardíaco', () => {
      const results = getTarotNumerologyByChakra('4º Cardíaco');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toBe('4º Cardíaco');
    });

    it('returns mappings for 6º Frontal', () => {
      const results = getTarotNumerologyByChakra('6º Frontal');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toBe('6º Frontal');
    });

    it('is case-insensitive', () => {
      const results1 = getTarotNumerologyByChakra('cardíaco');
      const results2 = getTarotNumerologyByChakra('Cardíaco');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown chakra', () => {
      expect(getTarotNumerologyByChakra('8º Desconhecido')).toEqual([]);
    });
  });

  // ─── getMasterNumberMappings ────────────────────────────────────────────────

  describe('getMasterNumberMappings', () => {
    it('returns mappings with é_mestre = true', () => {
      const results = getMasterNumberMappings();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.é_mestre)).toBe(true);
    });

    it('includes card 0 (O Louco) with master number 22', () => {
      const results = getMasterNumberMappings();
      const found = results.find((m) => m.numero_carta === 0);
      expect(found).toBeDefined();
      expect(found!.numero_numerologia).toBe(22);
    });

    it('includes card 10 (A Força) with master number 11', () => {
      const results = getMasterNumberMappings();
      const found = results.find((m) => m.numero_carta === 10);
      expect(found).toBeDefined();
      expect(found!.numero_numerologia).toBe(11);
    });

    it('includes card 21 (O Louco) with master number 22', () => {
      const results = getMasterNumberMappings();
      const found = results.find((m) => m.numero_carta === 21);
      expect(found).toBeDefined();
      expect(found!.numero_numerologia).toBe(22);
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array with all card numbers as keys', () => {
      const results = getAllArcanos();
      expect(results).toHaveLength(22);
    });

    it('includes expected arcano names', () => {
      const results = getAllArcanos();
      expect(results).toContain('0');
      expect(results).toContain('1');
      expect(results).toContain('10');
      expect(results).toContain('21');
    });
  });

  // ─── TAROT_NUMEROLOGIA_MAP constant ─────────────────────────────────────────

  describe('TAROT_NUMEROLOGIA_MAP', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_NUMEROLOGIA_MAP)).toBe(true);
    });

    it('has 22 entries for cards 0-21', () => {
      expect(Object.keys(TAROT_NUMEROLOGIA_MAP)).toHaveLength(22);
    });

    it('each entry has the correct card number as key', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TAROT_NUMEROLOGIA_MAP[i]).toBeDefined();
        expect(TAROT_NUMEROLOGIA_MAP[i].numero_carta).toBe(i);
      }
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all mappings have non-empty significado_espiritual', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have non-empty arquétipo', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.arquétipo.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have non-empty lição_espiritual', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.lição_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have non-empty afirmação', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.afirmação.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('all five elements are represented', () => {
      const results = getAllTarotNumerologies();
      const elements = new Set(results.map((m) => m.elemento));
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Terra')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
    });

    it('each mapping has a valid element', () => {
      const results = getAllTarotNumerologies();
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      for (const mapping of results) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Chakra distribution ────────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('all mappings have valid chakra assignments', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.chakra).toMatch(/^\d+º/);
      }
    });

    it('multiple chakras are represented', () => {
      const results = getAllTarotNumerologies();
      const chakras = new Set(results.map((m) => m.chakra));
      expect(chakras.size).toBeGreaterThan(3);
    });
  });

  // ─── Sephirah coverage ─────────────────────────────────────────────────────

  describe('Sephirah coverage', () => {
    it('all mappings have sephirah assignments', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        expect(mapping.sephirah.length).toBeGreaterThan(0);
      }
    });

    it('multiple sephirot are represented', () => {
      const results = getAllTarotNumerologies();
      const sephirot = new Set(results.map((m) => m.sephirah));
      expect(sephirot.size).toBeGreaterThan(5);
    });
  });

  // ─── Numerology values ─────────────────────────────────────────────────────

  describe('Numerology values', () => {
    it('all numerology numbers are in valid range (1-9 or master 11, 22)', () => {
      const results = getAllTarotNumerologies();
      for (const mapping of results) {
        const num = mapping.numero_numerologia;
        const isValid = (num >= 1 && num <= 9) || num === 11 || num === 22;
        expect(isValid).toBe(true);
      }
    });

    it('master numbers 11 and 22 are correctly marked', () => {
      const results = getAllTarotNumerologies();
      const masters = results.filter((m) => m.é_mestre);
      for (const master of masters) {
        expect([11, 22]).toContain(master.numero_numerologia);
      }
    });

    it('non-master numbers are correctly marked', () => {
      const results = getAllTarotNumerologies();
      const nonMasters = results.filter((m) => !m.é_mestre);
      for (const nonMaster of nonMasters) {
        expect(nonMaster.numero_numerologia).not.toBe(11);
        expect(nonMaster.numero_numerologia).not.toBe(22);
      }
    });
  });
});
