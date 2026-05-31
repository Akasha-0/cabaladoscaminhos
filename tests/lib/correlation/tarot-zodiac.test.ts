/**
 * Tests for Tarot-Zodiac Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and zodiac signs
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotZodiac,
  getSignoFromArcano,
  getNumeroCartaFromArcano,
  getElementoFromArcano,
  getSignificadoEspiritualFromArcano,
  getZodiacTarot,
  getAllTarotZodiacs,
  getAllSignos,
  getTarotZodiacsByElement,
  getArcanoByNumber,
  getSignoByNumber,
  hasArcano,
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

    it('should handle trimmed input', () => {
      const mapping = getTarotZodiac('  A Lua  ');
      expect(mapping?.signo).toBe('Câncer');
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

  describe('getNumeroCartaFromArcano', () => {
    it('should return correct card number for each arcano', () => {
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
  });

  describe('getSignificadoEspiritualFromArcano', () => {
    it('should return spiritual meaning for each arcano', () => {
      expect(getSignificadoEspiritualFromArcano('O Sol')).toBeTruthy();
      expect(getSignificadoEspiritualFromArcano('A Lua')).toBeTruthy();
      expect(getSignificadoEspiritualFromArcano('O Eremita')).toBeTruthy();
    });

    it('should return null for unknown arcano', () => {
      expect(getSignificadoEspiritualFromArcano('Unknown')).toBeNull();
    });
  });

  describe('getZodiacTarot', () => {
    it('should return arcano for Áries', () => {
      expect(getZodiacTarot('Áries')).toBe('O Imperador');
    });

    it('should return arcano for Leão', () => {
      expect(getZodiacTarot('Leão')).toBe('O Sol');
    });

    it('should return arcano for Sagitário', () => {
      expect(getZodiacTarot('Sagitário')).toBe('O Hierofante');
    });

    it('should handle lowercase input', () => {
      expect(getZodiacTarot('aries')).toBe('O Imperador');
    });

    it('should return null for unknown sign', () => {
      expect(getZodiacTarot('UnknownSign')).toBeNull();
    });
  });

  describe('getAllTarotZodiacs', () => {
    it('should return all 12 mappings', () => {
      const allMappings = getAllTarotZodiacs();
      expect(allMappings).toHaveLength(12);
    });

    it('should contain all major arcano', () => {
      const allMappings = getAllTarotZodiacs();
      const arcanos = allMappings.map((m) => m.arcano);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
    });

    it('should contain all zodiac signs', () => {
      const allMappings = getAllTarotZodiacs();
      const signos = allMappings.map((m) => m.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Peixes');
    });
  });

  describe('getAllSignos', () => {
    it('should return 12 zodiac signs', () => {
      const signos = getAllSignos();
      expect(signos).toHaveLength(12);
    });

    it('should include all zodiac signs', () => {
      const signos = getAllSignos();
      expect(signos).toContain('Áries');
      expect(signos).toContain('Touro');
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Aquário');
      expect(signos).toContain('Peixes');
    });
  });

  describe('getTarotZodiacsByElement', () => {
    it('should return 3 mappings for fire element', () => {
      const fireMappings = getTarotZodiacsByElement('Fogo');
      expect(fireMappings).toHaveLength(3);
      expect(fireMappings.map((m) => m.arcano)).toContain('O Imperador');
      expect(fireMappings.map((m) => m.arcano)).toContain('O Sol');
      expect(fireMappings.map((m) => m.arcano)).toContain('O Hierofante');
    });

    it('should return 3 mappings for water element', () => {
      const waterMappings = getTarotZodiacsByElement('Água');
      expect(waterMappings).toHaveLength(3);
      expect(waterMappings.map((m) => m.arcano)).toContain('A Lua');
      expect(waterMappings.map((m) => m.arcano)).toContain('A Morte');
      expect(waterMappings.map((m) => m.arcano)).toContain('O Eremita');
    });

    it('should return 3 mappings for air element', () => {
      const airMappings = getTarotZodiacsByElement('Ar');
      expect(airMappings).toHaveLength(3);
      expect(airMappings.map((m) => m.arcano)).toContain('Os Enamorados');
      expect(airMappings.map((m) => m.arcano)).toContain('A Justiça');
      expect(airMappings.map((m) => m.arcano)).toContain('A Estrela');
    });

    it('should return 3 mappings for earth element', () => {
      const earthMappings = getTarotZodiacsByElement('Terra');
      expect(earthMappings).toHaveLength(3);
      expect(earthMappings.map((m) => m.arcano)).toContain('A Imperatriz');
      expect(earthMappings.map((m) => m.arcano)).toContain('A Torre');
      expect(earthMappings.map((m) => m.arcano)).toContain('O Diabo');
    });

    it('should return empty array for unknown element', () => {
      const mappings = getTarotZodiacsByElement('Unknown');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano for known card number', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
      expect(getArcanoByNumber(19)).toBe('O Sol');
      expect(getArcanoByNumber(18)).toBe('A Lua');
      expect(getArcanoByNumber(9)).toBe('O Eremita');
    });

    it('should return null for unknown card number', () => {
      expect(getArcanoByNumber(0)).toBeNull();
      expect(getArcanoByNumber(1)).toBeNull();
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('getSignoByNumber', () => {
    it('should return zodiac sign for known card number', () => {
      expect(getSignoByNumber(4)).toBe('Áries');
      expect(getSignoByNumber(19)).toBe('Leão');
      expect(getSignoByNumber(11)).toBe('Libra');
    });

    it('should return null for unknown card number', () => {
      expect(getSignoByNumber(0)).toBeNull();
      expect(getSignoByNumber(99)).toBeNull();
    });
  });

  describe('hasArcano', () => {
    it('should return true for known arcano', () => {
      expect(hasArcano('O Sol')).toBe(true);
      expect(hasArcano('A Lua')).toBe(true);
    });

    it('should return false for unknown arcano', () => {
      expect(hasArcano('Unknown')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasArcano('')).toBe(false);
    });
  });

  describe('TAROT_ZODIAC_MAP constant', () => {
    it('should have 12 entries', () => {
      expect(Object.keys(TAROT_ZODIAC_MAP)).toHaveLength(12);
    });

    it('should have all Major Arcana cards', () => {
      const expectedArcanos = [
        'O Imperador', 'A Imperatriz', 'Os Enamorados', 'A Lua', 'O Sol',
        'A Torre', 'A Justiça', 'A Morte', 'O Hierofante', 'O Diabo',
        'A Estrela', 'O Eremita'
      ];
      for (const arcano of expectedArcanos) {
        expect(TAROT_ZODIAC_MAP[arcano]).toBeDefined();
      }
    });

    it('should have correct card numbers', () => {
      expect(TAROT_ZODIAC_MAP['O Imperador'].numero_carta).toBe(4);
      expect(TAROT_ZODIAC_MAP['A Imperatriz'].numero_carta).toBe(3);
      expect(TAROT_ZODIAC_MAP['Os Enamorados'].numero_carta).toBe(6);
    });

    it('should be immutable', () => {
      expect(() => {
        (TAROT_ZODIAC_MAP as Record<string, unknown>)['newKey'] = {};
      }).toThrow();
    });
  });

  describe('TODOS_ARCANOS_ZODIAC constant', () => {
    it('should have 12 arcano names', () => {
      expect(TODOS_ARCANOS_ZODIAC).toHaveLength(12);
    });

    it('should contain major arcano names', () => {
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Sol');
      expect(TODOS_ARCANOS_ZODIAC).toContain('A Lua');
      expect(TODOS_ARCANOS_ZODIAC).toContain('O Eremita');
    });

    it('should be immutable', () => {
      expect(() => {
        (TODOS_ARCANOS_ZODIAC as unknown as string[]).push('test');
      }).toThrow();
    });
  });

  describe('Bidirectional mapping consistency', () => {
    it('should be consistent with zodiac-tarot mapping', () => {
      const allMappings = getAllTarotZodiacs();
      for (const mapping of allMappings) {
        const reverseArcano = getZodiacTarot(mapping.signo);
        expect(reverseArcano).toBe(mapping.arcano);
      }
    });

    it('each arcano should map to exactly one sign', () => {
      const allMappings = getAllTarotZodiacs();
      const signos = allMappings.map((m) => m.signo);
      const uniqueSignos = new Set(signos);
      expect(uniqueSignos.size).toBe(signos.length);
    });
  });

  describe('Element-to-arcano relationship verification', () => {
    it('fire element should correspond to cardinal signs', () => {
      const fireMappings = getTarotZodiacsByElement('Fogo');
      const fireSignos = fireMappings.map((m) => m.signo);
      expect(fireSignos).toContain('Áries');
      expect(fireSignos).toContain('Leão');
      expect(fireSignos).toContain('Sagitário');
    });

    it('water element should correspond to Scorpio/Fixed/Cardi signs', () => {
      const waterMappings = getTarotZodiacsByElement('Água');
      const waterSignos = waterMappings.map((m) => m.signo);
      expect(waterSignos).toContain('Câncer');
      expect(waterSignos).toContain('Escorpião');
      expect(waterSignos).toContain('Peixes');
    });
  });
});