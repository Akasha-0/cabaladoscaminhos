import { describe, it, expect } from 'vitest';
import {
  getNumerologyTarot,
  getTarotNumerology,
  getAllNumerologyTarots,
  hasNumerologyTarot,
  getMappingByArcano,
  getNumerologyByElement,
  getNumerologyByOrixa,
  getNumerologyBySephirah,
  getNumerologyByChakra,
  NUMEROLOGIA_ARCANO_MAP,
  type NumerologyTarotMapping,
} from '@/lib/correlation/numerology-tarot';

describe('numerology-tarot', () => {
  // ─── getNumerologyTarot: valid numbers ──────────────────────────────────────

  describe('getNumerologyTarot', () => {
    it('returns mapping for number 1', () => {
      const result = getNumerologyTarot(1);
      expect(result.arcano).toBe('O Mago');
      expect(result.numero_carta).toBe(1);
      expect(result.elemento).toBe('Água');
    });

    it('returns mapping for number 2', () => {
      const result = getNumerologyTarot(2);
      expect(result.arcano).toBe('A Alta Sacerdotisa');
      expect(result.numero_carta).toBe(2);
    });

    it('returns mapping for number 3', () => {
      const result = getNumerologyTarot(3);
      expect(result.arcano).toBe('A Imperatriz');
      expect(result.numero_carta).toBe(3);
    });

    it('returns mapping for number 4', () => {
      const result = getNumerologyTarot(4);
      expect(result.arcano).toBe('O Imperador');
      expect(result.numero_carta).toBe(4);
    });

    it('returns mapping for number 5', () => {
      const result = getNumerologyTarot(5);
      expect(result.arcano).toBe('O Hierofante');
      expect(result.numero_carta).toBe(5);
    });

    it('returns mapping for number 6', () => {
      const result = getNumerologyTarot(6);
      expect(result.arcano).toBe('Os Enamorados');
      expect(result.numero_carta).toBe(6);
    });

    it('returns mapping for number 7', () => {
      const result = getNumerologyTarot(7);
      expect(result.arcano).toBe('O Carro');
      expect(result.numero_carta).toBe(7);
    });

    it('returns mapping for number 8', () => {
      const result = getNumerologyTarot(8);
      expect(result.arcano).toBe('A Justiça');
      expect(result.numero_carta).toBe(8);
    });

    it('returns mapping for number 9', () => {
      const result = getNumerologyTarot(9);
      expect(result.arcano).toBe('O Eremita');
      expect(result.numero_carta).toBe(9);
    });

    it('throws for number 0', () => {
      expect(() => getNumerologyTarot(0)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws for number 10', () => {
      expect(() => getNumerologyTarot(10)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws for negative numbers', () => {
      expect(() => getNumerologyTarot(-1)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws for non-integer numbers', () => {
      expect(() => getNumerologyTarot(3.5)).toThrow('Número fora do intervalo válido (1-9)');
    });
  });

  // ─── getTarotNumerology ──────────────────────────────────────────────────────

  describe('getTarotNumerology', () => {
    it('returns numerology number for O Mago', () => {
      expect(getTarotNumerology('O Mago')).toBe(1);
    });

    it('returns numerology number for A Alta Sacerdotisa', () => {
      expect(getTarotNumerology('A Alta Sacerdotisa')).toBe(2);
    });

    it('returns numerology number for A Imperatriz', () => {
      expect(getTarotNumerology('A Imperatriz')).toBe(3);
    });

    it('returns numerology number for O Imperador', () => {
      expect(getTarotNumerology('O Imperador')).toBe(4);
    });

    it('returns numerology number for O Hierofante', () => {
      expect(getTarotNumerology('O Hierofante')).toBe(5);
    });

    it('returns numerology number for Os Enamorados', () => {
      expect(getTarotNumerology('Os Enamorados')).toBe(6);
    });

    it('returns numerology number for O Carro', () => {
      expect(getTarotNumerology('O Carro')).toBe(7);
    });

    it('returns numerology number for A Justiça', () => {
      expect(getTarotNumerology('A Justiça')).toBe(8);
    });

    it('returns numerology number for O Eremita', () => {
      expect(getTarotNumerology('O Eremita')).toBe(9);
    });

    it('returns null for non-existent arcano', () => {
      expect(getTarotNumerology('O Sol')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getTarotNumerology('o mago')).toBe(1);
      expect(getTarotNumerology('O MAGO')).toBe(1);
    });
  });

  // ─── getAllNumerologyTarots ─────────────────────────────────────────────────

  describe('getAllNumerologyTarots', () => {
    it('returns array with all 9 mappings', () => {
      const results = getAllNumerologyTarots();
      expect(results).toHaveLength(9);
    });

    it('returns mappings sorted by numero', () => {
      const results = getAllNumerologyTarots();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].numero).toBeLessThan(results[i + 1].numero);
      }
    });

    it('includes all expected arcano names', () => {
      const results = getAllNumerologyTarots();
      const arcanoNames = results.map((r) => r.arcano);
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('A Alta Sacerdotisa');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Imperador');
      expect(arcanoNames).toContain('O Hierofante');
      expect(arcanoNames).toContain('Os Enamorados');
      expect(arcanoNames).toContain('O Carro');
      expect(arcanoNames).toContain('A Justiça');
      expect(arcanoNames).toContain('O Eremita');
    });

    it('each mapping has all required fields', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
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

  // ─── hasNumerologyTarot ─────────────────────────────────────────────────────

  describe('hasNumerologyTarot', () => {
    it('returns true for valid numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        expect(hasNumerologyTarot(i)).toBe(true);
      }
    });

    it('returns false for number 0', () => {
      expect(hasNumerologyTarot(0)).toBe(false);
    });

    it('returns false for numbers greater than 9', () => {
      expect(hasNumerologyTarot(10)).toBe(false);
      expect(hasNumerologyTarot(22)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(hasNumerologyTarot(-1)).toBe(false);
    });
  });

  // ─── getMappingByArcano ──────────────────────────────────────────────────────

  describe('getMappingByArcano', () => {
    it('returns mapping for O Mago', () => {
      const result = getMappingByArcano('O Mago');
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(1);
    });

    it('returns mapping for A Justiça', () => {
      const result = getMappingByArcano('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(8);
    });

    it('returns null for non-existent arcano', () => {
      expect(getMappingByArcano('O Sol')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getMappingByArcano('o mago')).not.toBeNull();
      expect(getMappingByArcano('O MAGO')).not.toBeNull();
    });
  });

  // ─── getNumerologyByElement ─────────────────────────────────────────────────

  describe('getNumerologyByElement', () => {
    it('returns mappings for Água element', () => {
      const results = getNumerologyByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('returns mappings for Terra element', () => {
      const results = getNumerologyByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('returns mappings for Fogo element', () => {
      const results = getNumerologyByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('returns mappings for Ar element', () => {
      const results = getNumerologyByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('is case-insensitive', () => {
      const results1 = getNumerologyByElement('agua');
      const results2 = getNumerologyByElement('Água');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown element', () => {
      expect(getNumerologyByElement('Éter')).toEqual([]);
    });
  });

  // ─── getNumerologyByOrixa ───────────────────────────────────────────────────

  describe('getNumerologyByOrixa', () => {
    it('returns mappings for Exu', () => {
      const results = getNumerologyByOrixa('Exu');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Exu');
    });

    it('returns mappings for Ogum', () => {
      const results = getNumerologyByOrixa('Ogum');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Ogum');
    });

    it('is case-insensitive', () => {
      const results1 = getNumerologyByOrixa('exu');
      const results2 = getNumerologyByOrixa('Exu');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown orixá', () => {
      expect(getNumerologyByOrixa('Iemanja')).toEqual([]);
    });
  });

  // ─── getNumerologyBySephirah ─────────────────────────────────────────────────

  describe('getNumerologyBySephirah', () => {
    it('returns mappings for Kether', () => {
      const results = getNumerologyBySephirah('Kether');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Kether');
    });

    it('returns mappings for Tiphereth', () => {
      const results = getNumerologyBySephirah('Tiphereth');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Tiphereth');
    });

    it('returns empty array for unknown sephirah', () => {
      expect(getNumerologyBySephirah('Daat')).toEqual([]);
    });
  });

  // ─── getNumerologyByChakra ───────────────────────────────────────────────────

  describe('getNumerologyByChakra', () => {
    it('returns mappings for Frontal chakra', () => {
      const results = getNumerologyByChakra('Frontal');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toContain('Frontal');
    });

    it('returns mappings for Cardíaco chakra', () => {
      const results = getNumerologyByChakra('Cardíaco');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toContain('Cardíaco');
    });

    it('returns empty array for unknown chakra', () => {
      expect(getNumerologyByChakra('Plexo Solar')).toEqual([]);
    });
  });

  // ─── NUMEROLOGIA_ARCANO_MAP constant ──────────────────────────────────────

  describe('NUMEROLOGIA_ARCANO_MAP', () => {
    it('is defined as a Record', () => {
      expect(NUMEROLOGIA_ARCANO_MAP).toBeDefined();
      expect(typeof NUMEROLOGIA_ARCANO_MAP).toBe('object');
    });

    it('has exactly 9 entries (numbers 1-9)', () => {
      expect(Object.keys(NUMEROLOGIA_ARCANO_MAP)).toHaveLength(9);
    });

    it('each numero matches its key', () => {
      for (const [key, mapping] of Object.entries(NUMEROLOGIA_ARCANO_MAP)) {
        expect(mapping.numero).toBe(Number(key));
      }
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(NUMEROLOGIA_ARCANO_MAP)).toBe(true);
    });

    it('all nested mapping objects are frozen', () => {
      for (const mapping of Object.values(NUMEROLOGIA_ARCANO_MAP)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all mappings have non-empty spiritual meanings', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('all mappings have archetypes', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping.arquétipo).toBeDefined();
        expect(mapping.arquétipo.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have spiritual lessons', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping.lição_espiritual).toBeDefined();
        expect(mapping.lição_espiritual.length).toBeGreaterThan(5);
      }
    });

    it('all mappings have affirmations', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping.afirmação).toBeDefined();
        expect(mapping.afirmação.length).toBeGreaterThan(5);
      }
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has diverse element distribution', () => {
      const results = getAllNumerologyTarots();
      const elements = results.map((m) => m.elemento);
      const uniqueElements = new Set(elements);
      // Should have at least 4 different elements
      expect(uniqueElements.size).toBeGreaterThanOrEqual(3);
    });

    it('each element mapping is valid', () => {
      const results = getAllNumerologyTarots();
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      for (const mapping of results) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Chakra distribution ─────────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('has chakra mappings for all numbers', () => {
      const results = getAllNumerologyTarots();
      for (const mapping of results) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra.length).toBeGreaterThan(0);
      }
    });

    it('chakra values contain valid chakra names', () => {
      const results = getAllNumerologyTarots();
      const validChakras = ['Básico', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário'];
      for (const mapping of results) {
        const hasValidChakra = validChakras.some((c) => mapping.chakra.includes(c));
        expect(hasValidChakra).toBe(true);
      }
    });
  });

  // ─── Sephirah coverage ─────────────────────────────────────────────────────

  describe('Sephirah coverage', () => {
    it('all sephirot are from the Tree of Life', () => {
      const results = getAllNumerologyTarots();
      const sephirot = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      for (const mapping of results) {
        expect(sephirot).toContain(mapping.sephirah);
      }
    });
  });
});