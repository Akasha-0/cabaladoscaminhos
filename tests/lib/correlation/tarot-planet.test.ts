import { describe, it, expect } from 'vitest';
import {
  getTarotPlanet,
  getPlanetArcano,
  getAllTarotPlanets,
  getAllArcanos,
  hasTarotPlanet,
  getArcanoByNumber,
  getPlanetByNumber,
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

    it('returns mapping for O Mago', () => {
      const result = getTarotPlanet('O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(1);
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotPlanet('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(3);
    });

    it('returns mapping for O Imperador', () => {
      const result = getTarotPlanet('O Imperador');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(4);
    });

    it('returns mapping for O Hierofante', () => {
      const result = getTarotPlanet('O Hierofante');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(5);
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
      expect(getTarotPlanet('A Justiça')).toBeNull();
      expect(getTarotPlanet('A Estrela')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotPlanet('')).toBeNull();
    });
  });

  // ─── getPlanetArcano ────────────────────────────────────────────────────────

  describe('getPlanetArcano', () => {
    it('returns O Sol for Sol', () => {
      expect(getPlanetArcano('Sol')).toBe('O Sol');
    });

    it('returns A Lua for Lua', () => {
      expect(getPlanetArcano('Lua')).toBe('A Lua');
    });

    it('returns O Mago for Mercúrio', () => {
      expect(getPlanetArcano('Mercúrio')).toBe('O Mago');
    });

    it('returns A Imperatriz for Vênus', () => {
      expect(getPlanetArcano('Vênus')).toBe('A Imperatriz');
    });

    it('returns O Imperador for Marte', () => {
      expect(getPlanetArcano('Marte')).toBe('O Imperador');
    });

    it('returns O Hierofante for Júpiter', () => {
      expect(getPlanetArcano('Júpiter')).toBe('O Hierofante');
    });

    it('returns O Mundo for Saturno', () => {
      expect(getPlanetArcano('Saturno')).toBe('O Mundo');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetArcano('Plutão')).toBeNull();
      expect(getPlanetArcano('Netuno')).toBeNull();
      expect(getPlanetArcano('Urano')).toBeNull();
    });
  });

  // ─── getAllTarotPlanets ─────────────────────────────────────────────────────

  describe('getAllTarotPlanets', () => {
    it('returns array of 7 mappings', () => {
      const result = getAllTarotPlanets();
      expect(result).toHaveLength(7);
    });

    it('contains all 7 Major Arcana cards', () => {
      const result = getAllTarotPlanets();
      const arcanos = result.map(m => m.arcano);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Hierofante');
      expect(arcanos).toContain('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const result = getAllTarotPlanets();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });

    it('all card numbers are unique', () => {
      const result = getAllTarotPlanets();
      const numbers = result.map(m => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(result.length);
    });

    it('all elemento_conexao values are valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra'];
      const result = getAllTarotPlanets();
      for (const mapping of result) {
        expect(validElements).toContain(mapping.elemento_conexao);
      }
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of 7 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(7);
    });

    it('returns correct arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('A Lua');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('O Mundo');
    });
  });

  // ─── hasTarotPlanet ─────────────────────────────────────────────────────────

  describe('hasTarotPlanet', () => {
    it('returns true for known arcanos', () => {
      expect(hasTarotPlanet('O Sol')).toBe(true);
      expect(hasTarotPlanet('A Lua')).toBe(true);
      expect(hasTarotPlanet('O Mago')).toBe(true);
      expect(hasTarotPlanet('A Imperatriz')).toBe(true);
      expect(hasTarotPlanet('O Imperador')).toBe(true);
      expect(hasTarotPlanet('O Hierofante')).toBe(true);
      expect(hasTarotPlanet('O Mundo')).toBe(true);
    });

    it('returns false for unknown arcanos', () => {
      expect(hasTarotPlanet('O Louco')).toBe(false);
      expect(hasTarotPlanet('A Justiça')).toBe(false);
      expect(hasTarotPlanet('A Estrela')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotPlanet('')).toBe(false);
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

    it('returns O Mago for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns A Imperatriz for card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns O Imperador for card number 4', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
    });

    it('returns O Hierofante for card number 5', () => {
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
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

  // ─── getPlanetByNumber ───────────────────────────────────────────────────────

  describe('getPlanetByNumber', () => {
    it('returns Sol for card number 19', () => {
      expect(getPlanetByNumber(19)).toBe('Sol');
    });

    it('returns Lua for card number 18', () => {
      expect(getPlanetByNumber(18)).toBe('Lua');
    });

    it('returns Mercúrio for card number 1', () => {
      expect(getPlanetByNumber(1)).toBe('Mercúrio');
    });

    it('returns Vênus for card number 3', () => {
      expect(getPlanetByNumber(3)).toBe('Vênus');
    });

    it('returns Marte for card number 4', () => {
      expect(getPlanetByNumber(4)).toBe('Marte');
    });

    it('returns Júpiter for card number 5', () => {
      expect(getPlanetByNumber(5)).toBe('Júpiter');
    });

    it('returns Saturno for card number 21', () => {
      expect(getPlanetByNumber(21)).toBe('Saturno');
    });

    it('returns null for invalid card number', () => {
      expect(getPlanetByNumber(0)).toBeNull();
      expect(getPlanetByNumber(22)).toBeNull();
      expect(getPlanetByNumber(2)).toBeNull();
    });
  });

  // ─── TAROT_PLANET_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_PLANET_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_PLANET_MAPPINGS)).toBe(true);
    });

    it('has 7 entries', () => {
      expect(Object.keys(TAROT_PLANET_MAPPINGS)).toHaveLength(7);
    });

    it('nested objects are frozen', () => {
      for (const mapping of Object.values(TAROT_PLANET_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotPlanetMapping interface completeness', () => {
    it('has all required fields in each mapping', () => {
      const mappings = getAllTarotPlanets();
      for (const mapping of mappings) {
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.planeta).toBe('string');
        expect(typeof mapping.elemento_conexao).toBe('string');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(typeof mapping.interpretacao).toBe('string');
      }
    });

    it('arcano and numero_carta are consistent', () => {
      const mappings = getAllTarotPlanets();
      for (const mapping of mappings) {
        const direct = TAROT_PLANET_MAPPINGS[mapping.arcano];
        expect(direct.numero_carta).toBe(mapping.numero_carta);
        expect(direct.planeta).toBe(mapping.planeta);
      }
    });
  });

  // ─── Planet distribution ────────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('covers all 4 classical elements', () => {
      const result = getAllTarotPlanets();
      const elements = new Set(result.map(m => m.elemento_conexao));
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Terra')).toBe(true);
      expect(elements.size).toBe(4);
    });

    it('each planet appears exactly once', () => {
      const result = getAllTarotPlanets();
      const planets = result.map(m => m.planeta);
      const uniquePlanets = new Set(planets);
      expect(uniquePlanets.size).toBe(result.length);
    });
  });

  // ─── Cross-reference with planet-tarot ─────────────────────────────────────

  describe('Cross-reference consistency', () => {
    it('TAROT_PLANET_MAPPINGS is reverse of PLANET_TAROT_MAPPINGS', async () => {
      const { PLANET_TAROT_MAPPINGS } = await import('@/lib/correlation/planet-tarot');
      
      for (const [arcano, mapping] of Object.entries(TAROT_PLANET_MAPPINGS)) {
        const planetMapping = PLANET_TAROT_MAPPINGS[mapping.planeta];
        expect(planetMapping).toBeDefined();
        expect(planetMapping.arcano).toBe(arcano);
        expect(planetMapping.numero_carta).toBe(mapping.numero_carta);
        expect(planetMapping.elemento_conexao).toBe(mapping.elemento_conexao);
      }
    });
  });
});