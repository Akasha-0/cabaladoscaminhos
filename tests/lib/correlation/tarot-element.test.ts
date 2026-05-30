import { describe, it, expect } from 'vitest';
import {
  getTarotElement,
  getElementTarot,
  getAllTarotElements,
  getAllArcanos,
  hasTarotElement,
  getArcanoByNumber,
  getElementByNumber,
  getChakraByNumber,
  getArcanosByElement,
  getArcanosByChakra,
  getElementDistribution,
  TAROT_ELEMENT_MAPPINGS,
  type TarotElementMapping,
} from '@/lib/correlation/tarot-element';

describe('tarot-element', () => {
  // ─── getTarotElement: valid arcanos ─────────────────────────────────────────

  describe('getTarotElement', () => {
    it('returns mapping for "O Sol"', () => {
      const result = getTarotElement('O Sol');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for "A Lua"', () => {
      const result = getTarotElement('A Lua');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.numero_carta).toBe(18);
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for "O Mago"', () => {
      const result = getTarotElement('O Mago');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for "A Imperatriz"', () => {
      const result = getTarotElement('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.elemento).toBe('Terra');
    });

    it('returns mapping for "O Imperador"', () => {
      const result = getTarotElement('O Imperador');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.numero_carta).toBe(4);
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotElement('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotElement('')).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(getTarotElement(undefined as unknown as string)).toBeNull();
    });

    it('includes chakra information', () => {
      const result = getTarotElement('O Sol');
      expect(result?.chakra).toBe('Manipura');
    });

    it('includes spiritual meaning', () => {
      const result = getTarotElement('O Sol');
      expect(result?.significado_espiritual).toBeTruthy();
    });
  });

  // ─── getElementTarot ─────────────────────────────────────────────────────────

  describe('getElementTarot', () => {
    it('returns arcano for Fogo element', () => {
      const result = getElementTarot('Fogo');
      expect(result).toBe('O Imperador');
    });

    it('returns arcano for Água element', () => {
      const result = getElementTarot('Água');
      expect(result).toBe('A Sacerdotisa');
    });

    it('returns arcano for Ar element', () => {
      const result = getElementTarot('Ar');
      expect(result).toBe('O Louco');
    });

    it('returns arcano for Terra element', () => {
      const result = getElementTarot('Terra');
      expect(result).toBe('A Imperatriz');
    });

    it('returns null for unknown element', () => {
      expect(getElementTarot('Éter')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getElementTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotElements ─────────────────────────────────────────────────────

  describe('getAllTarotElements', () => {
    it('returns array with all mappings', () => {
      const result = getAllTarotElements();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('contains expected major arcana', () => {
      const result = getAllTarotElements();
      const names = result.map(m => m.arcano);
      expect(names).toContain('O Sol');
      expect(names).toContain('A Lua');
      expect(names).toContain('O Mago');
      expect(names).toContain('O Mundo');
    });

    it('each mapping has required fields', () => {
      const result = getAllTarotElements();
      result.forEach(mapping => {
        expect(mapping.arcano).toBeTruthy();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(['Fogo', 'Água', 'Ar', 'Terra']).toContain(mapping.elemento);
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
      });
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
    });

    it('includes all 22 major arcana', () => {
      const result = getAllArcanos();
      expect(result.length).toBe(22);
    });

    it('includes O Louco (card 0)', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
    });

    it('includes O Mundo (card 21)', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mundo');
    });
  });

  // ─── hasTarotElement ─────────────────────────────────────────────────────────

  describe('hasTarotElement', () => {
    it('returns true for existing arcano', () => {
      expect(hasTarotElement('O Sol')).toBe(true);
    });

    it('returns true for A Lua', () => {
      expect(hasTarotElement('A Lua')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotElement('Inexistente')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotElement('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for card 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for card 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns O Sol for card 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns O Mundo for card 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
    });

    it('returns null for negative number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getElementByNumber ──────────────────────────────────────────────────────

  describe('getElementByNumber', () => {
    it('returns Ar for card 0 (O Louco)', () => {
      expect(getElementByNumber(0)).toBe('Ar');
    });

    it('returns Ar for card 1 (O Mago)', () => {
      expect(getElementByNumber(1)).toBe('Ar');
    });

    it('returns Fogo for card 19 (O Sol)', () => {
      expect(getElementByNumber(19)).toBe('Fogo');
    });

    it('returns null for invalid number', () => {
      expect(getElementByNumber(99)).toBeNull();
    });
  });

  // ─── getChakraByNumber ──────────────────────────────────────────────────────

  describe('getChakraByNumber', () => {
    it('returns Sahassara for card 0 (O Louco)', () => {
      expect(getChakraByNumber(0)).toBe('Sahassara');
    });

    it('returns Ajna for card 1 (O Mago)', () => {
      expect(getChakraByNumber(1)).toBe('Ajna');
    });

    it('returns Manipura for card 19 (O Sol)', () => {
      expect(getChakraByNumber(19)).toBe('Manipura');
    });

    it('returns null for invalid number', () => {
      expect(getChakraByNumber(99)).toBeNull();
    });
  });

  // ─── getArcanosByElement ────────────────────────────────────────────────────

  describe('getArcanosByElement', () => {
    it('returns all Fogo arcana', () => {
      const result = getArcanosByElement('Fogo');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Carro');
      expect(result).toContain('A Força');
      expect(result).toContain('O Sol');
      // Note: O Louco is Ar, not Fogo
    });

    it('returns all Água arcana', () => {
      const result = getArcanosByElement('Água');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('A Lua');
    });

    it('returns all Ar arcana', () => {
      const result = getArcanosByElement('Ar');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
    });

    it('returns all Terra arcana', () => {
      const result = getArcanosByElement('Terra');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('A Imperatriz');
    });

    it('returns empty array for unknown element', () => {
      const result = getArcanosByElement('Éter');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // ─── getArcanosByChakra ──────────────────────────────────────────────────────

  describe('getArcanosByChakra', () => {
    it('returns arcana for Ajna chakra', () => {
      const result = getArcanosByChakra('Ajna');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns arcana for Sahassara chakra', () => {
      const result = getArcanosByChakra('Sahassara');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('O Louco');
    });

    it('includes secondary chakra matches', () => {
      const result = getArcanosByChakra('Anahata');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown chakra', () => {
      const result = getArcanosByChakra('Desconhecido');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // ─── getElementDistribution ─────────────────────────────────────────────────

  describe('getElementDistribution', () => {
    it('returns object with all four elements', () => {
      const result = getElementDistribution();
      expect(result).toHaveProperty('Fogo');
      expect(result).toHaveProperty('Água');
      expect(result).toHaveProperty('Ar');
      expect(result).toHaveProperty('Terra');
    });

    it('returns numbers for each element', () => {
      const result = getElementDistribution();
      expect(typeof result.Fogo).toBe('number');
      expect(typeof result.Água).toBe('number');
      expect(typeof result.Ar).toBe('number');
      expect(typeof result.Terra).toBe('number');
    });

    it('totals 22 arcana across elements', () => {
      const result = getElementDistribution();
      const total = result.Fogo + result.Água + result.Ar + result.Terra;
      expect(total).toBe(22);
    });

    it('has all elements represented', () => {
      const result = getElementDistribution();
      expect(result.Fogo).toBeGreaterThan(0);
      expect(result.Água).toBeGreaterThan(0);
      expect(result.Ar).toBeGreaterThan(0);
      expect(result.Terra).toBeGreaterThan(0);
    });
  });

  // ─── TAROT_ELEMENT_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_ELEMENT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_ELEMENT_MAPPINGS)).toBe(true);
    });

    it('can be accessed by arcano name', () => {
      const mapping = TAROT_ELEMENT_MAPPINGS['O Sol'];
      expect(mapping).toBeDefined();
      expect(mapping.elemento).toBe('Fogo');
    });

    it('contains expected arcana', () => {
      expect(TAROT_ELEMENT_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_ELEMENT_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_ELEMENT_MAPPINGS['O Mundo']).toBeDefined();
    });

    it('inner objects are also frozen', () => {
      const mapping = TAROT_ELEMENT_MAPPINGS['O Sol'];
      expect(Object.isFrozen(mapping)).toBe(true);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotElementMapping interface completeness', () => {
    it('contains all required fields', () => {
      const mapping = getTarotElement('O Sol');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('chakra');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('orientacao_energetica');
    });

    it('has optional chakra_secundario when present', () => {
      const oLoco = getTarotElement('O Louco');
      expect(oLoco?.chakra_secundario).toBeDefined();
      expect(oLoco?.chakra_secundario).toBe('Ajna');
    });
  });

  // ─── Element-Arcano consistency ─────────────────────────────────────────────

  describe('Element-Arcano consistency', () => {
    it('O Sol is Fogo element with Manipura chakra', () => {
      const mapping = getTarotElement('O Sol');
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.chakra).toBe('Manipura');
    });

    it('A Lua is Água element with Ajna chakra', () => {
      const mapping = getTarotElement('A Lua');
      expect(mapping?.elemento).toBe('Água');
      expect(mapping?.chakra).toBe('Ajna');
    });

    it('O Mago is Ar element with Ajna chakra', () => {
      const mapping = getTarotElement('O Mago');
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.chakra).toBe('Ajna');
    });

    it('A Imperatriz is Terra element with Anahata chakra', () => {
      const mapping = getTarotElement('A Imperatriz');
      expect(mapping?.elemento).toBe('Terra');
      expect(mapping?.chakra).toBe('Anahata');
    });

    it('card numbers are consistent with arcano', () => {
      const mapping = getTarotElement('O Mundo');
      expect(mapping?.numero_carta).toBe(21);
    });
  });
});