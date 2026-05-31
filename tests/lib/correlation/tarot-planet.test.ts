import { describe, it, expect } from 'vitest';
import {
  getTarotPlanet,
  getPlanetFromTarot,
  getAllTarotPlanets,
  getAllArcanos,
  hasTarotPlanet,
  getPlanetByArcanoNumber,
  getArcanoByArcanoNumber,
  TAROT_PLANET_MAPPINGS,
  type TarotPlanetMapping,
} from '@/lib/correlation/tarot-planet';

describe('tarot-planet', () => {
  // ─── getTarotPlanet: valid arcanos ─────────────────────────────────────────

  describe('getTarotPlanet', () => {
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

    it('returns mapping for A Lua', () => {
      const result = getTarotPlanet('A Lua');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.numero_carta).toBe(18);
    });

    it('returns mapping for O Sol', () => {
      const result = getTarotPlanet('O Sol');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(19);
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
      expect(getTarotPlanet('A Morte')).toBeNull();
      expect(getTarotPlanet('A Estrela')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotPlanet('')).toBeNull();
    });
  });

  // ─── getPlanetFromTarot ─────────────────────────────────────────────────────

  describe('getPlanetFromTarot', () => {
    it('returns planet name for O Sol', () => {
      expect(getPlanetFromTarot('O Sol')).toBe('Sol');
    });

    it('returns planet name for A Lua', () => {
      expect(getPlanetFromTarot('A Lua')).toBe('Lua');
    });

    it('returns planet name for O Mago', () => {
      expect(getPlanetFromTarot('O Mago')).toBe('Mercúrio');
    });

    it('returns planet name for O Imperador', () => {
      expect(getPlanetFromTarot('O Imperador')).toBe('Marte');
    });

    it('returns planet name for A Imperatriz', () => {
      expect(getPlanetFromTarot('A Imperatriz')).toBe('Vênus');
    });

    it('returns planet name for O Hierofante', () => {
      expect(getPlanetFromTarot('O Hierofante')).toBe('Júpiter');
    });

    it('returns planet name for O Mundo', () => {
      expect(getPlanetFromTarot('O Mundo')).toBe('Saturno');
    });

    it('returns null for unknown arcano', () => {
      expect(getPlanetFromTarot('A Justiça')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetFromTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotPlanets ─────────────────────────────────────────────────────

  describe('getAllTarotPlanets', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotPlanets();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(7);
    });

    it('contains all expected arcanos', () => {
      const result = getAllTarotPlanets();
      const arcanoNames = result.map(m => m.arcano);
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Imperador');
      expect(arcanoNames).toContain('O Hierofante');
      expect(arcanoNames).toContain('A Lua');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('each mapping has required properties', () => {
      const result = getAllTarotPlanets();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });

    it('returns a new array each time', () => {
      const result1 = getAllTarotPlanets();
      const result2 = getAllTarotPlanets();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(7);
    });

    it('contains all expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mago');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('A Lua');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });

    it('returns a new array each time', () => {
      const result1 = getAllArcanos();
      const result2 = getAllArcanos();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── hasTarotPlanet ────────────────────────────────────────────────────────

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
      expect(hasTarotPlanet('A Torre')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotPlanet('')).toBe(false);
    });
  });

  // ─── getPlanetByArcanoNumber ────────────────────────────────────────────────

  describe('getPlanetByArcanoNumber', () => {
    it('returns planet for card number 1', () => {
      expect(getPlanetByArcanoNumber(1)).toBe('Mercúrio');
    });

    it('returns planet for card number 3', () => {
      expect(getPlanetByArcanoNumber(3)).toBe('Vênus');
    });

    it('returns planet for card number 4', () => {
      expect(getPlanetByArcanoNumber(4)).toBe('Marte');
    });

    it('returns planet for card number 5', () => {
      expect(getPlanetByArcanoNumber(5)).toBe('Júpiter');
    });

    it('returns planet for card number 18', () => {
      expect(getPlanetByArcanoNumber(18)).toBe('Lua');
    });

    it('returns planet for card number 19', () => {
      expect(getPlanetByArcanoNumber(19)).toBe('Sol');
    });

    it('returns planet for card number 21', () => {
      expect(getPlanetByArcanoNumber(21)).toBe('Saturno');
    });

    it('returns null for unmapped card numbers', () => {
      expect(getPlanetByArcanoNumber(0)).toBeNull();
      expect(getPlanetByArcanoNumber(2)).toBeNull();
      expect(getPlanetByArcanoNumber(10)).toBeNull();
      expect(getPlanetByArcanoNumber(22)).toBeNull();
    });
  });

  // ─── getArcanoByArcanoNumber ────────────────────────────────────────────────

  describe('getArcanoByArcanoNumber', () => {
    it('returns arcano for card number 1', () => {
      expect(getArcanoByArcanoNumber(1)).toBe('O Mago');
    });

    it('returns arcano for card number 3', () => {
      expect(getArcanoByArcanoNumber(3)).toBe('A Imperatriz');
    });

    it('returns arcano for card number 4', () => {
      expect(getArcanoByArcanoNumber(4)).toBe('O Imperador');
    });

    it('returns arcano for card number 5', () => {
      expect(getArcanoByArcanoNumber(5)).toBe('O Hierofante');
    });

    it('returns arcano for card number 18', () => {
      expect(getArcanoByArcanoNumber(18)).toBe('A Lua');
    });

    it('returns arcano for card number 19', () => {
      expect(getArcanoByArcanoNumber(19)).toBe('O Sol');
    });

    it('returns arcano for card number 21', () => {
      expect(getArcanoByArcanoNumber(21)).toBe('O Mundo');
    });

    it('returns null for unmapped card numbers', () => {
      expect(getArcanoByArcanoNumber(0)).toBeNull();
      expect(getArcanoByArcanoNumber(2)).toBeNull();
      expect(getArcanoByArcanoNumber(10)).toBeNull();
      expect(getArcanoByArcanoNumber(22)).toBeNull();
    });
  });

  // ─── TAROT_PLANET_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_PLANET_MAPPINGS', () => {
    it('is defined and not null', () => {
      expect(TAROT_PLANET_MAPPINGS).toBeDefined();
      expect(TAROT_PLANET_MAPPINGS).not.toBeNull();
    });

    it('has 7 planet-arcano mappings', () => {
      expect(Object.keys(TAROT_PLANET_MAPPINGS).length).toBe(7);
    });

    it('contains all expected arcano keys', () => {
      const keys = Object.keys(TAROT_PLANET_MAPPINGS);
      expect(keys).toContain('O Mago');
      expect(keys).toContain('A Imperatriz');
      expect(keys).toContain('O Imperador');
      expect(keys).toContain('O Hierofante');
      expect(keys).toContain('A Lua');
      expect(keys).toContain('O Sol');
      expect(keys).toContain('O Mundo');
    });

    it('each value is frozen', () => {
      const mappings = Object.values(TAROT_PLANET_MAPPINGS);
      for (const mapping of mappings) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── TarotPlanetMapping interface completeness ───────────────────────────────

  describe('TarotPlanetMapping interface completeness', () => {
    it('O Mago has correct structure', () => {
      const mapping = TAROT_PLANET_MAPPINGS['O Mago'] as TarotPlanetMapping;
      expect(mapping.arcano).toBe('O Mago');
      expect(mapping.planeta).toBe('Mercúrio');
      expect(mapping.elemento_conexao).toBe('Ar');
      expect(mapping.numero_carta).toBe(1);
      expect(typeof mapping.significado_espiritual).toBe('string');
      expect(typeof mapping.interpretacao).toBe('string');
    });

    it('O Sol has correct structure', () => {
      const mapping = TAROT_PLANET_MAPPINGS['O Sol'] as TarotPlanetMapping;
      expect(mapping.arcano).toBe('O Sol');
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.elemento_conexao).toBe('Fogo');
      expect(mapping.numero_carta).toBe(19);
      expect(typeof mapping.significado_espiritual).toBe('string');
      expect(typeof mapping.interpretacao).toBe('string');
    });

    it('A Lua has correct structure', () => {
      const mapping = TAROT_PLANET_MAPPINGS['A Lua'] as TarotPlanetMapping;
      expect(mapping.arcano).toBe('A Lua');
      expect(mapping.planeta).toBe('Lua');
      expect(mapping.elemento_conexao).toBe('Água');
      expect(mapping.numero_carta).toBe(18);
      expect(typeof mapping.significado_espiritual).toBe('string');
      expect(typeof mapping.interpretacao).toBe('string');
    });
  });

  // ─── Planet distribution ─────────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('has correct number of unique planets', () => {
      const planets = getAllTarotPlanets().map(m => m.planeta);
      const uniquePlanets = new Set(planets);
      expect(uniquePlanets.size).toBe(7);
    });

    it('maps to all 7 classical planets', () => {
      const planets = getAllTarotPlanets().map(m => m.planeta).sort();
      const expectedPlanets = ['Júpiter', 'Lua', 'Marte', 'Mercúrio', 'Saturno', 'Sol', 'Vênus'].sort();
      expect(planets).toEqual(expectedPlanets);
    });

    it('has correct card number distribution', () => {
      const mappings = getAllTarotPlanets();
      const numbers = mappings.map(m => m.numero_carta).sort();
      expect(numbers).toEqual([1, 3, 4, 5, 18, 19, 21]);
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has correct element mapping', () => {
      const mappings = getAllTarotPlanets();
      const elements = mappings.map(m => m.elemento_conexao);
      expect(elements).toContain('Fogo'); // Sol, Marte
      expect(elements).toContain('Água'); // Lua
      expect(elements).toContain('Ar'); // Mercúrio, Júpiter
      expect(elements).toContain('Terra'); // Vênus, Saturno
    });

    it('Sol is Fire element', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(mapping?.elemento_conexao).toBe('Fogo');
    });

    it('Lua is Water element', () => {
      const mapping = getTarotPlanet('A Lua');
      expect(mapping?.elemento_conexao).toBe('Água');
    });

    it('Mercúrio is Air element', () => {
      const mapping = getTarotPlanet('O Mago');
      expect(mapping?.elemento_conexao).toBe('Ar');
    });

    it('Vênus is Earth element', () => {
      const mapping = getTarotPlanet('A Imperatriz');
      expect(mapping?.elemento_conexao).toBe('Terra');
    });
  });
});