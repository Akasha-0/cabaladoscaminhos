/**
 * Tests for Tarot-Zodiac Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and zodiac signs
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotZodiac,
  getSignoFromArcano,
  getElementoFromArcano,
  getSignificadoEspiritualFromArcano,
  getNumeroCartaFromArcano,
  getZodiacTarot,
  getMappingFromSigno,
  getAllTarotZodiacs,
  getAllSigns,
  getTarotZodiacsByElement,
  getAllArcanos,
  TAROT_ZODIAC_MAP,
  TODOS_ARCANOS_ZODIAC,
} from '@/lib/correlation/tarot-zodiac';

describe('TarotZodiac Correlation Module', () => {
  describe('getTarotZodiac', () => {
    it('should return mapping for O Imperador', () => {
      const mapping = getTarotZodiac('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.significado_espiritual).toBeTruthy();
    });

    it('should return mapping for A Imperatriz', () => {
      const mapping = getTarotZodiac('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.signo).toBe('Touro');
      expect(mapping?.numero_carta).toBe(3);
    });

    it('should return mapping for Os Enamorados', () => {
      const mapping = getTarotZodiac('Os Enamorados');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('Os Enamorados');
      expect(mapping?.signo).toBe('Gémeos');
      expect(mapping?.numero_carta).toBe(6);
    });

    it('should return mapping for A Lua', () => {
      const mapping = getTarotZodiac('A Lua');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.signo).toBe('Câncer');
      expect(mapping?.numero_carta).toBe(18);
    });

    it('should return mapping for O Sol', () => {
      const mapping = getTarotZodiac('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.numero_carta).toBe(19);
    });

    it('should return mapping for A Torre', () => {
      const mapping = getTarotZodiac('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.signo).toBe('Virgem');
      expect(mapping?.numero_carta).toBe(16);
    });

    it('should return mapping for A Justiça', () => {
      const mapping = getTarotZodiac('A Justiça');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Justiça');
      expect(mapping?.signo).toBe('Libra');
      expect(mapping?.numero_carta).toBe(11);
    });

    it('should return mapping for A Morte', () => {
      const mapping = getTarotZodiac('A Morte');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Morte');
      expect(mapping?.signo).toBe('Escorpião');
      expect(mapping?.numero_carta).toBe(13);
    });

    it('should return mapping for O Hierofante', () => {
      const mapping = getTarotZodiac('O Hierofante');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.signo).toBe('Sagitário');
      expect(mapping?.numero_carta).toBe(5);
    });

    it('should return mapping for O Diabo', () => {
      const mapping = getTarotZodiac('O Diabo');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Diabo');
      expect(mapping?.signo).toBe('Capricórnio');
      expect(mapping?.numero_carta).toBe(15);
    });

    it('should return mapping for A Estrela', () => {
      const mapping = getTarotZodiac('A Estrela');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.signo).toBe('Aquário');
      expect(mapping?.numero_carta).toBe(17);
    });

    it('should return mapping for O Eremita', () => {
      const mapping = getTarotZodiac('O Eremita');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Eremita');
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.numero_carta).toBe(9);
    });

    it('should handle lowercase input', () => {
      const mapping = getTarotZodiac('o sol');
      expect(mapping?.arcano).toBe('O Sol');
    });

    it('should handle variations without article', () => {
      const mapping = getTarotZodiac('Sol');
      expect(mapping?.arcano).toBe('O Sol');
    });

    it('should return null for unknown arcano', () => {
      const mapping = getTarotZodiac('Unknown Arcano');
      expect(mapping).toBeNull();
    });

    it('should handle empty string', () => {
      const mapping = getTarotZodiac('');
      expect(mapping).toBeNull();
    });
  });

  describe('getSignoFromArcano', () => {
    it('should return correct sign for each arcano', () => {
      expect(getSignoFromArcano('O Imperador')).toBe('Áries');
      expect(getSignoFromArcano('A Imperatriz')).toBe('Touro');
      expect(getSignoFromArcano('Os Enamorados')).toBe('Gémeos');
      expect(getSignoFromArcano('A Lua')).toBe('Câncer');
      expect(getSignoFromArcano('O Sol')).toBe('Leão');
      expect(getSignoFromArcano('A Torre')).toBe('Virgem');
      expect(getSignoFromArcano('A Justiça')).toBe('Libra');
      expect(getSignoFromArcano('A Morte')).toBe('Escorpião');
      expect(getSignoFromArcano('O Hierofante')).toBe('Sagitário');
      expect(getSignoFromArcano('O Diabo')).toBe('Capricórnio');
      expect(getSignoFromArcano('A Estrela')).toBe('Aquário');
      expect(getSignoFromArcano('O Eremita')).toBe('Peixes');
    });

    it('should return null for unknown arcano', () => {
      expect(getSignoFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getElementoFromArcano', () => {
    it('should return correct element for fire arcano', () => {
      expect(getElementoFromArcano('O Imperador')).toBe('Fogo');
      expect(getElementoFromArcano('O Sol')).toBe('Fogo');
      expect(getElementoFromArcano('O Hierofante')).toBe('Fogo');
    });

    it('should return correct element for water arcano', () => {
      expect(getElementoFromArcano('A Lua')).toBe('Água');
      expect(getElementoFromArcano('A Morte')).toBe('Água');
      expect(getElementoFromArcano('O Eremita')).toBe('Água');
    });

    it('should return correct element for air arcano', () => {
      expect(getElementoFromArcano('Os Enamorados')).toBe('Ar');
      expect(getElementoFromArcano('A Justiça')).toBe('Ar');
      expect(getElementoFromArcano('A Estrela')).toBe('Ar');
    });

    it('should return correct element for earth arcano', () => {
      expect(getElementoFromArcano('A Imperatriz')).toBe('Terra');
      expect(getElementoFromArcano('A Torre')).toBe('Terra');
      expect(getElementoFromArcano('O Diabo')).toBe('Terra');
    });

    it('should return null for unknown arcano', () => {
      expect(getElementoFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getSignificadoEspiritualFromArcano', () => {
    it('should return spiritual meaning for each arcano', () => {
      expect(getSignificadoEspiritualFromArcano('O Imperador')).toBeTruthy();
      expect(getSignificadoEspiritualFromArcano('A Imperatriz')).toBeTruthy();
      expect(getSignificadoEspiritualFromArcano('O Eremita')).toBeTruthy();
    });

    it('should return null for unknown arcano', () => {
      expect(getSignificadoEspiritualFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getNumeroCartaFromArcano', () => {
    it('should return card number for each arcano', () => {
      expect(getNumeroCartaFromArcano('O Imperador')).toBe(4);
      expect(getNumeroCartaFromArcano('A Imperatriz')).toBe(3);
      expect(getNumeroCartaFromArcano('Os Enamorados')).toBe(6);
      expect(getNumeroCartaFromArcano('A Lua')).toBe(18);
      expect(getNumeroCartaFromArcano('O Sol')).toBe(19);
      expect(getNumeroCartaFromArcano('A Torre')).toBe(16);
      expect(getNumeroCartaFromArcano('A Justiça')).toBe(11);
      expect(getNumeroCartaFromArcano('A Morte')).toBe(13);
      expect(getNumeroCartaFromArcano('O Hierofante')).toBe(5);
      expect(getNumeroCartaFromArcano('O Diabo')).toBe(15);
      expect(getNumeroCartaFromArcano('A Estrela')).toBe(17);
      expect(getNumeroCartaFromArcano('O Eremita')).toBe(9);
    });

    it('should return null for unknown arcano', () => {
      expect(getNumeroCartaFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getZodiacTarot', () => {
    it('should return arcano for Áries', () => {
      expect(getZodiacTarot('Áries')).toBe('O Imperador');
    });

    it('should return arcano for Leão', () => {
      expect(getZodiacTarot('Leão')).toBe('O Sol');
    });

    it('should return arcano for Peixes', () => {
      expect(getZodiacTarot('Peixes')).toBe('O Eremita');
    });

    it('should handle lowercase input', () => {
      expect(getZodiacTarot('aries')).toBe('O Imperador');
    });

    it('should return null for unknown sign', () => {
      expect(getZodiacTarot('UnknownSign')).toBeNull();
    });
  });

  describe('getMappingFromSigno', () => {
    it('should return full mapping for known sign', () => {
      const mapping = getMappingFromSigno('Áries');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return null for unknown sign', () => {
      expect(getMappingFromSigno('Unknown')).toBeNull();
    });
  });

  describe('getAllTarotZodiacs', () => {
    it('should return all 12 mappings', () => {
      const allMappings = getAllTarotZodiacs();
      expect(allMappings).toHaveLength(12);
    });

    it('should contain all arcano names', () => {
      const allMappings = getAllTarotZodiacs();
      const arcanos = allMappings.map((m) => m.arcano);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Imperador');
    });

    it('should contain all zodiac signs', () => {
      const allMappings = getAllTarotZodiacs();
      const signs = allMappings.map((m) => m.signo);
      expect(signs).toContain('Áries');
      expect(signs).toContain('Peixes');
    });

    it('should contain all unique signs', () => {
      const allMappings = getAllTarotZodiacs();
      const signs = allMappings.map((m) => m.signo);
      const uniqueSigns = new Set(signs);
      expect(uniqueSigns.size).toBe(12);
    });
  });

  describe('getAllArcanos', () => {
    it('should return 12 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(12);
    });

    it('should include major arcanos', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Imperador');
    });
  });

  describe('getTarotZodiacsByElement', () => {
    it('should return 3 fire arcano', () => {
      const fireMappings = getTarotZodiacsByElement('Fogo');
      expect(fireMappings).toHaveLength(3);
    });

    it('should return 3 water arcano', () => {
      const waterMappings = getTarotZodiacsByElement('Água');
      expect(waterMappings).toHaveLength(3);
    });

    it('should return 3 air arcano', () => {
      const airMappings = getTarotZodiacsByElement('Ar');
      expect(airMappings).toHaveLength(3);
    });

    it('should return 3 earth arcano', () => {
      const earthMappings = getTarotZodiacsByElement('Terra');
      expect(earthMappings).toHaveLength(3);
    });

    it('should return empty array for unknown element', () => {
      const mappings = getTarotZodiacsByElement('Unknown');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('getAllSigns', () => {
    it('should return all 12 signs', () => {
      const signs = getAllSigns();
      expect(signs).toHaveLength(12);
    });

    it('should include all zodiac signs', () => {
      const signs = getAllSigns();
      expect(signs).toContain('Áries');
      expect(signs).toContain('Touro');
      expect(signs).toContain('Gémeos');
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Virgem');
      expect(signs).toContain('Libra');
      expect(signs).toContain('Escorpião');
      expect(signs).toContain('Sagitário');
      expect(signs).toContain('Capricórnio');
      expect(signs).toContain('Aquário');
      expect(signs).toContain('Peixes');
    });
  });

  describe('TAROT_ZODIAC_MAP', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_ZODIAC_MAP)).toBe(true);
    });

    it('should have 12 entries', () => {
      expect(Object.keys(TAROT_ZODIAC_MAP)).toHaveLength(12);
    });

    it('should have correct structure for each entry', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
      }
    });
  });

  describe('TODOS_ARCANOS_ZODIAC', () => {
    it('should have 12 arcanos', () => {
      expect(TODOS_ARCANOS_ZODIAC).toHaveLength(12);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_ZODIAC)).toBe(true);
    });

    it('should contain all major arcanos in Portuguese', () => {
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Imperador');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Imperatriz');
      expect(TODOS_ARCANOS_ZODIAC).toContain('Os Enamorados');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Lua');
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Sol');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Torre');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Justiça');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Morte');
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Hierofante');
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Diabo');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Estrela');
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Eremita');
    });
  });

  describe('Element-to-Arcano relationship verification', () => {
    it('should correctly map fire element arcano', () => {
      const fireMappings = getTarotZodiacsByElement('Fogo');
      for (const mapping of fireMappings) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('should correctly map water element arcano', () => {
      const waterMappings = getTarotZodiacsByElement('Água');
      for (const mapping of waterMappings) {
        expect(mapping.elemento).toBe('Água');
      }
    });

    it('should correctly map air element arcano', () => {
      const airMappings = getTarotZodiacsByElement('Ar');
      for (const mapping of airMappings) {
        expect(mapping.elemento).toBe('Ar');
      }
    });

    it('should correctly map earth element arcano', () => {
      const earthMappings = getTarotZodiacsByElement('Terra');
      for (const mapping of earthMappings) {
        expect(mapping.elemento).toBe('Terra');
      }
    });
  });
});
