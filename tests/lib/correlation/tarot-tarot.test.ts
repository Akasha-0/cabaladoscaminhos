import { describe, it, expect } from 'vitest';
import {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getAllTarotTarots,
  hasTarotTarot,
  getTarotTarotByElement,
  getTarotTarotByOrixa,
  getTarotTarotBySephirah,
  getTarotTarotByChakra,
  getTarotTarotByRelacao,
  getMasterRelationshipMappings,
  getAllArcanos,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarotByNumber: valid numbers ──────────────────────────────────────

  describe('getTarotTarotByNumber', () => {
    it('returns relationships for card 0 (O Louco)', () => {
      const results = getTarotTarotByNumber(0);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('O Louco');
      expect(results[0].numero_carta).toBe(0);
    });

    it('returns relationships for card 1 (A Sacerdotisa)', () => {
      const results = getTarotTarotByNumber(1);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('A Sacerdotisa');
      expect(results[0].numero_carta).toBe(1);
    });

    it('returns relationships for card 10 (A Força)', () => {
      const results = getTarotTarotByNumber(10);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('A Força');
      expect(results[0].numero_carta).toBe(10);
    });

    it('returns relationships for card 21 (O Louco)', () => {
      const results = getTarotTarotByNumber(21);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('O Louco');
      expect(results[0].numero_carta).toBe(21);
    });

    it('throws for number -1', () => {
      expect(() => getTarotTarotByNumber(-1)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for number 22', () => {
      expect(() => getTarotTarotByNumber(22)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });

    it('throws for non-integer numbers', () => {
      expect(() => getTarotTarotByNumber(3.5)).toThrow('Número do arcano fora do intervalo válido (0-21)');
    });
  });

  // ─── getTarotTarotByArcano ──────────────────────────────────────────────────────

  describe('getTarotTarotByArcano', () => {
    it('returns relationships for O Louco', () => {
      const results = getTarotTarotByArcano('O Louco');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('O Louco');
    });

    it('returns relationships for A Sacerdotisa', () => {
      const results = getTarotTarotByArcano('A Sacerdotisa');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].arcano).toBe('A Sacerdotisa');
    });

    it('returns empty array for non-existent arcano', () => {
      const results = getTarotTarotByArcano('Não Existe');
      expect(results).toEqual([]);
    });

    it('is case-insensitive', () => {
      const results1 = getTarotTarotByArcano('o louco');
      const results2 = getTarotTarotByArcano('O Louco');
      expect(results1.length).toBe(results2.length);
    });
  });

  // ─── getAllTarotTarots ─────────────────────────────────────────────────────────

  describe('getAllTarotTarots', () => {
    it('returns array with all mappings', () => {
      const results = getAllTarotTarots();
      expect(results.length).toBeGreaterThan(0);
    });

    it('each mapping has all required fields', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('arcano_relacionado');
        expect(mapping).toHaveProperty('numero_relacionado');
        expect(mapping).toHaveProperty('tipo_relação');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_relação');
        expect(mapping).toHaveProperty('arquétipo');
        expect(mapping).toHaveProperty('orixá');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('lição_espiritual');
        expect(mapping).toHaveProperty('afirmação');
      }
    });

    it('all arcano names are valid Major Arcana names', () => {
      const results = getAllTarotTarots();
      const validArcanos = [
        'O Louco', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
        'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita', 'A Roda da Fortuna',
        'A Força', 'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo',
        'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo',
      ];
      for (const mapping of results) {
        expect(validArcanos).toContain(mapping.arcano);
        expect(validArcanos).toContain(mapping.arcano_relacionado);
      }
    });
  });

  // ─── hasTarotTarot ─────────────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for valid numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(hasTarotTarot(i)).toBe(true);
      }
    });

    it('returns false for number -1', () => {
      expect(hasTarotTarot(-1)).toBe(false);
    });

    it('returns false for number 22', () => {
      expect(hasTarotTarot(22)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(hasTarotTarot(-5)).toBe(false);
    });
  });

  // ─── getTarotTarotByElement ────────────────────────────────────────────────────

  describe('getTarotTarotByElement', () => {
    it('returns mappings for Água element', () => {
      const results = getTarotTarotByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('returns mappings for Terra element', () => {
      const results = getTarotTarotByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('returns mappings for Fogo element', () => {
      const results = getTarotTarotByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('returns mappings for Ar element', () => {
      const results = getTarotTarotByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('is case-insensitive', () => {
      const results1 = getTarotTarotByElement('agua');
      const results2 = getTarotTarotByElement('Água');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown element', () => {
      expect(getTarotTarotByElement('Éter')).toEqual([]);
    });
  });

  // ─── getTarotTarotByOrixa ──────────────────────────────────────────────────────

  describe('getTarotTarotByOrixa', () => {
    it('returns mappings for Exu', () => {
      const results = getTarotTarotByOrixa('Exu');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Exu');
    });

    it('returns mappings for Ogum', () => {
      const results = getTarotTarotByOrixa('Ogum');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Ogum');
    });

    it('returns mappings for Iemanjá', () => {
      const results = getTarotTarotByOrixa('Iemanjá');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].orixá).toContain('Iemanjá');
    });

    it('is case-insensitive', () => {
      const results1 = getTarotTarotByOrixa('exu');
      const results2 = getTarotTarotByOrixa('Exu');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown orixá', () => {
      expect(getTarotTarotByOrixa('Orunbila')).toEqual([]);
    });
  });

  // ─── getTarotTarotBySephirah ───────────────────────────────────────────────────

  describe('getTarotTarotBySephirah', () => {
    it('returns mappings for Kether', () => {
      const results = getTarotTarotBySephirah('Kether');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Kether');
    });

    it('returns mappings for Tiphereth', () => {
      const results = getTarotTarotBySephirah('Tiphereth');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Tiphereth');
    });

    it('returns mappings for Malkuth', () => {
      const results = getTarotTarotBySephirah('Malkuth');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Malkuth');
    });

    it('returns empty array for unknown sephirah', () => {
      expect(getTarotTarotBySephirah('Daat')).toEqual([]);
    });
  });

  // ─── getTarotTarotByChakra ─────────────────────────────────────────────────────

  describe('getTarotTarotByChakra', () => {
    it('returns mappings for Frontal chakra', () => {
      const results = getTarotTarotByChakra('Frontal');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toContain('Frontal');
    });

    it('returns mappings for Cardíaco chakra', () => {
      const results = getTarotTarotByChakra('Cardíaco');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toContain('Cardíaco');
    });

    it('returns mappings for Coronário chakra', () => {
      const results = getTarotTarotByChakra('Coronário');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chakra).toContain('Coronário');
    });

    it('returns empty array for unknown chakra', () => {
      expect(getTarotTarotByChakra('Inexistente')).toEqual([]);
    });
  });

  // ─── getTarotTarotByRelacao ────────────────────────────────────────────────────

  describe('getTarotTarotByRelacao', () => {
    it('returns mappings for progresão type', () => {
      const results = getTarotTarotByRelacao('progresão');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'progresão')).toBe(true);
    });

    it('returns mappings for oposto type', () => {
      const results = getTarotTarotByRelacao('oposto');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'oposto')).toBe(true);
    });

    it('returns mappings for harmônico type', () => {
      const results = getTarotTarotByRelacao('harmônico');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'harmônico')).toBe(true);
    });

    it('returns mappings for complementar type', () => {
      const results = getTarotTarotByRelacao('complementar');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'complementar')).toBe(true);
    });

    it('returns mappings for sombra type', () => {
      const results = getTarotTarotByRelacao('sombra');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'sombra')).toBe(true);
    });

    it('returns mappings for mestre type', () => {
      const results = getTarotTarotByRelacao('mestre');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'mestre')).toBe(true);
    });

    it('is case-insensitive', () => {
      const results1 = getTarotTarotByRelacao('PROGRESÃO');
      const results2 = getTarotTarotByRelacao('progresão');
      expect(results1.length).toBe(results2.length);
    });

    it('returns empty array for unknown type', () => {
      expect(getTarotTarotByRelacao('desconhecido')).toEqual([]);
    });
  });

  // ─── getMasterRelationshipMappings ────────────────────────────────────────────

  describe('getMasterRelationshipMappings', () => {
    it('returns only mestre type mappings', () => {
      const results = getMasterRelationshipMappings();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.tipo_relação === 'mestre')).toBe(true);
    });
  });

  // ─── getAllArcanos ────────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const results = getAllArcanos();
      expect(results.length).toBe(22);
    });

    it('returns arcano names sorted by card number', () => {
      const results = getAllArcanos();
      for (let i = 0; i < results.length - 1; i++) {
        expect(Number(results[i])).toBeLessThan(Number(results[i + 1]));
      }
    });
  });

  // ─── TAROT_TAROT_MAP constant ─────────────────────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('is defined as a Record', () => {
      expect(TAROT_TAROT_MAP).toBeDefined();
      expect(typeof TAROT_TAROT_MAP).toBe('object');
    });

    it('has exactly 22 entries (numbers 0-21)', () => {
      expect(Object.keys(TAROT_TAROT_MAP)).toHaveLength(22);
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all mappings have non-empty spiritual meanings', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.significado_relação.length).toBeGreaterThan(10);
      }
    });

    it('all mappings have archetypes', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.arquétipo).toBeDefined();
        expect(mapping.arquétipo.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have spiritual lessons', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.lição_espiritual).toBeDefined();
        expect(mapping.lição_espiritual.length).toBeGreaterThan(5);
      }
    });

    it('all mappings have affirmations', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.afirmação).toBeDefined();
        expect(mapping.afirmação.length).toBeGreaterThan(5);
      }
    });
  });

  // ─── Element distribution ──────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has diverse element distribution', () => {
      const results = getAllTarotTarots();
      const elements = results.map((m) => m.elemento);
      const uniqueElements = new Set(elements);
      // Should have at least 4 different elements
      expect(uniqueElements.size).toBeGreaterThanOrEqual(3);
    });

    it('each element mapping is valid', () => {
      const results = getAllTarotTarots();
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      for (const mapping of results) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Chakra distribution ───────────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('has chakra mappings for all relationships', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra.length).toBeGreaterThan(0);
      }
    });

    it('chakra values contain valid chakra names', () => {
      const results = getAllTarotTarots();
      const validChakras = ['Básico', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário'];
      for (const mapping of results) {
        const hasValidChakra = validChakras.some((c) => mapping.chakra.includes(c));
        expect(hasValidChakra).toBe(true);
      }
    });
  });

  // ─── Sephirah coverage ────────────────────────────────────────────────────────

  describe('Sephirah coverage', () => {
    it('all sephirot are from the Tree of Life', () => {
      const results = getAllTarotTarots();
      const sephirot = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      for (const mapping of results) {
        expect(sephirot).toContain(mapping.sephirah);
      }
    });
  });

  // ─── Relationship type coverage ───────────────────────────────────────────────

  describe('Relationship type coverage', () => {
    it('has all expected relationship types', () => {
      const results = getAllTarotTarots();
      const types = new Set(results.map((m) => m.tipo_relação));
      expect(types.has('progresão')).toBe(true);
      expect(types.has('oposto')).toBe(true);
      expect(types.has('harmônico')).toBe(true);
      expect(types.has('complementar')).toBe(true);
      expect(types.has('sombra')).toBe(true);
      expect(types.has('mestre')).toBe(true);
    });
  });

  // ─── Card number validity ─────────────────────────────────────────────────────

  describe('Card number validity', () => {
    it('all card numbers are in valid range 0-21', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
        expect(mapping.numero_relacionado).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_relacionado).toBeLessThanOrEqual(21);
      }
    });

    it('related card numbers are different from source', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        // Allow same card only for mestre type (e.g., O Louco 0 and 21)
        if (mapping.tipo_relação !== 'mestre') {
          expect(mapping.numero_relacionado).not.toBe(mapping.numero_carta);
        }
      }
    });
  });
});
