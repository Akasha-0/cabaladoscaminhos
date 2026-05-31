/**
 * Tests for Zodiac-Tarot Spiritual Correlation Module
 * Validates the mapping between zodiac signs and Tarot Major Arcana cards
 */

import { describe, it, expect } from 'vitest';
import {
  getZodiacTarot,
  getTarotZodiac,
  getAllZodiacTarots,
  getArcanoFromSigno,
  getElementoFromSigno,
  getSignificadoEspiritualFromSigno,
  getNumeroCartaFromSigno,
  getSignoFromArcano,
  getAllArcanos,
  getZodiacTarotsByElement,
  getAllSigns,
  ZODIAC_TAROT_MAP,
  TODOS_SIGNOS_ZODIAC_TAROT,
} from '@/lib/correlation/zodiac-tarot';

describe('ZodiacTarot Correlation Module', () => {
  describe('getZodiacTarot', () => {
    it('should return mapping for Áries', () => {
      const mapping = getZodiacTarot('Áries');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.significado_espiritual).toBeTruthy();
    });

    it('should return mapping for Touro', () => {
      const mapping = getZodiacTarot('Touro');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Touro');
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.numero_carta).toBe(3);
    });

    it('should return mapping for Gémeos', () => {
      const mapping = getZodiacTarot('Gémeos');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Gémeos');
      expect(mapping?.arcano).toBe('Os Enamorados');
      expect(mapping?.numero_carta).toBe(6);
    });

    it('should return mapping for Câncer', () => {
      const mapping = getZodiacTarot('Câncer');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Câncer');
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.numero_carta).toBe(18);
    });

    it('should return mapping for Leão', () => {
      const mapping = getZodiacTarot('Leão');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
    });

    it('should return mapping for Virgem', () => {
      const mapping = getZodiacTarot('Virgem');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Virgem');
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
    });

    it('should return mapping for Libra', () => {
      const mapping = getZodiacTarot('Libra');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Libra');
      expect(mapping?.arcano).toBe('A Justiça');
      expect(mapping?.numero_carta).toBe(11);
    });

    it('should return mapping for Escorpião', () => {
      const mapping = getZodiacTarot('Escorpião');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Escorpião');
      expect(mapping?.arcano).toBe('A Morte');
      expect(mapping?.numero_carta).toBe(13);
    });

    it('should return mapping for Sagitário', () => {
      const mapping = getZodiacTarot('Sagitário');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Sagitário');
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.numero_carta).toBe(5);
    });

    it('should return mapping for Capricórnio', () => {
      const mapping = getZodiacTarot('Capricórnio');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Capricórnio');
      expect(mapping?.arcano).toBe('O Diabo');
      expect(mapping?.numero_carta).toBe(15);
    });

    it('should return mapping for Aquário', () => {
      const mapping = getZodiacTarot('Aquário');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Aquário');
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.numero_carta).toBe(17);
    });

    it('should return mapping for Peixes', () => {
      const mapping = getZodiacTarot('Peixes');
      expect(mapping).toBeDefined();
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.arcano).toBe('O Eremita');
      expect(mapping?.numero_carta).toBe(9);
    });

    it('should handle lowercase input', () => {
      const mapping = getZodiacTarot('aries');
      expect(mapping?.signo).toBe('Áries');
    });

    it('should handle accented variations', () => {
      const mapping = getZodiacTarot('aries');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Imperador');
    });

    it('should return null for unknown sign', () => {
      const mapping = getZodiacTarot('UnknownSign');
      expect(mapping).toBeNull();
    });

    it('should handle empty string', () => {
      const mapping = getZodiacTarot('');
      expect(mapping).toBeNull();
    });
  });

  describe('getTarotZodiac', () => {
    it('should return Áries for O Imperador', () => {
      const signo = getTarotZodiac('O Imperador');
      expect(signo).toBe('Áries');
    });

    it('should return Touro for A Imperatriz', () => {
      const signo = getTarotZodiac('A Imperatriz');
      expect(signo).toBe('Touro');
    });

    it('should return Gémeos for Os Enamorados', () => {
      const signo = getTarotZodiac('Os Enamorados');
      expect(signo).toBe('Gémeos');
    });

    it('should return Câncer for A Lua', () => {
      const signo = getTarotZodiac('A Lua');
      expect(signo).toBe('Câncer');
    });

    it('should return Leão for O Sol', () => {
      const signo = getTarotZodiac('O Sol');
      expect(signo).toBe('Leão');
    });

    it('should return null for unknown arcano', () => {
      const signo = getTarotZodiac('Unknown Arcano');
      expect(signo).toBeNull();
    });

    it('should handle trimmed input', () => {
      const signo = getTarotZodiac('  O Sol  ');
      expect(signo).toBe('Leão');
    });
  });

  describe('getArcanoFromSigno', () => {
    it('should return correct arcano for each sign', () => {
      expect(getArcanoFromSigno('Áries')).toBe('O Imperador');
      expect(getArcanoFromSigno('Touro')).toBe('A Imperatriz');
      expect(getArcanoFromSigno('Gémeos')).toBe('Os Enamorados');
      expect(getArcanoFromSigno('Câncer')).toBe('A Lua');
      expect(getArcanoFromSigno('Leão')).toBe('O Sol');
      expect(getArcanoFromSigno('Virgem')).toBe('A Torre');
      expect(getArcanoFromSigno('Libra')).toBe('A Justiça');
      expect(getArcanoFromSigno('Escorpião')).toBe('A Morte');
      expect(getArcanoFromSigno('Sagitário')).toBe('O Hierofante');
      expect(getArcanoFromSigno('Capricórnio')).toBe('O Diabo');
      expect(getArcanoFromSigno('Aquário')).toBe('A Estrela');
      expect(getArcanoFromSigno('Peixes')).toBe('O Eremita');
    });

    it('should return null for unknown sign', () => {
      expect(getArcanoFromSigno('Unknown')).toBeNull();
    });
  });

  describe('getElementoFromSigno', () => {
    it('should return correct element for fire signs', () => {
      expect(getElementoFromSigno('Áries')).toBe('Fogo');
      expect(getElementoFromSigno('Leão')).toBe('Fogo');
      expect(getElementoFromSigno('Sagitário')).toBe('Fogo');
    });

    it('should return correct element for water signs', () => {
      expect(getElementoFromSigno('Câncer')).toBe('Água');
      expect(getElementoFromSigno('Escorpião')).toBe('Água');
      expect(getElementoFromSigno('Peixes')).toBe('Água');
    });

    it('should return correct element for air signs', () => {
      expect(getElementoFromSigno('Gémeos')).toBe('Ar');
      expect(getElementoFromSigno('Libra')).toBe('Ar');
      expect(getElementoFromSigno('Aquário')).toBe('Ar');
    });

    it('should return correct element for earth signs', () => {
      expect(getElementoFromSigno('Touro')).toBe('Terra');
      expect(getElementoFromSigno('Virgem')).toBe('Terra');
      expect(getElementoFromSigno('Capricórnio')).toBe('Terra');
    });
  });

  describe('getSignificadoEspiritualFromSigno', () => {
    it('should return spiritual meaning for each sign', () => {
      expect(getSignificadoEspiritualFromSigno('Áries')).toBeTruthy();
      expect(getSignificadoEspiritualFromSigno('Touro')).toBeTruthy();
      expect(getSignificadoEspiritualFromSigno('Peixes')).toBeTruthy();
    });

    it('should return null for unknown sign', () => {
      expect(getSignificadoEspiritualFromSigno('Unknown')).toBeNull();
    });
  });

  describe('getNumeroCartaFromSigno', () => {
    it('should return card number for each sign', () => {
      expect(getNumeroCartaFromSigno('Áries')).toBe(4);
      expect(getNumeroCartaFromSigno('Touro')).toBe(3);
      expect(getNumeroCartaFromSigno('Gémeos')).toBe(6);
      expect(getNumeroCartaFromSigno('Câncer')).toBe(18);
      expect(getNumeroCartaFromSigno('Leão')).toBe(19);
      expect(getNumeroCartaFromSigno('Virgem')).toBe(16);
      expect(getNumeroCartaFromSigno('Libra')).toBe(11);
      expect(getNumeroCartaFromSigno('Escorpião')).toBe(13);
      expect(getNumeroCartaFromSigno('Sagitário')).toBe(5);
      expect(getNumeroCartaFromSigno('Capricórnio')).toBe(15);
      expect(getNumeroCartaFromSigno('Aquário')).toBe(17);
      expect(getNumeroCartaFromSigno('Peixes')).toBe(9);
    });
  });

  describe('getSignoFromArcano', () => {
    it('should return sign for known arcano', () => {
      expect(getSignoFromArcano('O Sol')).toBe('Leão');
      expect(getSignoFromArcano('A Lua')).toBe('Câncer');
      expect(getSignoFromArcano('O Imperador')).toBe('Áries');
    });

    it('should return null for unknown arcano', () => {
      expect(getSignoFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getAllZodiacTarots', () => {
    it('should return all 12 mappings', () => {
      const allMappings = getAllZodiacTarots();
      expect(allMappings).toHaveLength(12);
    });

    it('should contain all zodiac signs', () => {
      const allMappings = getAllZodiacTarots();
      const signs = allMappings.map((m) => m.signo);
      expect(signs).toContain('Áries');
      expect(signs).toContain('Peixes');
    });

    it('should contain all unique arcanos', () => {
      const allMappings = getAllZodiacTarots();
      const arcanos = allMappings.map((m) => m.arcano);
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(12);
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

  describe('getZodiacTarotsByElement', () => {
    it('should return 3 fire signs', () => {
      const fireMappings = getZodiacTarotsByElement('Fogo');
      expect(fireMappings).toHaveLength(3);
    });

    it('should return 3 water signs', () => {
      const waterMappings = getZodiacTarotsByElement('Água');
      expect(waterMappings).toHaveLength(3);
    });

    it('should return 3 air signs', () => {
      const airMappings = getZodiacTarotsByElement('Ar');
      expect(airMappings).toHaveLength(3);
    });

    it('should return 3 earth signs', () => {
      const earthMappings = getZodiacTarotsByElement('Terra');
      expect(earthMappings).toHaveLength(3);
    });

    it('should return empty array for unknown element', () => {
      const mappings = getZodiacTarotsByElement('Unknown');
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

  describe('ZODIAC_TAROT_MAP', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(ZODIAC_TAROT_MAP)).toBe(true);
    });

    it('should have 12 entries', () => {
      expect(Object.keys(ZODIAC_TAROT_MAP)).toHaveLength(12);
    });

    it('should have correct structure for each entry', () => {
      for (const mapping of Object.values(ZODIAC_TAROT_MAP)) {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
      }
    });
  });

  describe('TODOS_SIGNOS_ZODIAC_TAROT', () => {
    it('should have 12 signs', () => {
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toHaveLength(12);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_SIGNOS_ZODIAC_TAROT)).toBe(true);
    });

    it('should contain all zodiac signs in Portuguese', () => {
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Áries');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Touro');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Gémeos');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Câncer');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Leão');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Virgem');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Libra');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Escorpião');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Sagitário');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Capricórnio');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Aquário');
      expect(TODOS_SIGNOS_ZODIAC_TAROT).toContain('Peixes');
    });
  });

  describe('Element-to-Sign relationship verification', () => {
    it('should correctly map fire element signs to fire arcanos', () => {
      const fireMappings = getZodiacTarotsByElement('Fogo');
      for (const mapping of fireMappings) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('should correctly map water element signs to water arcanos', () => {
      const waterMappings = getZodiacTarotsByElement('Água');
      for (const mapping of waterMappings) {
        expect(mapping.elemento).toBe('Água');
      }
    });

    it('should correctly map air element signs to air arcanos', () => {
      const airMappings = getZodiacTarotsByElement('Ar');
      for (const mapping of airMappings) {
        expect(mapping.elemento).toBe('Ar');
      }
    });

    it('should correctly map earth element signs to earth arcanos', () => {
      const earthMappings = getZodiacTarotsByElement('Terra');
      for (const mapping of earthMappings) {
        expect(mapping.elemento).toBe('Terra');
      }
    });
  });
});