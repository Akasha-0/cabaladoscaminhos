/**
 * Tarot-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  getChakraByNumber,
  getArcanoByNumber,
  getArcanosByNumber,
  getOrixaByArcano,
  getArcanosByOrixa,
  getElementByArcano,
  getArcanosByElement,
  getArcanoCount,
  TAROT_CHAKRA_MAPPINGS,
} from '@/lib/correlation/tarot-chakra';

describe('Tarot-Chakra Correlation', () => {
  describe('getTarotChakra', () => {
    it('should return O Louco mapping with Ajna chakra', () => {
      const mapping = getTarotChakra('O Louco');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.chakra).toBe('Ajna');
      expect(mapping?.numero_chakra).toBe(6);
      expect(mapping?.nome_chakra_portugues).toBe('6º Terceiro Olho');
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.orixa).toBe('Oxóssi');
    });

    it('should return A Lua mapping with Svadhisthana chakra', () => {
      const mapping = getTarotChakra('A Lua');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.numero_carta).toBe(18);
      expect(mapping?.chakra).toBe('Svadhisthana');
      expect(mapping?.numero_chakra).toBe(2);
      expect(mapping?.elemento).toBe('Água');
      expect(mapping?.orixa).toBe('Iemanjá');
    });

    it('should return O Sol mapping with Manipura chakra', () => {
      const mapping = getTarotChakra('O Sol');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.numero_chakra).toBe(3);
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.orixa).toBe('Xangô');
    });

    it('should return A Estrela mapping with Anahata chakra', () => {
      const mapping = getTarotChakra('A Estrela');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.chakra).toBe('Anahata');
      expect(mapping?.numero_chakra).toBe(4);
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.orixa).toBe('Oxum');
    });

    it('should return O Mago mapping with Vishuddha chakra', () => {
      const mapping = getTarotChakra('O Mago');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('O Mago');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.chakra).toBe('Vishuddha');
      expect(mapping?.numero_chakra).toBe(5);
      expect(mapping?.elemento).toBe('Éter');
      expect(mapping?.orixa).toBe('Ogum');
    });

    it('should return O Mundo mapping with Muladhara chakra', () => {
      const mapping = getTarotChakra('O Mundo');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('O Mundo');
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.chakra).toBe('Muladhara');
      expect(mapping?.numero_chakra).toBe(1);
      expect(mapping?.elemento).toBe('Terra');
      expect(mapping?.orixa).toBe('Oxalá');
    });

    it('should return A Torre mapping with Manipura chakra', () => {
      const mapping = getTarotChakra('A Torre');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.orixa).toBe('Xangô');
    });

    it('should be case-insensitive', () => {
      expect(getTarotChakra('o louco')?.arcano).toBe('O Louco');
      expect(getTarotChakra('A LUA')?.arcano).toBe('A Lua');
      expect(getTarotChakra('O SOL')?.arcano).toBe('O Sol');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotChakra('unknown')).toBeNull();
      expect(getTarotChakra('O Imperador')).toBeNull();
      expect(getTarotChakra('')).toBeNull();
    });

    it('should include keywords in mapping', () => {
      const mapping = getTarotChakra('O Louco');
      expect(mapping?.keywords).toBeDefined();
      expect(Array.isArray(mapping?.keywords)).toBe(true);
      expect(mapping?.keywords.length).toBeGreaterThan(0);
    });

    it('should include energia_espiritual in mapping', () => {
      const mapping = getTarotChakra('O Sol');
      expect(mapping?.energia_espiritual).toBeDefined();
      expect(typeof mapping?.energia_espiritual).toBe('string');
      expect(mapping?.energia_espiritual.length).toBeGreaterThan(0);
    });
  });

  describe('getChakraTarot', () => {
    it('should return O Louco for Ajna chakra', () => {
      expect(getChakraTarot('Ajna')).toBe('O Louco');
    });

    it('should return A Lua for Svadhisthana chakra', () => {
      expect(getChakraTarot('Svadhisthana')).toBe('A Lua');
    });

    it('should return O Sol for Manipura chakra', () => {
      expect(getChakraTarot('Manipura')).toBe('O Sol');
    });

    it('should return A Estrela for Anahata chakra', () => {
      expect(getChakraTarot('Anahata')).toBe('A Estrela');
    });

    it('should return O Mago for Vishuddha chakra', () => {
      expect(getChakraTarot('Vishuddha')).toBe('O Mago');
    });

    it('should return O Mundo for Muladhara chakra', () => {
      expect(getChakraTarot('Muladhara')).toBe('O Mundo');
    });

    it('should accept Portuguese chakra names', () => {
      expect(getChakraTarot('6º Terceiro Olho')).toBe('O Louco');
      expect(getChakraTarot('2º Sacro')).toBe('A Lua');
      expect(getChakraTarot('3º Plexo Solar')).toBe('O Sol');
      expect(getChakraTarot('4º Cardíaco')).toBe('A Estrela');
      expect(getChakraTarot('5º Laríngeo')).toBe('O Mago');
      expect(getChakraTarot('1º Básico')).toBe('O Mundo');
    });

    it('should accept numbered format', () => {
      expect(getChakraTarot('6')).toBe('O Louco');
      expect(getChakraTarot('2')).toBe('A Lua');
      expect(getChakraTarot('1')).toBe('O Mundo');
    });

    it('should accept alternative names', () => {
      expect(getChakraTarot('coração')?.arcano).toBeDefined();
      expect(getChakraTarot('heart')?.arcano).toBeDefined();
      expect(getChakraTarot('coroa')?.arcano).toBeDefined();
      expect(getChakraTarot('crown')?.arcano).toBeDefined();
    });

    it('should return null for unknown chakra', () => {
      expect(getChakraTarot('unknown')).toBeNull();
      expect(getChakraTarot('')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getChakraTarot('ajna')).toBe('O Louco');
      expect(getChakraTarot('MULADHARA')?.arcano).toBeDefined();
    });
  });

  describe('getAllTarotChakras', () => {
    it('should return all 21 arcano mappings', () => {
      const mappings = getAllTarotChakras();
      expect(mappings).toHaveLength(21);
    });

    it('should return mappings sorted by card number', () => {
      const mappings = getAllTarotChakras();
      expect(mappings[0].numero_carta).toBe(0); // O Louco
      expect(mappings[20].numero_carta).toBe(21); // O Mundo
    });

    it('should include all required properties', () => {
      const mappings = getAllTarotChakras();
      for (const mapping of mappings) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.numero_chakra).toBeDefined();
        expect(mapping.nome_chakra_portugues).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.energia_espiritual).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.keywords).toBeDefined();
      }
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 21 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(21);
    });

    it('should include all Major Arcana cards', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Estrela');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('O Mundo');
      expect(arcanos).toContain('A Torre');
      expect(arcanos).toContain('A Justiça');
      expect(arcanos).toContain('A Morte');
    });

    it('should not have duplicate arcano names', () => {
      const arcanos = getAllArcanos();
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(arcanos.length);
    });
  });

  describe('getChakraByNumber', () => {
    it('should return Ajna for card number 0', () => {
      expect(getChakraByNumber(0)).toBe('Ajna');
    });

    it('should return Vishuddha for card number 1', () => {
      expect(getChakraByNumber(1)).toBe('Vishuddha');
    });

    it('should return Svadhisthana for card number 18', () => {
      expect(getChakraByNumber(18)).toBe('Svadhisthana');
    });

    it('should return Manipura for card number 19', () => {
      expect(getChakraByNumber(19)).toBe('Manipura');
    });

    it('should return Muladhara for card number 21', () => {
      expect(getChakraByNumber(21)).toBe('Muladhara');
    });

    it('should return null for unmapped card numbers', () => {
      expect(getChakraByNumber(2)).toBeNull(); // A Sacerdotisa
      expect(getChakraByNumber(3)).toBeNull(); // A Imperatriz
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for card number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return O Mago for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('should return A Lua for card number 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('should return O Sol for card number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return O Mundo for card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for unmapped card numbers', () => {
      expect(getArcanoByNumber(2)).toBeNull();
      expect(getArcanoByNumber(3)).toBeNull();
    });
  });

  describe('getArcanosByNumber', () => {
    it('should return all arcano names sorted by number', () => {
      const arcanos = getArcanosByNumber();
      expect(arcanos[0]).toBe('O Louco');
      expect(arcanos[1]).toBe('O Mago');
      expect(arcanos[arcanos.length - 1]).toBe('O Mundo');
    });

    it('should have 21 elements', () => {
      expect(getArcanosByNumber()).toHaveLength(21);
    });
  });

  describe('getOrixaByArcano', () => {
    it('should return Oxóssi for O Louco', () => {
      expect(getOrixaByArcano('O Louco')).toBe('Oxóssi');
    });

    it('should return Iemanjá for A Lua', () => {
      expect(getOrixaByArcano('A Lua')).toBe('Iemanjá');
    });

    it('should return Xangô for O Sol', () => {
      expect(getOrixaByArcano('O Sol')).toBe('Xangô');
    });

    it('should return null for unknown arcano', () => {
      expect(getOrixaByArcano('unknown')).toBeNull();
    });
  });

  describe('getArcanosByOrixa', () => {
    it('should return all arcanos for Oxum', () => {
      const arcanos = getArcanosByOrixa('Oxum');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('A Estrela');
    });

    it('should return all arcanos for Xangô', () => {
      const arcanos = getArcanosByOrixa('Xangô');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Torre');
    });

    it('should be case-insensitive', () => {
      const arcanos = getArcanosByOrixa('OXUM');
      expect(arcanos.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown orixá', () => {
      expect(getArcanosByOrixa('unknown')).toEqual([]);
    });
  });

  describe('getElementByArcano', () => {
    it('should return Ar for O Louco', () => {
      expect(getElementByArcano('O Louco')).toBe('Ar');
    });

    it('should return Água for A Lua', () => {
      expect(getElementByArcano('A Lua')).toBe('Água');
    });

    it('should return Fogo for O Sol', () => {
      expect(getElementByArcano('O Sol')).toBe('Fogo');
    });

    it('should return Terra for O Mundo', () => {
      expect(getElementByArcano('O Mundo')).toBe('Terra');
    });

    it('should return Éter for O Mago', () => {
      expect(getElementByArcano('O Mago')).toBe('Éter');
    });

    it('should return null for unknown arcano', () => {
      expect(getElementByArcano('unknown')).toBeNull();
    });
  });

  describe('getArcanosByElement', () => {
    it('should return Água arcanos', () => {
      const arcanos = getArcanosByElement('Água');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('A Lua');
    });

    it('should return Fogo arcanos', () => {
      const arcanos = getArcanosByElement('Fogo');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Torre');
    });

    it('should be case-insensitive', () => {
      const arcanos = getArcanosByElement('agua');
      expect(arcanos.length).toBeGreaterThan(0);
    });

    it('should accept English element names', () => {
      const arcanos = getArcanosByElement('fire');
      expect(arcanos.length).toBeGreaterThan(0);
    });
  });

  describe('hasTarotChakra', () => {
    it('should return true for valid arcanos', () => {
      expect(hasTarotChakra('O Louco')).toBe(true);
      expect(hasTarotChakra('A Lua')).toBe(true);
      expect(hasTarotChakra('O Sol')).toBe(true);
    });

    it('should return false for invalid arcanos', () => {
      expect(hasTarotChakra('O Imperador')).toBe(false);
      expect(hasTarotChakra('unknown')).toBe(false);
      expect(hasTarotChakra('')).toBe(false);
    });
  });

  describe('getArcanoCount', () => {
    it('should return 21', () => {
      expect(getArcanoCount()).toBe(21);
    });
  });

  describe('TAROT_CHAKRA_MAPPINGS constant', () => {
    it('should be defined and frozen', () => {
      expect(TAROT_CHAKRA_MAPPINGS).toBeDefined();
      expect(Object.isFrozen(TAROT_CHAKRA_MAPPINGS)).toBe(true);
    });

    it('should have all Major Arcana cards', () => {
      expect(TAROT_CHAKRA_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['O Mundo']).toBeDefined();
    });

    it('should have consistent chakra-orixa relationships', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.elemento).toBeDefined();
      }
    });
  });

  describe('Consistency checks', () => {
    it('each arcano should have a valid card number between 0 and 21', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('each arcano should have a valid chakra number between 1 and 7', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.numero_chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_chakra).toBeLessThanOrEqual(7);
      }
    });

    it('each arcano should have a valid elemento', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('each arcano should have keywords array with at least one item', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.keywords).toBeDefined();
        expect(Array.isArray(mapping.keywords)).toBe(true);
        expect(mapping.keywords.length).toBeGreaterThan(0);
      }
    });
  });
});