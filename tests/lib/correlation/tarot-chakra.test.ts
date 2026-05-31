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
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.orixa).toBe('Oxóssi');
    });

    it('should return A Lua mapping with Svadhisthana chakra', () => {
      const mapping = getTarotChakra('A Lua');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.numero_carta).toBe(18);
      expect(mapping?.chakra).toBe('Svadhisthana');
      expect(mapping?.elemento).toBe('Água');
      expect(mapping?.orixa).toBe('Iemanjá');
    });

    it('should return O Sol mapping with Manipura chakra', () => {
      const mapping = getTarotChakra('O Sol');
      expect(mapping).not.toBeNull();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.orixa).toBe('Xangô');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotChakra('O Imperador')).toBeNull();
      expect(getTarotChakra('unknown')).toBeNull();
    });
  });

  describe('getChakraTarot', () => {
    it('should return O Louco for Ajna chakra', () => {
      expect(getChakraTarot('Ajna')).toBe('O Louco');
    });

    it('should return A Lua for Svadhisthana chakra', () => {
      expect(getChakraTarot('Svadhisthana')).toBe('A Lua');
    });

    it('should return null for unknown chakra', () => {
      expect(getChakraTarot('unknown')).toBeNull();
    });
  });

  describe('getAllTarotChakras', () => {
    it('should return all 21 arcano mappings', () => {
      const mappings = getAllTarotChakras();
      expect(mappings).toHaveLength(21);
    });

    it('should return mappings sorted by card number', () => {
      const mappings = getAllTarotChakras();
      expect(mappings[0].numero_carta).toBe(0);
      expect(mappings[20].numero_carta).toBe(21);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 21 arcano names', () => {
      expect(getAllArcanos()).toHaveLength(21);
    });

    it('should include key Major Arcana cards', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('O Mundo');
    });
  });

  describe('getChakraByNumber', () => {
    it('should return Ajna for card number 0', () => {
      expect(getChakraByNumber(0)).toBe('Ajna');
    });

    it('should return Muladhara for card number 21', () => {
      expect(getChakraByNumber(21)).toBe('Muladhara');
    });

    it('should return null for unmapped card numbers', () => {
      expect(getChakraByNumber(2)).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for card number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return O Mundo for card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });
  });

  describe('getOrixaByArcano', () => {
    it('should return Oxóssi for O Louco', () => {
      expect(getOrixaByArcano('O Louco')).toBe('Oxóssi');
    });

    it('should return null for unknown arcano', () => {
      expect(getOrixaByArcano('unknown')).toBeNull();
    });
  });

  describe('getArcanosByOrixa', () => {
    it('should return arcanos for Oxum', () => {
      const arcanos = getArcanosByOrixa('Oxum');
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

    it('should return null for unknown arcano', () => {
      expect(getElementByArcano('unknown')).toBeNull();
    });
  });

  describe('getArcanosByElement', () => {
    it('should return Água arcanos', () => {
      const arcanos = getArcanosByElement('Água');
      expect(arcanos.length).toBeGreaterThan(0);
    });
  });

  describe('hasTarotChakra', () => {
    it('should return true for valid arcanos', () => {
      expect(hasTarotChakra('O Louco')).toBe(true);
      expect(hasTarotChakra('A Lua')).toBe(true);
    });

    it('should return false for invalid arcanos', () => {
      expect(hasTarotChakra('unknown')).toBe(false);
    });
  });

  describe('getArcanoCount', () => {
    it('should return 21', () => {
      expect(getArcanoCount()).toBe(21);
    });
  });

  describe('TAROT_CHAKRA_MAPPINGS', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_CHAKRA_MAPPINGS)).toBe(true);
    });
  });

  describe('Consistency checks', () => {
    it('each arcano should have valid card number 0-21', () => {
      for (const m of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(m.numero_carta).toBeGreaterThanOrEqual(0);
        expect(m.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('each arcano should have valid chakra number 1-7', () => {
      for (const m of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(m.numero_chakra).toBeGreaterThanOrEqual(1);
        expect(m.numero_chakra).toBeLessThanOrEqual(7);
      }
    });
  });
});
