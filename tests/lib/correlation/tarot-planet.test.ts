import { describe, it, expect } from 'vitest';
import {
  getTarotPlanet,
  getPlanetTarot,
  getAllTarotPlanets,
  getAllArcanos,
  hasTarotPlanet,
  getPlanetByNumber,
  getArcanoByNumber,
  getAllPlanets,
  TAROT_PLANET_MAPPINGS,
  type TarotPlanetMapping,
} from '@/lib/correlation/tarot-planet';

describe('tarot-planet', () => {
  // ─── getTarotPlanet: valid arcanos ──────────────────────────────────────────

  describe('getTarotPlanet', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotPlanet('O Sol');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(19);
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotPlanet('A Lua');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.numero_carta).toBe(18);
    });

    it('returns mapping for O Imperador', () => {
      const result = getTarotPlanet('O Imperador');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(4);
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotPlanet('O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(1);
    });

    it('returns mapping for O Hierofante', () => {
      const result = getTarotPlanet('O Hierofante');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(5);
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotPlanet('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(3);
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotPlanet('O Mundo');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(21);
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotPlanet('O Louco')).toBeNull();
      expect(getTarotPlanet('A Estrela')).toBeNull();
      expect(getTarotPlanet('A Torre')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotPlanet('')).toBeNull();
    });
  });

  // ─── getPlanetTarot ─────────────────────────────────────────────────────────

  describe('getPlanetTarot', () => {
    it('returns O Sol for Sol', () => {
      expect(getPlanetTarot('Sol')).toBe('O Sol');
    });

    it('returns A Lua for Lua', () => {
      expect(getPlanetTarot('Lua')).toBe('A Lua');
    });

    it('returns O Imperador for Marte', () => {
      expect(getPlanetTarot('Marte')).toBe('O Imperador');
    });

    it('returns O Mago for Mercúrio', () => {
      expect(getPlanetTarot('Mercúrio')).toBe('O Mago');
    });

    it('returns O Hierofante for Júpiter', () => {
      expect(getPlanetTarot('Júpiter')).toBe('O Hierofante');
    });

    it('returns A Imperatriz for Vênus', () => {
      expect(getPlanetTarot('Vênus')).toBe('A Imperatriz');
    });

    it('returns O Mundo for Saturno', () => {
      expect(getPlanetTarot('Saturno')).toBe('O Mundo');
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

  // ─── getAllTarotPlanets ──────────────────────────────────────────────────────

  describe('getAllTarotPlanets', () => {
    it('returns all 7 mappings', () => {
      const result = getAllTarotPlanets();
      expect(result).toHaveLength(7);
    });

    it('returns array of TarotPlanetMapping objects', () => {
      const result = getAllTarotPlanets();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      });
    });

    it('contains all expected arcanos', () => {
      const result = getAllTarotPlanets();
      const arcanoNames = result.map(m => m.arcano);
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('A Lua');
      expect(arcanoNames).toContain('O Imperador');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('O Hierofante');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Mundo');
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns all 7 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(7);
    });

    it('returns expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('A Lua');
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Mago');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });
  });

  // ─── hasTarotPlanet ──────────────────────────────────────────────────────────

  describe('hasTarotPlanet', () => {
    it('returns true for known arcanos', () => {
      expect(hasTarotPlanet('O Sol')).toBe(true);
      expect(hasTarotPlanet('A Lua')).toBe(true);
      expect(hasTarotPlanet('O Imperador')).toBe(true);
      expect(hasTarotPlanet('O Mago')).toBe(true);
      expect(hasTarotPlanet('O Hierofante')).toBe(true);
      expect(hasTarotPlanet('A Imperatriz')).toBe(true);
      expect(hasTarotPlanet('O Mundo')).toBe(true);
    });

    it('returns false for unknown arcanos', () => {
      expect(hasTarotPlanet('O Louco')).toBe(false);
      expect(hasTarotPlanet('A Estrela')).toBe(false);
      expect(hasTarotPlanet('A Torre')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotPlanet('')).toBe(false);
    });
  });

  // ─── getPlanetByNumber ───────────────────────────────────────────────────────

  describe('getPlanetByNumber', () => {
    it('returns Sol for card 19', () => {
      expect(getPlanetByNumber(19)).toBe('Sol');
    });

    it('returns Lua for card 18', () => {
      expect(getPlanetByNumber(18)).toBe('Lua');
    });

    it('returns Marte for card 4', () => {
      expect(getPlanetByNumber(4)).toBe('Marte');
    });

    it('returns Mercúrio for card 1', () => {
      expect(getPlanetByNumber(1)).toBe('Mercúrio');
    });

    it('returns Júpiter for card 5', () => {
      expect(getPlanetByNumber(5)).toBe('Júpiter');
    });

    it('returns Vênus for card 3', () => {
      expect(getPlanetByNumber(3)).toBe('Vênus');
    });

    it('returns Saturno for card 21', () => {
      expect(getPlanetByNumber(21)).toBe('Saturno');
    });

    it('returns null for card number not in mapping', () => {
      expect(getPlanetByNumber(0)).toBeNull();
      expect(getPlanetByNumber(2)).toBeNull();
      expect(getPlanetByNumber(10)).toBeNull();
      expect(getPlanetByNumber(22)).toBeNull();
    });
  });

  // ─── getArcanoByNumber ───────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Sol for card 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns A Lua for card 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('returns O Imperador for card 4', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
    });

    it('returns O Mago for card 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns O Hierofante for card 5', () => {
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
    });

    it('returns A Imperatriz for card 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns O Mundo for card 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for card number not in mapping', () => {
      expect(getArcanoByNumber(0)).toBeNull();
      expect(getArcanoByNumber(2)).toBeNull();
      expect(getArcanoByNumber(10)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  // ─── getAllPlanets ───────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns all 7 unique planet names', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
    });

    it('returns expected planet names', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercúrio');
      expect(result).toContain('Júpiter');
      expect(result).toContain('Vênus');
      expect(result).toContain('Saturno');
    });
  });

  // ─── TAROT_PLANET_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_PLANET_MAPPINGS', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_PLANET_MAPPINGS)).toBe(true);
    });

    it('has 7 entries', () => {
      expect(Object.keys(TAROT_PLANET_MAPPINGS)).toHaveLength(7);
    });

    it('contains expected arcano keys', () => {
      expect(TAROT_PLANET_MAPPINGS['O Sol']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['A Lua']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['O Imperador']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['O Hierofante']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['A Imperatriz']).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS['O Mundo']).toBeDefined();
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotPlanetMapping interface completeness', () => {
    it('each mapping has all required fields', () => {
      const mappings = getAllTarotPlanets();
      mappings.forEach(mapping => {
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.planeta).toBe('string');
        expect(typeof mapping.elemento_conexao).toBe('string');
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(typeof mapping.interpretacao).toBe('string');
      });
    });

    it('card numbers are within Major Arcana range (0-21)', () => {
      const mappings = getAllTarotPlanets();
      mappings.forEach(mapping => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });
  });

  // ─── Planet distribution ────────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('each planet maps to exactly one arcano', () => {
      const mappings = getAllTarotPlanets();
      const planetCounts = mappings.reduce((acc, m) => {
        acc[m.planeta] = (acc[m.planeta] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.values(planetCounts).forEach(count => {
        expect(count).toBe(1);
      });
    });

    it('elements are distributed across Fire, Water, Air, Terra', () => {
      const mappings = getAllTarotPlanets();
      const elements = mappings.map(m => m.elemento_conexao);
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Água');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Terra');
    });
  });
});
