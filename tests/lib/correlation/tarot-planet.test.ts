import { describe, it, expect } from 'vitest';
import {
  getTarotPlanet,
  getPlanetTarot,
  getAllTarotPlanets,
  getAllArcanos,
  hasTarotPlanet,
  getArcanoByNumber,
  getPlanetByNumber,
  TAROT_PLANET_MAPPINGS,
  type TarotPlanetMapping,
} from '@/lib/correlation/tarot-planet';

describe('tarot-planet', () => {
  // ─── getTarotPlanet: valid arcanos ─────────────────────────────────────────

  describe('getTarotPlanet', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotPlanet('O Sol');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.significado_espiritual).toBeDefined();
      expect(result?.interpretacao).toBeDefined();
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotPlanet('A Lua');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.numero_carta).toBe(18);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for O Imperador', () => {
      const result = getTarotPlanet('O Imperador');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.numero_carta).toBe(4);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotPlanet('O Mago');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento_conexao).toBe('Ar');
    });

    it('returns mapping for O Hierofante', () => {
      const result = getTarotPlanet('O Hierofante');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.numero_carta).toBe(5);
      expect(result?.elemento_conexao).toBe('Ar');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotPlanet('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.numero_carta).toBe(3);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotPlanet('O Mundo');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.numero_carta).toBe(21);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotPlanet('O Louco')).toBeNull();
      expect(getTarotPlanet('Enforcado')).toBeNull();
      expect(getTarotPlanet('inexistente')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotPlanet('')).toBeNull();
    });
  });

  // ─── getPlanetTarot ─────────────────────────────────────────────────────────

  describe('getPlanetTarot', () => {
    it('returns arcano for Sol', () => {
      expect(getPlanetTarot('Sol')).toBe('O Sol');
    });

    it('returns arcano for Lua', () => {
      expect(getPlanetTarot('Lua')).toBe('A Lua');
    });

    it('returns arcano for Marte', () => {
      expect(getPlanetTarot('Marte')).toBe('O Imperador');
    });

    it('returns arcano for Mercúrio', () => {
      expect(getPlanetTarot('Mercúrio')).toBe('O Mago');
    });

    it('returns arcano for Júpiter', () => {
      expect(getPlanetTarot('Júpiter')).toBe('O Hierofante');
    });

    it('returns arcano for Vênus', () => {
      expect(getPlanetTarot('Vênus')).toBe('A Imperatriz');
    });

    it('returns arcano for Saturno', () => {
      expect(getPlanetTarot('Saturno')).toBe('O Mundo');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetTarot('Netuno')).toBeNull();
      expect(getPlanetTarot('Plutão')).toBeNull();
      expect(getPlanetTarot('Terra')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotPlanets ─────────────────────────────────────────────────────

  describe('getAllTarotPlanets', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('returns all expected arcs with planets', () => {
      const result = getAllTarotPlanets();
      const planets = result.map(m => m.planeta).sort();
      expect(planets).toEqual([
        'Júpiter', 'Lua', 'Marte', 'Mercúrio', 'Saturno', 'Sol', 'Vênus'
      ]);
    });

    it('each mapping has required fields', () => {
      const result = getAllTarotPlanets();
      result.forEach(mapping => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento_conexao).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
      });
    });

    it('returns a new array on each call', () => {
      const result1 = getAllTarotPlanets();
      const result2 = getAllTarotPlanets();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('contains all arcano names', () => {
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

  // ─── hasTarotPlanet ─────────────────────────────────────────────────────────

  describe('hasTarotPlanet', () => {
    it('returns true for existing arcanos', () => {
      expect(hasTarotPlanet('O Sol')).toBe(true);
      expect(hasTarotPlanet('A Lua')).toBe(true);
      expect(hasTarotPlanet('O Mago')).toBe(true);
    });

    it('returns false for non-existing arcanos', () => {
      expect(hasTarotPlanet('O Louco')).toBe(false);
      expect(hasTarotPlanet('Enforcado')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotPlanet('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano for valid card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns arcano for valid card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns arcano for valid card number 4', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
    });

    it('returns arcano for valid card number 5', () => {
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
    });

    it('returns arcano for valid card number 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('returns arcano for valid card number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns arcano for valid card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card numbers', () => {
      expect(getArcanoByNumber(0)).toBeNull();
      expect(getArcanoByNumber(2)).toBeNull();
      expect(getArcanoByNumber(10)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getPlanetByNumber ──────────────────────────────────────────────────────

  describe('getPlanetByNumber', () => {
    it('returns planet for valid card number 1', () => {
      expect(getPlanetByNumber(1)).toBe('Mercúrio');
    });

    it('returns planet for valid card number 3', () => {
      expect(getPlanetByNumber(3)).toBe('Vênus');
    });

    it('returns planet for valid card number 4', () => {
      expect(getPlanetByNumber(4)).toBe('Marte');
    });

    it('returns planet for valid card number 5', () => {
      expect(getPlanetByNumber(5)).toBe('Júpiter');
    });

    it('returns planet for valid card number 18', () => {
      expect(getPlanetByNumber(18)).toBe('Lua');
    });

    it('returns planet for valid card number 19', () => {
      expect(getPlanetByNumber(19)).toBe('Sol');
    });

    it('returns planet for valid card number 21', () => {
      expect(getPlanetByNumber(21)).toBe('Saturno');
    });

    it('returns null for invalid card numbers', () => {
      expect(getPlanetByNumber(0)).toBeNull();
      expect(getPlanetByNumber(2)).toBeNull();
      expect(getPlanetByNumber(10)).toBeNull();
      expect(getPlanetByNumber(22)).toBeNull();
    });
  });

  // ─── TAROT_PLANET_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_PLANET_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_PLANET_MAPPINGS)).toBe(true);
    });

    it('has 7 mappings', () => {
      expect(Object.keys(TAROT_PLANET_MAPPINGS).length).toBe(7);
    });

    it('contains all required arcano keys', () => {
      expect('O Sol' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('A Lua' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('O Imperador' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('O Mago' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('O Hierofante' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('A Imperatriz' in TAROT_PLANET_MAPPINGS).toBe(true);
      expect('O Mundo' in TAROT_PLANET_MAPPINGS).toBe(true);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotPlanetMapping interface completeness', () => {
    it('has arcano field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(mapping?.arcano).toBe('O Sol');
    });

    it('has numero_carta field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(typeof mapping?.numero_carta).toBe('number');
    });

    it('has planeta field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(mapping?.planeta).toBe('Sol');
    });

    it('has elemento_conexao field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(typeof mapping?.elemento_conexao).toBe('string');
    });

    it('has significado_espiritual field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(typeof mapping?.significado_espiritual).toBe('string');
    });

    it('has interpretacao field', () => {
      const mapping = getTarotPlanet('O Sol');
      expect(typeof mapping?.interpretacao).toBe('string');
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has correct element assignments', () => {
      const sol = getTarotPlanet('O Sol');
      expect(sol?.elemento_conexao).toBe('Fogo');

      const lua = getTarotPlanet('A Lua');
      expect(lua?.elemento_conexao).toBe('Água');

      const imperador = getTarotPlanet('O Imperador');
      expect(imperador?.elemento_conexao).toBe('Fogo');

      const mago = getTarotPlanet('O Mago');
      expect(mago?.elemento_conexao).toBe('Ar');

      const hierofante = getTarotPlanet('O Hierofante');
      expect(hierofante?.elemento_conexao).toBe('Ar');

      const imperatriz = getTarotPlanet('A Imperatriz');
      expect(imperatriz?.elemento_conexao).toBe('Terra');

      const mundo = getTarotPlanet('O Mundo');
      expect(mundo?.elemento_conexao).toBe('Terra');
    });

    it('has 2 Fogo, 1 Água, 2 Ar, 2 Terra', () => {
      const result = getAllTarotPlanets();
      const elements = result.map(m => m.elemento_conexao);
      const fogo = elements.filter(e => e === 'Fogo').length;
      const agua = elements.filter(e => e === 'Água').length;
      const ar = elements.filter(e => e === 'Ar').length;
      const terra = elements.filter(e => e === 'Terra').length;
      expect(fogo).toBe(2);
      expect(agua).toBe(1);
      expect(ar).toBe(2);
      expect(terra).toBe(2);
    });
  });

  // ─── Planet-Arcano consistency ─────────────────────────────────────────────

  describe('Planet-Arcano consistency', () => {
    it('planet and arcano are reverse lookups', () => {
      const arcanos = getAllArcanos();
      arcanos.forEach(arcano => {
        const mapping = getTarotPlanet(arcano);
        expect(getPlanetTarot(mapping!.planeta)).toBe(arcano);
      });
    });

    it('all 7 classical planets are represented', () => {
      const planets = new Set(getAllTarotPlanets().map(m => m.planeta));
      expect(planets.size).toBe(7);
      expect(planets.has('Sol')).toBe(true);
      expect(planets.has('Lua')).toBe(true);
      expect(planets.has('Marte')).toBe(true);
      expect(planets.has('Mercúrio')).toBe(true);
      expect(planets.has('Júpiter')).toBe(true);
      expect(planets.has('Vênus')).toBe(true);
      expect(planets.has('Saturno')).toBe(true);
    });
  });
});