/**
 * Tests for Tarot-Zodiac Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and zodiac signs
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotZodiac,
  getSignoFromArcano,
  getAllTarotZodiacs,
  getElementoFromArcano,
  getSignificadoEspiritualFromArcano,
  getNumeroCartaFromArcano,
  getArcanoFromSigno,
  getAllArcanos,
  getTarotZodiacsByElement,
  getAllSigns,
  TAROT_ZODIAC_MAP,
  TODOS_ARCANOS_TAROT_ZODIAC,
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
      const mapping = getTarotZodiac('o imperador');
      expect(mapping?.signo).toBe('Áries');
    });

    it('should handle trimmed input', () => {
      const mapping = getTarotZodiac('  O Sol  ');
      expect(mapping?.signo).toBe('Leão');
    });

    it('should return null for unknown arcano', () => {
      const mapping = getTarotZodiac('UnknownArcano');
      expect(mapping).toBeNull();
    });

    it('should handle empty string', () => {
      const mapping = getTarotZodiac('');
      expect(mapping).toBeNull();
    });
  });

  describe('getSignoFromArcano', () => {
    it('should return Áries for O Imperador', () => {
      const signo = getSignoFromArcano('O Imperador');
      expect(signo).toBe('Áries');
    });

    it('should return Touro for A Imperatriz', () => {
      const signo = getSignoFromArcano('A Imperatriz');
      expect(signo).toBe('Touro');
    });

    it('should return Gémeos for Os Enamorados', () => {
      const signo = getSignoFromArcano('Os Enamorados');
      expect(signo).toBe('Gémeos');
    });

    it('should return Câncer for A Lua', () => {
      const signo = getSignoFromArcano('A Lua');
      expect(signo).toBe('Câncer');
    });

    it('should return Leão for O Sol', () => {
      const signo = getSignoFromArcano('O Sol');
      expect(signo).toBe('Leão');
    });

    it('should return null for unknown arcano', () => {
      const signo = getSignoFromArcano('Unknown Arcano');
      expect(signo).toBeNull();
    });

    it('should handle trimmed input', () => {
      const signo = getSignoFromArcano('  O Sol  ');
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

    it('should handle lowercase input', () => {
      expect(getArcanoFromSigno('aries')).toBe('O Imperador');
      expect(getArcanoFromSigno('touro')).toBe('A Imperatriz');
    });

    it('should handle variations', () => {
      expect(getArcanoFromSigno('gemeos')).toBe('Os Enamorados');
      expect(getArcanoFromSigno('gem')).toBe('Os Enamorados');
      expect(getArcanoFromSigno('cancer')).toBe('A Lua');
      expect(getArcanoFromSigno('canc')).toBe('A Lua');
      expect(getArcanoFromSigno('leao')).toBe('O Sol');
      expect(getArcanoFromSigno('leo')).toBe('O Sol');
      expect(getArcanoFromSigno('escorpiao')).toBe('A Morte');
      expect(getArcanoFromSigno('esc')).toBe('A Morte');
      expect(getArcanoFromSigno('sagitario')).toBe('O Hierofante');
      expect(getArcanoFromSigno('sag')).toBe('O Hierofante');
      expect(getArcanoFromSigno('capricornio')).toBe('O Diabo');
      expect(getArcanoFromSigno('cap')).toBe('O Diabo');
      expect(getArcanoFromSigno('aquario')).toBe('A Estrela');
      expect(getArcanoFromSigno('aqu')).toBe('A Estrela');
    });

    it('should return null for unknown sign', () => {
      expect(getArcanoFromSigno('Unknown')).toBeNull();
    });
  });

  describe('getElementoFromArcano', () => {
    it('should return correct element for fire signs', () => {
      expect(getElementoFromArcano('O Imperador')).toBe('Fogo');
      expect(getElementoFromArcano('O Sol')).toBe('Fogo');
      expect(getElementoFromArcano('O Hierofante')).toBe('Fogo');
    });

    it('should return correct element for water signs', () => {
      expect(getElementoFromArcano('A Lua')).toBe('Água');
      expect(getElementoFromArcano('A Morte')).toBe('Água');
      expect(getElementoFromArcano('O Eremita')).toBe('Água');
    });

    it('should return correct element for air signs', () => {
      expect(getElementoFromArcano('Os Enamorados')).toBe('Ar');
      expect(getElementoFromArcano('A Justiça')).toBe('Ar');
      expect(getElementoFromArcano('A Estrela')).toBe('Ar');
    });

    it('should return correct element for earth signs', () => {
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
      expect(getSignificadoEspiritualFromArcano('O Sol')).toBeTruthy();
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

  describe('getAllTarotZodiacs', () => {
    it('should return all 12 mappings', () => {
      const allMappings = getAllTarotZodiacs();
      expect(allMappings).toHaveLength(12);
    });

    it('should contain all arcanos', () => {
      const allMappings = getAllTarotZodiacs();
      const arcanos = allMappings.map((m) => m.arcano);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Imperador');
    });

    it('should contain all unique signs', () => {
      const allMappings = getAllTarotZodiacs();
      const signos = allMappings.map((m) => m.signo);
      const uniqueSignos = new Set(signos);
      expect(uniqueSignos.size).toBe(12);
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
    });

    it('should have unique values', () => {
      const arcanos = getAllArcanos();
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(12);
    });
  });

  describe('getTarotZodiacsByElement', () => {
    it('should return 3 fire sign arcanos', () => {
      const mappings = getTarotZodiacsByElement('Fogo');
      expect(mappings).toHaveLength(3);
      expect(mappings.map((m) => m.arcano)).toContain('O Imperador');
      expect(mappings.map((m) => m.arcano)).toContain('O Sol');
      expect(mappings.map((m) => m.arcano)).toContain('O Hierofante');
    });

    it('should return 3 water sign arcanos', () => {
      const mappings = getTarotZodiacsByElement('Água');
      expect(mappings).toHaveLength(3);
      expect(mappings.map((m) => m.arcano)).toContain('A Lua');
      expect(mappings.map((m) => m.arcano)).toContain('A Morte');
      expect(mappings.map((m) => m.arcano)).toContain('O Eremita');
    });

    it('should return 3 air sign arcanos', () => {
      const mappings = getTarotZodiacsByElement('Ar');
      expect(mappings).toHaveLength(3);
      expect(mappings.map((m) => m.arcano)).toContain('Os Enamorados');
      expect(mappings.map((m) => m.arcano)).toContain('A Justiça');
      expect(mappings.map((m) => m.arcano)).toContain('A Estrela');
    });

    it('should return 3 earth sign arcanos', () => {
      const mappings = getTarotZodiacsByElement('Terra');
      expect(mappings).toHaveLength(3);
      expect(mappings.map((m) => m.arcano)).toContain('A Imperatriz');
      expect(mappings.map((m) => m.arcano)).toContain('A Torre');
      expect(mappings.map((m) => m.arcano)).toContain('O Diabo');
    });

    it('should return empty array for unknown element', () => {
      const mappings = getTarotZodiacsByElement('Unknown');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('getAllSigns', () => {
    it('should return all 12 zodiac signs', () => {
      const signs = getAllSigns();
      expect(signs).toHaveLength(12);
    });

    it('should contain all zodiac signs', () => {
      const signs = getAllSigns();
      expect(signs).toContain('Áries');
      expect(signs).toContain('Peixes');
    });

    it('should have unique values', () => {
      const signs = getAllSigns();
      const uniqueSigns = new Set(signs);
      expect(uniqueSigns.size).toBe(12);
    });
  });

  describe('TAROT_ZODIAC_MAP', () => {
    it('should have 12 entries', () => {
      expect(Object.keys(TAROT_ZODIAC_MAP)).toHaveLength(12);
    });

    it('should have consistent data in each mapping', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.signo).toBeTruthy();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
      }
    });

    it('should have valid card numbers (3-19 range)', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(3);
        expect(mapping.numero_carta).toBeLessThanOrEqual(19);
      }
    });

    it('should have valid elements', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água'];
      for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  describe('TODOS_ARCANOS_TAROT_ZODIAC', () => {
    it('should have 12 arcano names', () => {
      expect(TODOS_ARCANOS_TAROT_ZODIAC).toHaveLength(12);
    });

    it('should contain the major arcanos', () => {
      expect(TODOS_ARCANOS_TAROT_ZODIAC).toContain('O Sol');
      expect(TODOS_ARCANOS_TAROT_ZODIAC).toContain('A Lua');
      expect(TODOS_ARCANOS_TAROT_ZODIAC).toContain('O Imperador');
    });

    it('should match the keys of TAROT_ZODIAC_MAP', () => {
      const mapKeys = Object.keys(TAROT_ZODIAC_MAP);
      const arrayValues = [...TODOS_ARCANOS_TAROT_ZODIAC].sort();
      expect(arrayValues).toEqual(mapKeys.sort());
    });
  });

  describe('Element-to-Arcano relationship verification', () => {
    it('should verify element distribution (3 per element)', () => {
      const fire = getTarotZodiacsByElement('Fogo');
      const water = getTarotZodiacsByElement('Água');
      const air = getTarotZodiacsByElement('Ar');
      const earth = getTarotZodiacsByElement('Terra');

      expect(fire).toHaveLength(3);
      expect(water).toHaveLength(3);
      expect(air).toHaveLength(3);
      expect(earth).toHaveLength(3);
    });

    it('should verify bidirectional lookup consistency', () => {
      // For each arcano, getSignoFromArcano should return the same sign
      const allArcanos = getAllArcanos();
      for (const arcano of allArcanos) {
        const mapping = getTarotZodiac(arcano);
        const signoFromArcano = getSignoFromArcano(arcano);
        expect(signoFromArcano).toBe(mapping?.signo);
      }

      // For each sign, getArcanoFromSigno should return the same arcano
      const allSigns = getAllSigns();
      for (const signo of allSigns) {
        const arcano = getArcanoFromSigno(signo);
        const mapping = getTarotZodiac(arcano!);
        expect(mapping?.signo).toBe(signo);
      }
    });
  });
});