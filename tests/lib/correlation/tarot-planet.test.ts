import { describe, it, expect } from 'vitest';
import {
  getTarotPlanetMapping,
  getPlanetForArcano,
  getArcanoForPlanet,
  getAllTarotPlanetMappings,
  getAllArcanos,
  hasTarotPlanetMapping,
  getPlanetByCardNumber,
  getArcanoByCardNumber,
  getMappingByCardNumber,
  TAROT_PLANET_MAPPINGS,
  type TarotPlanetMapping,
} from '@/lib/correlation/tarot-planet';

describe('tarot-planet', () => {
  // ─── getTarotPlanetMapping: valid arcanos ───────────────────────────────────

  describe('getTarotPlanetMapping', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotPlanetMapping('O Sol');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(19);
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotPlanetMapping('A Lua');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.numero_carta).toBe(18);
    });

    it('returns mapping for O Imperador', () => {
      const result = getTarotPlanetMapping('O Imperador');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.numero_carta).toBe(4);
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotPlanetMapping('O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(1);
    });

    it('returns mapping for O Hierofante', () => {
      const result = getTarotPlanetMapping('O Hierofante');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.numero_carta).toBe(5);
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotPlanetMapping('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(3);
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotPlanetMapping('O Mundo');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.numero_carta).toBe(21);
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotPlanetMapping('O Louco')).toBeNull();
      expect(getTarotPlanetMapping('A Justiça')).toBeNull();
      expect(getTarotPlanetMapping('A Morte')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotPlanetMapping('')).toBeNull();
    });
  });

  // ─── getPlanetForArcano ────────────────────────────────────────────────────

  describe('getPlanetForArcano', () => {
    it('returns Sol for O Sol arcano', () => {
      expect(getPlanetForArcano('O Sol')).toBe('Sol');
    });

    it('returns Lua for A Lua arcano', () => {
      expect(getPlanetForArcano('A Lua')).toBe('Lua');
    });

    it('returns Marte for O Imperador arcano', () => {
      expect(getPlanetForArcano('O Imperador')).toBe('Marte');
    });

    it('returns Mercurio for O Mago arcano', () => {
      expect(getPlanetForArcano('O Mago')).toBe('Mercúrio');
    });

    it('returns Jupiter for O Hierofante arcano', () => {
      expect(getPlanetForArcano('O Hierofante')).toBe('Júpiter');
    });

    it('returns Venus for A Imperatriz arcano', () => {
      expect(getPlanetForArcano('A Imperatriz')).toBe('Vênus');
    });

    it('returns Saturno for O Mundo arcano', () => {
      expect(getPlanetForArcano('O Mundo')).toBe('Saturno');
    });

    it('returns null for unknown arcano', () => {
      expect(getPlanetForArcano('O Louco')).toBeNull();
      expect(getPlanetForArcano('A Justiça')).toBeNull();
    });
  });

  // ─── getArcanoForPlanet ─────────────────────────────────────────────────────

  describe('getArcanoForPlanet', () => {
    it('returns O Sol for Sol planeta', () => {
      expect(getArcanoForPlanet('Sol')).toBe('O Sol');
    });

    it('returns A Lua for Lua planeta', () => {
      expect(getArcanoForPlanet('Lua')).toBe('A Lua');
    });

    it('returns O Imperador for Marte planeta', () => {
      expect(getArcanoForPlanet('Marte')).toBe('O Imperador');
    });

    it('returns O Mago for Mercurio planeta', () => {
      expect(getArcanoForPlanet('Mercúrio')).toBe('O Mago');
    });

    it('returns O Hierofante for Jupiter planeta', () => {
      expect(getArcanoForPlanet('Júpiter')).toBe('O Hierofante');
    });

    it('returns A Imperatriz for Venus planeta', () => {
      expect(getArcanoForPlanet('Vênus')).toBe('A Imperatriz');
    });

    it('returns O Mundo for Saturno planeta', () => {
      expect(getArcanoForPlanet('Saturno')).toBe('O Mundo');
    });

    it('returns null for unknown planeta', () => {
      expect(getArcanoForPlanet('Plutão')).toBeNull();
      expect(getArcanoForPlanet('Netuno')).toBeNull();
    });
  });

  // ─── getAllTarotPlanetMappings ───────────────────────────────────────────────

  describe('getAllTarotPlanetMappings', () => {
    it('returns array of 7 mappings', () => {
      const result = getAllTarotPlanetMappings();
      expect(result).toHaveLength(7);
    });

    it('contains all 7 Major Arcana cards', () => {
      const result = getAllTarotPlanetMappings();
      const arcanos = result.map(m => m.arcano);
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Lua');
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('O Hierofante');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const result = getAllTarotPlanetMappings();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });

    it('all arcano numbers are unique', () => {
      const result = getAllTarotPlanetMappings();
      const numbers = result.map(m => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(result.length);
    });

    it('all elemento_conexao values are valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra'];
      const result = getAllTarotPlanetMappings();
      for (const mapping of result) {
        expect(validElements).toContain(mapping.elemento_conexao);
      }
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of 7 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(7);
    });

    it('returns correct arcano names', () => {
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

  // ─── hasTarotPlanetMapping ───────────────────────────────────────────────────

  describe('hasTarotPlanetMapping', () => {
    it('returns true for known arcanos', () => {
      expect(hasTarotPlanetMapping('O Sol')).toBe(true);
      expect(hasTarotPlanetMapping('A Lua')).toBe(true);
      expect(hasTarotPlanetMapping('O Imperador')).toBe(true);
      expect(hasTarotPlanetMapping('O Mago')).toBe(true);
      expect(hasTarotPlanetMapping('O Hierofante')).toBe(true);
      expect(hasTarotPlanetMapping('A Imperatriz')).toBe(true);
      expect(hasTarotPlanetMapping('O Mundo')).toBe(true);
    });

    it('returns false for unknown arcanos', () => {
      expect(hasTarotPlanetMapping('O Louco')).toBe(false);
      expect(hasTarotPlanetMapping('A Justiça')).toBe(false);
      expect(hasTarotPlanetMapping('A Morte')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotPlanetMapping('')).toBe(false);
    });
  });

  // ─── getPlanetByCardNumber ──────────────────────────────────────────────────

  describe('getPlanetByCardNumber', () => {
    it('returns Sol for card number 19', () => {
      expect(getPlanetByCardNumber(19)).toBe('Sol');
    });

    it('returns Lua for card number 18', () => {
      expect(getPlanetByCardNumber(18)).toBe('Lua');
    });

    it('returns Marte for card number 4', () => {
      expect(getPlanetByCardNumber(4)).toBe('Marte');
    });

    it('returns Mercurio for card number 1', () => {
      expect(getPlanetByCardNumber(1)).toBe('Mercúrio');
    });

    it('returns Jupiter for card number 5', () => {
      expect(getPlanetByCardNumber(5)).toBe('Júpiter');
    });

    it('returns Venus for card number 3', () => {
      expect(getPlanetByCardNumber(3)).toBe('Vênus');
    });

    it('returns Saturno for card number 21', () => {
      expect(getPlanetByCardNumber(21)).toBe('Saturno');
    });

    it('returns null for invalid card number', () => {
      expect(getPlanetByCardNumber(0)).toBeNull();
      expect(getPlanetByCardNumber(22)).toBeNull();
      expect(getPlanetByCardNumber(10)).toBeNull();
    });
  });

  // ─── getArcanoByCardNumber ──────────────────────────────────────────────────

  describe('getArcanoByCardNumber', () => {
    it('returns O Sol for card number 19', () => {
      expect(getArcanoByCardNumber(19)).toBe('O Sol');
    });

    it('returns A Lua for card number 18', () => {
      expect(getArcanoByCardNumber(18)).toBe('A Lua');
    });

    it('returns O Imperador for card number 4', () => {
      expect(getArcanoByCardNumber(4)).toBe('O Imperador');
    });

    it('returns O Mago for card number 1', () => {
      expect(getArcanoByCardNumber(1)).toBe('O Mago');
    });

    it('returns O Hierofante for card number 5', () => {
      expect(getArcanoByCardNumber(5)).toBe('O Hierofante');
    });

    it('returns A Imperatriz for card number 3', () => {
      expect(getArcanoByCardNumber(3)).toBe('A Imperatriz');
    });

    it('returns O Mundo for card number 21', () => {
      expect(getArcanoByCardNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByCardNumber(0)).toBeNull();
      expect(getArcanoByCardNumber(22)).toBeNull();
      expect(getArcanoByCardNumber(2)).toBeNull();
    });
  });

  // ─── getMappingByCardNumber ────────────────────────────────────────────────

  describe('getMappingByCardNumber', () => {
    it('returns full mapping for card number 19', () => {
      const result = getMappingByCardNumber(19);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.planeta).toBe('Sol');
    });

    it('returns full mapping for card number 1', () => {
      const result = getMappingByCardNumber(1);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.planeta).toBe('Mercúrio');
    });

    it('returns null for invalid card number', () => {
      expect(getMappingByCardNumber(0)).toBeNull();
      expect(getMappingByCardNumber(22)).toBeNull();
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
  });

  // ─── TarotPlanetMapping interface completeness ───────────────────────────────

  describe('TarotPlanetMapping interface completeness', () => {
    it('all mappings have arcano field', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.arcano).toBe('string');
        expect(mapping.arcano.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have planeta field', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.planeta).toBe('string');
        expect(mapping.planeta.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have elemento_conexao field', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.elemento_conexao).toBe('string');
        expect(mapping.elemento_conexao.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have numero_carta field as positive integer', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.numero_carta).toBe('number');
        expect(mapping.numero_carta).toBeGreaterThan(0);
        expect(Number.isInteger(mapping.numero_carta)).toBe(true);
      }
    });

    it('all mappings have significado_espiritual field', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have interpretacao field', () => {
      const mappings = getAllTarotPlanetMappings();
      for (const mapping of mappings) {
        expect(typeof mapping.interpretacao).toBe('string');
        expect(mapping.interpretacao.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Reverse lookup consistency ─────────────────────────────────────────────

  describe('Reverse lookup consistency', () => {
    it('getTarotPlanetMapping and getPlanetForArcano are consistent', () => {
      const arcanos = getAllArcanos();
      for (const arcano of arcanos) {
        const fullMapping = getTarotPlanetMapping(arcano);
        const planet = getPlanetForArcano(arcano);
        expect(planet).toBe(fullMapping?.planeta);
      }
    });

    it('getArcanoForPlanet returns arcano for all known planets', () => {
      const planets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      for (const planeta of planets) {
        const arcano = getArcanoForPlanet(planeta);
        expect(arcano).not.toBeNull();
      }
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has 2 Fire mappings', () => {
      const fireMappings = getAllTarotPlanetMappings().filter(m => m.elemento_conexao === 'Fogo');
      expect(fireMappings).toHaveLength(2);
    });

    it('has 1 Water mapping', () => {
      const waterMappings = getAllTarotPlanetMappings().filter(m => m.elemento_conexao === 'Água');
      expect(waterMappings).toHaveLength(1);
    });

    it('has 2 Air mappings', () => {
      const airMappings = getAllTarotPlanetMappings().filter(m => m.elemento_conexao === 'Ar');
      expect(airMappings).toHaveLength(2);
    });

    it('has 2 Earth mappings', () => {
      const earthMappings = getAllTarotPlanetMappings().filter(m => m.elemento_conexao === 'Terra');
      expect(earthMappings).toHaveLength(2);
    });
  });
});
