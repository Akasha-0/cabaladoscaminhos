/**
 * Tarot-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotPlanet,
  getPlanetTarot,
  getAllTarotPlanets,
  getAllArcanos,
  getAllPlanets,
  hasTarotPlanet,
  hasPlanetTarot,
  getPlanetByNumber,
  getArcanoByNumber,
  getPlanetByArcano,
  getElementByArcano,
  getSignificadoByArcano,
  getInterpretacaoByArcano,
  getArcanosByElement,
  getPlanetsByElement,
  TAROT_PLANET_MAPPINGS,
  type TarotPlanetMapping,
} from '@/lib/correlation/tarot-planet';

describe('Tarot-Planet Correlation', () => {
  describe('getTarotPlanet', () => {
    it('should return mapping for valid arcano O Sol', () => {
      const result = getTarotPlanet('O Sol');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('should return mapping for valid arcano A Lua', () => {
      const result = getTarotPlanet('A Lua');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.numero_carta).toBe(18);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('should return mapping for valid arcano O Imperador', () => {
      const result = getTarotPlanet('O Imperador');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Marte');
      expect(result?.numero_carta).toBe(4);
    });

    it('should return mapping for valid arcano O Mago', () => {
      const result = getTarotPlanet('O Mago');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.numero_carta).toBe(1);
    });

    it('should return mapping for valid arcano A Imperatriz', () => {
      const result = getTarotPlanet('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.numero_carta).toBe(3);
    });

    it('should return mapping for valid arcano O Hierofante', () => {
      const result = getTarotPlanet('O Hierofante');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.numero_carta).toBe(5);
    });

    it('should return mapping for valid arcano O Mundo', () => {
      const result = getTarotPlanet('O Mundo');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.numero_carta).toBe(21);
    });

    it('should return mapping for valid arcano A Sacerdotisa', () => {
      const result = getTarotPlanet('A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.numero_carta).toBe(2);
    });

    it('should return mapping for valid arcano O Louco', () => {
      const result = getTarotPlanet('O Louco');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Urano');
      expect(result?.numero_carta).toBe(0);
    });

    it('should return null for invalid arcano', () => {
      const result = getTarotPlanet('Invalid Arcano');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getTarotPlanet('');
      expect(result).toBeNull();
    });

    it('should return mapping with spiritual meaning', () => {
      const result = getTarotPlanet('O Sol');
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.significado_espiritual.length).toBeGreaterThan(0);
    });

    it('should return mapping with interpretation', () => {
      const result = getTarotPlanet('O Sol');
      expect(result?.interpretacao).toBeTruthy();
      expect(result?.interpretacao.length).toBeGreaterThan(0);
    });
  });

  describe('getPlanetTarot', () => {
    it('should return arcano for Sol', () => {
      const result = getPlanetTarot('Sol');
      expect(result).toBe('O Sol');
    });

    it('should return arcano for Lua', () => {
      const result = getPlanetTarot('Lua');
      expect(result).toBe('A Lua');
    });

    it('should return arcano for Marte', () => {
      const result = getPlanetTarot('Marte');
      expect(result).toBe('O Imperador');
    });

    it('should return arcano for Mercúrio', () => {
      const result = getPlanetTarot('Mercúrio');
      expect(result).toBe('O Mago');
    });

    it('should return arcano for Vênus', () => {
      const result = getPlanetTarot('Vênus');
      expect(result).toBe('A Imperatriz');
    });

    it('should return arcano for Júpiter', () => {
      const result = getPlanetTarot('Júpiter');
      expect(result).toBe('O Hierofante');
    });

    it('should return arcano for Saturno', () => {
      const result = getPlanetTarot('Saturno');
      expect(result).toBe('O Mundo');
    });

    it('should return arcano for Urano', () => {
      const result = getPlanetTarot('Urano');
      expect(result).toBe('O Louco');
    });

    it('should return null for invalid planet', () => {
      const result = getPlanetTarot('Netuno');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getPlanetTarot('');
      expect(result).toBeNull();
    });
  });

  describe('getAllTarotPlanets', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPlanets();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBe(9);
    });

    it('should return mappings with all required fields', () => {
      const result = getAllTarotPlanets();
      result.forEach((mapping) => {
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.planeta).toBeTruthy();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento_conexao).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.interpretacao).toBeTruthy();
      });
    });

    it('should return unique arcano names', () => {
      const result = getAllTarotPlanets();
      const arcanoNames = result.map((m) => m.arcano);
      const uniqueNames = new Set(arcanoNames);
      expect(uniqueNames.size).toBe(arcanoNames.length);
    });
  });

  describe('getAllArcanos', () => {
    it('should return array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include major arcana cards', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('A Lua');
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Mago');
    });

    it('should return unique names', () => {
      const result = getAllArcanos();
      const uniqueNames = new Set(result);
      expect(uniqueNames.size).toBe(result.length);
    });
  });

  describe('getAllPlanets', () => {
    it('should return array of planet names', () => {
      const result = getAllPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include classical planets', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercúrio');
      expect(result).toContain('Vênus');
      expect(result).toContain('Júpiter');
      expect(result).toContain('Saturno');
      expect(result).toContain('Urano');
    });

    it('should return unique names', () => {
      const result = getAllPlanets();
      const uniqueNames = new Set(result);
      expect(uniqueNames.size).toBe(result.length);
    });
  });

  describe('hasTarotPlanet', () => {
    it('should return true for valid arcano', () => {
      expect(hasTarotPlanet('O Sol')).toBe(true);
      expect(hasTarotPlanet('A Lua')).toBe(true);
      expect(hasTarotPlanet('O Imperador')).toBe(true);
    });

    it('should return false for invalid arcano', () => {
      expect(hasTarotPlanet('Invalid')).toBe(false);
      expect(hasTarotPlanet('')).toBe(false);
    });
  });

  describe('hasPlanetTarot', () => {
    it('should return true for valid planet', () => {
      expect(hasPlanetTarot('Sol')).toBe(true);
      expect(hasPlanetTarot('Lua')).toBe(true);
      expect(hasPlanetTarot('Marte')).toBe(true);
    });

    it('should return false for invalid planet', () => {
      expect(hasPlanetTarot('Netuno')).toBe(false);
      expect(hasPlanetTarot('')).toBe(false);
    });
  });

  describe('getPlanetByNumber', () => {
    it('should return planet for card number 19', () => {
      const result = getPlanetByNumber(19);
      expect(result).toBe('Sol');
    });

    it('should return planet for card number 18', () => {
      const result = getPlanetByNumber(18);
      expect(result).toBe('Lua');
    });

    it('should return planet for card number 4', () => {
      const result = getPlanetByNumber(4);
      expect(result).toBe('Marte');
    });

    it('should return planet for card number 1', () => {
      const result = getPlanetByNumber(1);
      expect(result).toBe('Mercúrio');
    });

    it('should return planet for card number 0', () => {
      const result = getPlanetByNumber(0);
      expect(result).toBe('Urano');
    });

    it('should return null for invalid card number', () => {
      const result = getPlanetByNumber(99);
      expect(result).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano for card number 19', () => {
      const result = getArcanoByNumber(19);
      expect(result).toBe('O Sol');
    });

    it('should return arcano for card number 18', () => {
      const result = getArcanoByNumber(18);
      expect(result).toBe('A Lua');
    });

    it('should return arcano for card number 4', () => {
      const result = getArcanoByNumber(4);
      expect(result).toBe('O Imperador');
    });

    it('should return arcano for card number 0', () => {
      const result = getArcanoByNumber(0);
      expect(result).toBe('O Louco');
    });

    it('should return null for invalid card number', () => {
      const result = getArcanoByNumber(99);
      expect(result).toBeNull();
    });
  });

  describe('getPlanetByArcano', () => {
    it('should return planet for O Sol', () => {
      const result = getPlanetByArcano('O Sol');
      expect(result).toBe('Sol');
    });

    it('should return planet for A Lua', () => {
      const result = getPlanetByArcano('A Lua');
      expect(result).toBe('Lua');
    });

    it('should return null for invalid arcano', () => {
      const result = getPlanetByArcano('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getElementByArcano', () => {
    it('should return element for O Sol', () => {
      const result = getElementByArcano('O Sol');
      expect(result).toBe('Fogo');
    });

    it('should return element for A Lua', () => {
      const result = getElementByArcano('A Lua');
      expect(result).toBe('Água');
    });

    it('should return element for O Mago', () => {
      const result = getElementByArcano('O Mago');
      expect(result).toBe('Ar');
    });

    it('should return null for invalid arcano', () => {
      const result = getElementByArcano('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSignificadoByArcano', () => {
    it('should return spiritual meaning for O Sol', () => {
      const result = getSignificadoByArcano('O Sol');
      expect(result).toBeTruthy();
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      const result = getSignificadoByArcano('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getInterpretacaoByArcano', () => {
    it('should return interpretation for O Sol', () => {
      const result = getInterpretacaoByArcano('O Sol');
      expect(result).toBeTruthy();
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      const result = getInterpretacaoByArcano('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getArcanosByElement', () => {
    it('should return arcano cards for Fogo element', () => {
      const result = getArcanosByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Sol');
      expect(result).toContain('O Imperador');
    });

    it('should return arcano cards for Água element', () => {
      const result = getArcanosByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('A Lua');
      expect(result).toContain('A Sacerdotisa');
    });

    it('should return arcano cards for Ar element', () => {
      const result = getArcanosByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Mago');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('O Louco');
    });

    it('should return arcano cards for Terra element', () => {
      const result = getArcanosByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });

    it('should return empty array for invalid element', () => {
      const result = getArcanosByElement('Invalid');
      expect(result).toEqual([]);
    });
  });

  describe('getPlanetsByElement', () => {
    it('should return planets for Fogo element', () => {
      const result = getPlanetsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Sol');
      expect(result).toContain('Marte');
    });

    it('should return planets for Água element', () => {
      const result = getPlanetsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Lua');
    });

    it('should return planets for Ar element', () => {
      const result = getPlanetsByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Mercúrio');
      expect(result).toContain('Júpiter');
      expect(result).toContain('Urano');
    });

    it('should return planets for Terra element', () => {
      const result = getPlanetsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Vênus');
      expect(result).toContain('Saturno');
    });

    it('should return empty array for invalid element', () => {
      const result = getPlanetsByElement('Invalid');
      expect(result).toEqual([]);
    });
  });

  describe('TAROT_PLANET_MAPPINGS constant', () => {
    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_PLANET_MAPPINGS)).toBe(true);
    });

    it('should contain all major arcana to planet mappings', () => {
      expect(TAROT_PLANET_MAPPINGS['O Sol']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['A Lua']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['O Imperador']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['O Mago']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['A Imperatriz']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['O Hierofante']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['O Mundo']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['A Sacerdotisa']).toBeTruthy();
      expect(TAROT_PLANET_MAPPINGS['O Louco']).toBeTruthy();
    });

    it('should have valid card numbers', () => {
      Object.values(TAROT_PLANET_MAPPINGS).forEach((mapping) => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have consistent arcano-numero_carta relationship', () => {
      Object.entries(TAROT_PLANET_MAPPINGS).forEach(([arcano, mapping]) => {
        const result = getArcanoByNumber(mapping.numero_carta);
        expect(result).toBe(arcano);
      });
    });

    it('should have consistent planet-arcan relationship through getPlanetTarot', () => {
      Object.values(TAROT_PLANET_MAPPINGS).forEach((mapping) => {
        const result = getPlanetTarot(mapping.planeta);
        expect(result).toBe(mapping.arcano);
      });
    });

    it('should have consistent element mapping', () => {
      const fogoArcanos = getArcanosByElement('Fogo');
      fogoArcanos.forEach((arcano) => {
        const element = getElementByArcano(arcano);
        expect(element).toBe('Fogo');
      });
    });
  });
});
