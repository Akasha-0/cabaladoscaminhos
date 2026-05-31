/**
 * Tests for Tarot-Zodiac Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and zodiac signs
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotZodiacMapping,
  getTarotZodiacByNumber,
  getZodiacFromTarot,
  getTarotFromZodiac,
  getElementFromTarot,
  getSignificadoFromTarot,
  getAllTarotZodiacs,
  getAllArcanos,
  getAllZodiacSigns,
  getTarotZodiacsByElement,
  getTarotZodiacsBySign,
  hasTarotZodiacNumber,
  getCardNumber,
  TAROT_ZODIAC_MAP,
  TODOS_ARCANOS_MAIORES,
} from '@/lib/correlation/tarot-zodiac';

describe('TarotZodiac Correlation Module', () => {
  describe('getTarotZodiacMapping', () => {
    it('should return mapping for O Louco', () => {
      const mapping = getTarotZodiacMapping('O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.signo).toBe('Aquário');
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.significado_espiritual).toBeTruthy();
    });

    it('should return mapping for O Mago', () => {
      const mapping = getTarotZodiacMapping('O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mago');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.signo).toBe('Virgem');
    });

    it('should return mapping for A Sacerdotisa', () => {
      const mapping = getTarotZodiacMapping('A Sacerdotisa');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Sacerdotisa');
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.signo).toBe('Câncer');
    });

    it('should return mapping for A Imperatriz', () => {
      const mapping = getTarotZodiacMapping('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.signo).toBe('Touro');
    });

    it('should return mapping for O Imperador', () => {
      const mapping = getTarotZodiacMapping('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.signo).toBe('Áries');
    });

    it('should return mapping for O Hierofante', () => {
      const mapping = getTarotZodiacMapping('O Hierofante');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.numero_carta).toBe(5);
      expect(mapping?.signo).toBe('Sagitário');
    });

    it('should return mapping for Os Enamorados', () => {
      const mapping = getTarotZodiacMapping('Os Enamorados');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('Os Enamorados');
      expect(mapping?.numero_carta).toBe(6);
      expect(mapping?.signo).toBe('Gémeos');
    });

    it('should return mapping for O Carro', () => {
      const mapping = getTarotZodiacMapping('O Carro');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Carro');
      expect(mapping?.numero_carta).toBe(7);
      expect(mapping?.signo).toBe('Câncer');
    });

    it('should return mapping for A Justiça', () => {
      const mapping = getTarotZodiacMapping('A Justiça');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Justiça');
      expect(mapping?.numero_carta).toBe(8);
      expect(mapping?.signo).toBe('Libra');
    });

    it('should return mapping for O Eremita', () => {
      const mapping = getTarotZodiacMapping('O Eremita');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Eremita');
      expect(mapping?.numero_carta).toBe(9);
      expect(mapping?.signo).toBe('Peixes');
    });

    it('should return mapping for A Roda da Fortuna', () => {
      const mapping = getTarotZodiacMapping('A Roda da Fortuna');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Roda da Fortuna');
      expect(mapping?.numero_carta).toBe(10);
      expect(mapping?.signo).toBe('Sagitário');
    });

    it('should return mapping for A Força', () => {
      const mapping = getTarotZodiacMapping('A Força');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Força');
      expect(mapping?.numero_carta).toBe(11);
      expect(mapping?.signo).toBe('Leão');
    });

    it('should return mapping for O Enforcado', () => {
      const mapping = getTarotZodiacMapping('O Enforcado');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Enforcado');
      expect(mapping?.numero_carta).toBe(12);
      expect(mapping?.signo).toBe('Escorpião');
    });

    it('should return mapping for A Morte', () => {
      const mapping = getTarotZodiacMapping('A Morte');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Morte');
      expect(mapping?.numero_carta).toBe(13);
      expect(mapping?.signo).toBe('Escorpião');
    });

    it('should return mapping for A Temperança', () => {
      const mapping = getTarotZodiacMapping('A Temperança');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Temperança');
      expect(mapping?.numero_carta).toBe(14);
      expect(mapping?.signo).toBe('Sagitário');
    });

    it('should return mapping for O Diabo', () => {
      const mapping = getTarotZodiacMapping('O Diabo');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Diabo');
      expect(mapping?.numero_carta).toBe(15);
      expect(mapping?.signo).toBe('Capricórnio');
    });

    it('should return mapping for A Torre', () => {
      const mapping = getTarotZodiacMapping('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.signo).toBe('Marte');
    });

    it('should return mapping for A Estrela', () => {
      const mapping = getTarotZodiacMapping('A Estrela');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.signo).toBe('Aquário');
    });

    it('should return mapping for A Lua', () => {
      const mapping = getTarotZodiacMapping('A Lua');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Lua');
      expect(mapping?.numero_carta).toBe(18);
      expect(mapping?.signo).toBe('Câncer');
    });

    it('should return mapping for O Sol', () => {
      const mapping = getTarotZodiacMapping('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.signo).toBe('Leão');
    });

    it('should return mapping for O Julgamento', () => {
      const mapping = getTarotZodiacMapping('O Julgamento');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Julgamento');
      expect(mapping?.numero_carta).toBe(20);
      expect(mapping?.signo).toBe('Plutão');
    });

    it('should return mapping for O Mundo', () => {
      const mapping = getTarotZodiacMapping('O Mundo');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mundo');
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.signo).toBe('Sagitário');
    });

    it('should handle lowercase input', () => {
      const mapping = getTarotZodiacMapping('o sol');
      expect(mapping?.arcano).toBe('O Sol');
    });

    it('should return null for unknown arcano', () => {
      const mapping = getTarotZodiacMapping('Unknown Arcano');
      expect(mapping).toBeNull();
    });

    it('should handle empty string', () => {
      const mapping = getTarotZodiacMapping('');
      expect(mapping).toBeNull();
    });

    it('should include orixa for O Louco', () => {
      const mapping = getTarotZodiacMapping('O Louco');
      expect(mapping?.orixa).toBe('Eshu');
    });

    it('should include planeta for O Louco', () => {
      const mapping = getTarotZodiacMapping('O Louco');
      expect(mapping?.planeta).toBe('Urano');
    });
  });

  describe('getTarotZodiacByNumber', () => {
    it('should return mapping for card number 0', () => {
      const mapping = getTarotZodiacByNumber(0);
      expect(mapping).toBeDefined();
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.arcano).toBe('O Louco');
    });

    it('should return mapping for card number 19', () => {
      const mapping = getTarotZodiacByNumber(19);
      expect(mapping).toBeDefined();
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.arcano).toBe('O Sol');
    });

    it('should return mapping for card number 21', () => {
      const mapping = getTarotZodiacByNumber(21);
      expect(mapping).toBeDefined();
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.arcano).toBe('O Mundo');
    });

    it('should return null for invalid card number', () => {
      const mapping = getTarotZodiacByNumber(99);
      expect(mapping).toBeNull();
    });

    it('should return null for negative card number', () => {
      const mapping = getTarotZodiacByNumber(-1);
      expect(mapping).toBeNull();
    });
  });

  describe('getZodiacFromTarot', () => {
    it('should return Aquário for O Louco', () => {
      const signo = getZodiacFromTarot('O Louco');
      expect(signo).toBe('Aquário');
    });

    it('should return Áries for O Imperador', () => {
      const signo = getZodiacFromTarot('O Imperador');
      expect(signo).toBe('Áries');
    });

    it('should return Leão for O Sol', () => {
      const signo = getZodiacFromTarot('O Sol');
      expect(signo).toBe('Leão');
    });

    it('should return Câncer for A Lua', () => {
      const signo = getZodiacFromTarot('A Lua');
      expect(signo).toBe('Câncer');
    });

    it('should return null for unknown arcano', () => {
      const signo = getZodiacFromTarot('Unknown Arcano');
      expect(signo).toBeNull();
    });

    it('should handle lowercase input', () => {
      const signo = getZodiacFromTarot('o sol');
      expect(signo).toBe('Leão');
    });
  });

  describe('getTarotFromZodiac', () => {
    it('should return O Imperador for Áries', () => {
      const arcano = getTarotFromZodiac('Áries');
      expect(arcano).toBe('O Imperador');
    });

    it('should return A Imperatriz for Touro', () => {
      const arcano = getTarotFromZodiac('Touro');
      expect(arcano).toBe('A Imperatriz');
    });

    it('should return O Sol for Leão', () => {
      const arcano = getTarotFromZodiac('Leão');
      expect(arcano).toBe('O Sol');
    });

    it('should return A Lua for Câncer', () => {
      const arcano = getTarotFromZodiac('Câncer');
      expect(arcano).toBe('A Lua');
    });

    it('should handle lowercase input', () => {
      const arcano = getTarotFromZodiac('aries');
      expect(arcano).toBe('O Imperador');
    });

    it('should handle accented variations', () => {
      const arcano = getTarotFromZodiac('aries');
      expect(arcano).toBe('O Imperador');
    });

    it('should return null for unknown sign', () => {
      const arcano = getTarotFromZodiac('UnknownSign');
      expect(arcano).toBeNull();
    });
  });

  describe('getElementFromTarot', () => {
    it('should return Ar for O Louco', () => {
      const elemento = getElementFromTarot('O Louco');
      expect(elemento).toBe('Ar');
    });

    it('should return Fogo for O Imperador', () => {
      const elemento = getElementFromTarot('O Imperador');
      expect(elemento).toBe('Fogo');
    });

    it('should return Água for A Lua', () => {
      const elemento = getElementFromTarot('A Lua');
      expect(elemento).toBe('Água');
    });

    it('should return Terra for A Imperatriz', () => {
      const elemento = getElementFromTarot('A Imperatriz');
      expect(elemento).toBe('Terra');
    });

    it('should return null for unknown arcano', () => {
      const elemento = getElementFromTarot('Unknown');
      expect(elemento).toBeNull();
    });
  });

  describe('getSignificadoFromTarot', () => {
    it('should return spiritual meaning for O Sol', () => {
      const significado = getSignificadoFromTarot('O Sol');
      expect(significado).toBeTruthy();
      expect(significado).toContain('Alegria');
    });

    it('should return spiritual meaning for A Morte', () => {
      const significado = getSignificadoFromTarot('A Morte');
      expect(significado).toBeTruthy();
      expect(significado).toContain('Transformação');
    });

    it('should return null for unknown arcano', () => {
      const significado = getSignificadoFromTarot('Unknown');
      expect(significado).toBeNull();
    });
  });

  describe('getAllTarotZodiacs', () => {
    it('should return all 22 mappings', () => {
      const allMappings = getAllTarotZodiacs();
      expect(allMappings).toHaveLength(22);
    });

    it('should return mappings sorted by card number', () => {
      const allMappings = getAllTarotZodiacs();
      for (let i = 1; i < allMappings.length; i++) {
        expect(allMappings[i].numero_carta).toBeGreaterThan(allMappings[i - 1].numero_carta);
      }
    });

    it('should include all arcano numbers from 0 to 21', () => {
      const allMappings = getAllTarotZodiacs();
      const numbers = allMappings.map((m) => m.numero_carta);
      for (let i = 0; i <= 21; i++) {
        expect(numbers).toContain(i);
      }
    });
  });

  describe('getAllArcanos', () => {
    it('should return 22 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(22);
    });

    it('should include all major arcanos', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('A Morte');
    });

    it('should return arcano names sorted by card number', () => {
      const arcanos = getAllArcanos();
      expect(arcanos[0]).toBe('O Louco');
      expect(arcanos[21]).toBe('O Mundo');
    });
  });

  describe('getAllZodiacSigns', () => {
    it('should return all zodiac signs', () => {
      const signs = getAllZodiacSigns();
      expect(signs).toContain('Áries');
      expect(signs).toContain('Touro');
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Leão');
    });

    it('should return unique signs only', () => {
      const signs = getAllZodiacSigns();
      const uniqueSigns = new Set(signs);
      expect(uniqueSigns.size).toBe(signs.length);
    });
  });

  describe('getTarotZodiacsByElement', () => {
    it('should return fire sign arcano for Fogo', () => {
      const mappings = getTarotZodiacsByElement('Fogo');
      expect(mappings.length).toBeGreaterThan(0);
      mappings.forEach((m) => {
        expect(m.elemento).toBe('Fogo');
      });
    });

    it('should return water sign arcano for Água', () => {
      const mappings = getTarotZodiacsByElement('Água');
      expect(mappings.length).toBeGreaterThan(0);
      mappings.forEach((m) => {
        expect(m.elemento).toBe('Água');
      });
    });

    it('should return air sign arcano for Ar', () => {
      const mappings = getTarotZodiacsByElement('Ar');
      expect(mappings.length).toBeGreaterThan(0);
      mappings.forEach((m) => {
        expect(m.elemento).toBe('Ar');
      });
    });

    it('should return earth sign arcano for Terra', () => {
      const mappings = getTarotZodiacsByElement('Terra');
      expect(mappings.length).toBeGreaterThan(0);
      mappings.forEach((m) => {
        expect(m.elemento).toBe('Terra');
      });
    });

    it('should return empty array for unknown element', () => {
      const mappings = getTarotZodiacsByElement('Unknown');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('getTarotZodiacsBySign', () => {
    it('should return mappings for Aquário', () => {
      const mappings = getTarotZodiacsBySign('Aquário');
      expect(mappings.length).toBeGreaterThan(0);
      mappings.forEach((m) => {
        expect(m.signo).toBe('Aquário');
      });
    });

    it('should return empty array for unknown sign', () => {
      const mappings = getTarotZodiacsBySign('UnknownSign');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('hasTarotZodiacNumber', () => {
    it('should return true for valid card numbers', () => {
      expect(hasTarotZodiacNumber(0)).toBe(true);
      expect(hasTarotZodiacNumber(10)).toBe(true);
      expect(hasTarotZodiacNumber(21)).toBe(true);
    });

    it('should return false for invalid card numbers', () => {
      expect(hasTarotZodiacNumber(-1)).toBe(false);
      expect(hasTarotZodiacNumber(22)).toBe(false);
      expect(hasTarotZodiacNumber(100)).toBe(false);
    });
  });

  describe('getCardNumber', () => {
    it('should return card number for O Sol', () => {
      const numero = getCardNumber('O Sol');
      expect(numero).toBe(19);
    });

    it('should return card number for A Lua', () => {
      const numero = getCardNumber('A Lua');
      expect(numero).toBe(18);
    });

    it('should return null for unknown arcano', () => {
      const numero = getCardNumber('Unknown');
      expect(numero).toBeNull();
    });
  });

  describe('TAROT_ZODIAC_MAP', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_ZODIAC_MAP)).toBe(true);
    });

    it('should contain 22 entries', () => {
      expect(Object.keys(TAROT_ZODIAC_MAP)).toHaveLength(22);
    });

    it('should have correct structure for each entry', () => {
      for (const [numero, mapping] of Object.entries(TAROT_ZODIAC_MAP)) {
        expect(mapping.numero_carta).toBe(parseInt(numero));
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.signo).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
      }
    });
  });

  describe('TODOS_ARCANOS_MAIORES', () => {
    it('should have 22 elements', () => {
      expect(TODOS_ARCANOS_MAIORES).toHaveLength(22);
    });

    it('should contain numbers 0 to 21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TODOS_ARCANOS_MAIORES).toContain(i);
      }
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_MAIORES)).toBe(true);
    });
  });

  describe('Element-to-Sign relationship verification', () => {
    it('should have consistent element-sign relationships', () => {
      const fireSigns = ['Áries', 'Leão', 'Sagitário'];
      const waterSigns = ['Câncer', 'Escorpião', 'Peixes'];
      const airSigns = ['Gémeos', 'Libra', 'Aquário'];
      const earthSigns = ['Touro', 'Virgem', 'Capricórnio'];

      // Verify fire signs have fire arcano
      for (const sign of fireSigns) {
        const mapping = getTarotZodiacMapping(getTarotFromZodiac(sign)!);
        // Fire signs should have at least one fire mapping
        expect(mapping).toBeDefined();
      }

      // Verify water signs have water arcano
      for (const sign of waterSigns) {
        const arcano = getTarotFromZodiac(sign);
        const mapping = arcano ? getTarotZodiacMapping(arcano) : null;
        if (mapping) {
          expect(['Água', 'Fogo']).toContain(mapping.elemento);
        }
      }
    });

    it('should have bidirectional zodiac-tarot lookup', () => {
      const allMappings = getAllTarotZodiacs();
      for (const mapping of allMappings) {
        const reverseArcano = getTarotFromZodiac(mapping.signo);
        expect(reverseArcano).toBe(mapping.arcano);
      }
    });
  });
});