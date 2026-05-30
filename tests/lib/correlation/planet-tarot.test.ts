import { describe, it, expect } from 'vitest';
import {
  getPlanetTarot,
  getTarotPlanet,
  getAllPlanetTarots,
  getAllPlanets,
  hasPlanetTarot,
  getPlanetByNumber,
  getArcanoByNumber,
  PLANET_TAROT_MAPPINGS,
  type PlanetTarotMapping,
} from '@/lib/correlation/planet-tarot';

describe('planet-tarot', () => {
  // ─── getPlanetTarot: valid planets ─────────────────────────────────────────

  describe('getPlanetTarot', () => {
    it('returns mapping for Sol', () => {
      const result = getPlanetTarot('Sol');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.arcano).toBe('O Sol');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(19);
    });

    it('returns mapping for Lua', () => {
      const result = getPlanetTarot('Lua');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.arcano).toBe('A Lua');
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.numero_carta).toBe(18);
    });

    it('returns mapping for Marte', () => {
      const result = getPlanetTarot('Marte');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Marte');
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(4);
    });

    it('returns mapping for Mercurio', () => {
      const result = getPlanetTarot('Mercurio');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.arcano).toBe('O Mago');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(1);
    });

    it('returns mapping for Jupiter', () => {
      const result = getPlanetTarot('Jupiter');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Jupiter');
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(5);
    });

    it('returns mapping for Venus', () => {
      const result = getPlanetTarot('Venus');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Venus');
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(3);
    });

    it('returns mapping for Saturno', () => {
      const result = getPlanetTarot('Saturno');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(21);
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetTarot('Plutão')).toBeNull();
      expect(getPlanetTarot('Netuno')).toBeNull();
      expect(getPlanetTarot('Urano')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetTarot('')).toBeNull();
    });
  });

  // ─── getTarotPlanet ─────────────────────────────────────────────────────────

  describe('getTarotPlanet', () => {
    it('returns Sol for O Sol arcano', () => {
      expect(getTarotPlanet('O Sol')).toBe('Sol');
    });

    it('returns Lua for A Lua arcano', () => {
      expect(getTarotPlanet('A Lua')).toBe('Lua');
    });

    it('returns Marte for O Imperador arcano', () => {
      expect(getTarotPlanet('O Imperador')).toBe('Marte');
    });

    it('returns Mercurio for O Mago arcano', () => {
      expect(getTarotPlanet('O Mago')).toBe('Mercurio');
    });

    it('returns Jupiter for O Hierofante arcano', () => {
      expect(getTarotPlanet('O Hierofante')).toBe('Jupiter');
    });

    it('returns Venus for A Imperatriz arcano', () => {
      expect(getTarotPlanet('A Imperatriz')).toBe('Venus');
    });

    it('returns Saturno for O Mundo arcano', () => {
      expect(getTarotPlanet('O Mundo')).toBe('Saturno');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotPlanet('O Louco')).toBeNull();
      expect(getTarotPlanet('A Justiça')).toBeNull();
    });
  });

  // ─── getAllPlanetTarots ─────────────────────────────────────────────────────

  describe('getAllPlanetTarots', () => {
    it('returns array of 7 mappings', () => {
      const result = getAllPlanetTarots();
      expect(result).toHaveLength(7);
    });

    it('contains all 7 classical planets', () => {
      const result = getAllPlanetTarots();
      const planets = result.map(m => m.planeta);
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercurio');
      expect(planets).toContain('Jupiter');
      expect(planets).toContain('Venus');
      expect(planets).toContain('Saturno');
    });

    it('each mapping has all required fields', () => {
      const result = getAllPlanetTarots();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });

    it('all arcano numbers are unique', () => {
      const result = getAllPlanetTarots();
      const numbers = result.map(m => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(result.length);
    });

    it('all elemento_conexao values are valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra'];
      const result = getAllPlanetTarots();
      for (const mapping of result) {
        expect(validElements).toContain(mapping.elemento_conexao);
      }
    });
  });

  // ─── getAllPlanets ──────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns array of 7 planet names', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
    });

    it('returns correct planet names', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercurio');
      expect(result).toContain('Jupiter');
      expect(result).toContain('Venus');
      expect(result).toContain('Saturno');
    });
  });

  // ─── hasPlanetTarot ─────────────────────────────────────────────────────────

  describe('hasPlanetTarot', () => {
    it('returns true for known planets', () => {
      expect(hasPlanetTarot('Sol')).toBe(true);
      expect(hasPlanetTarot('Lua')).toBe(true);
      expect(hasPlanetTarot('Marte')).toBe(true);
      expect(hasPlanetTarot('Mercurio')).toBe(true);
      expect(hasPlanetTarot('Jupiter')).toBe(true);
      expect(hasPlanetTarot('Venus')).toBe(true);
      expect(hasPlanetTarot('Saturno')).toBe(true);
    });

    it('returns false for unknown planets', () => {
      expect(hasPlanetTarot('Plutão')).toBe(false);
      expect(hasPlanetTarot('Netuno')).toBe(false);
      expect(hasPlanetTarot('Urano')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasPlanetTarot('')).toBe(false);
    });
  });

  // ─── getPlanetByNumber ──────────────────────────────────────────────────────

  describe('getPlanetByNumber', () => {
    it('returns Sol for card number 19', () => {
      expect(getPlanetByNumber(19)).toBe('Sol');
    });

    it('returns Lua for card number 18', () => {
      expect(getPlanetByNumber(18)).toBe('Lua');
    });

    it('returns Marte for card number 4', () => {
      expect(getPlanetByNumber(4)).toBe('Marte');
    });

    it('returns Mercurio for card number 1', () => {
      expect(getPlanetByNumber(1)).toBe('Mercurio');
    });

    it('returns Jupiter for card number 5', () => {
      expect(getPlanetByNumber(5)).toBe('Jupiter');
    });

    it('returns Venus for card number 3', () => {
      expect(getPlanetByNumber(3)).toBe('Venus');
    });

    it('returns Saturno for card number 21', () => {
      expect(getPlanetByNumber(21)).toBe('Saturno');
    });

    it('returns null for invalid card number', () => {
      expect(getPlanetByNumber(0)).toBeNull();
      expect(getPlanetByNumber(22)).toBeNull();
      expect(getPlanetByNumber(10)).toBeNull();
    });
  });

  // ─── getArcanoByNumber ──────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Sol for card number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns A Lua for card number 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('returns O Imperador for card number 4', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
    });

    it('returns O Mago for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns O Hierofante for card number 5', () => {
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
    });

    it('returns A Imperatriz for card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns O Mundo for card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumber(0)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(2)).toBeNull();
    });
  });

  // ─── PLANET_TAROT_MAPPINGS constant ─────────────────────────────────────────

  describe('PLANET_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(PLANET_TAROT_MAPPINGS)).toBe(true);
    });

    it('contains exactly 7 planets', () => {
      expect(Object.keys(PLANET_TAROT_MAPPINGS)).toHaveLength(7);
    });

    it('has nested frozen objects', () => {
      for (const mapping of Object.values(PLANET_TAROT_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('PlanetTarotMapping interface completeness', () => {
    it('Sol mapping has all required properties', () => {
      const sol = getPlanetTarot('Sol');
      expect(sol?.planeta).toBeDefined();
      expect(sol?.arcano).toBeDefined();
      expect(sol?.elemento_conexao).toBeDefined();
      expect(sol?.numero_carta).toBe(19);
      expect(sol?.significado_espiritual).toBeDefined();
      expect(sol?.interpretacao).toBeDefined();
    });

    it('all mappings have non-empty spiritual meanings', () => {
      const mappings = getAllPlanetTarots();
      for (const mapping of mappings) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(mapping.interpretacao.length).toBeGreaterThan(0);
        expect(mapping.elemento_conexao.length).toBeGreaterThan(0);
      }
    });

    it('elemento_conexao matches expected values', () => {
      const mappings = getAllPlanetTarots();
      const elementMap: Record<string, string> = {};
      for (const mapping of mappings) {
        elementMap[mapping.planeta] = mapping.elemento_conexao;
      }
      expect(elementMap['Sol']).toBe('Fogo');
      expect(elementMap['Lua']).toBe('Água');
      expect(elementMap['Marte']).toBe('Fogo');
      expect(elementMap['Mercurio']).toBe('Ar');
      expect(elementMap['Jupiter']).toBe('Ar');
      expect(elementMap['Venus']).toBe('Terra');
      expect(elementMap['Saturno']).toBe('Terra');
    });
  });

  // ─── Planet distribution ─────────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('covers all 7 classical planets', () => {
      const classicalPlanets = ['Sol', 'Lua', 'Marte', 'Mercurio', 'Jupiter', 'Venus', 'Saturno'];
      for (const planeta of classicalPlanets) {
        expect(hasPlanetTarot(planeta)).toBe(true);
      }
    });

    it('maps to valid Major Arcana numbers (1-21)', () => {
      const mappings = getAllPlanetTarots();
      for (const mapping of mappings) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('covers all 4 classical elements', () => {
      const mappings = getAllPlanetTarots();
      const elements = new Set(mappings.map(m => m.elemento_conexao));
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Terra')).toBe(true);
    });
  });
});