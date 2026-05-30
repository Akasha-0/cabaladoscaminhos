import { describe, it, expect } from 'vitest';
import {
  getPlanetOdu,
  getOduPlanet,
  getAllPlanetOdus,
  getAllPlanets,
  hasPlanetOdu,
  getOduByNumber,
  PLANET_ODU_MAPPINGS,
  type PlanetOduMapping,
} from '@/lib/correlation/planet-odu';

describe('planet-odu', () => {
  // ─── getPlanetOdu: valid planets ─────────────────────────────────────────────

  describe('getPlanetOdu', () => {
    it('returns Sol mapping with Obará (6)', () => {
      const result = getPlanetOdu('Sol');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Sol');
      expect(result!.odu.numero).toBe(6);
      expect(result!.odu.nome).toBe('Obará');
      expect(result!.alinhamento_energetico).toBe('Quente / Radiante');
    });

    it('returns Lua mapping with Irosun (4)', () => {
      const result = getPlanetOdu('Lua');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Lua');
      expect(result!.odu.numero).toBe(4);
      expect(result!.odu.nome).toBe('Irosun');
      expect(result!.alinhamento_energetico).toBe('Fria / Receptiva');
    });

    it('returns Marte mapping with Odi (7)', () => {
      const result = getPlanetOdu('Marte');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Marte');
      expect(result!.odu.numero).toBe(7);
      expect(result!.odu.nome).toBe('Odi');
      expect(result!.alinhamento_energetico).toBe('Quente / Ígnea');
    });

    it('returns Mercurio mapping with Etaogundá (3)', () => {
      const result = getPlanetOdu('Mercurio');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.odu.numero).toBe(3);
      expect(result!.odu.nome).toBe('Etaogundá');
      expect(result!.alinhamento_energetico).toBe('Neutra / Volátil');
    });

    it('returns Jupiter mapping with Oxé (5)', () => {
      const result = getPlanetOdu('Jupiter');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.odu.numero).toBe(5);
      expect(result!.odu.nome).toBe('Oxé');
      expect(result!.alinhamento_energetico).toBe('Fria / Expansiva');
    });

    it('returns Venus mapping with EjiOníle (8)', () => {
      const result = getPlanetOdu('Venus');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Vênus');
      expect(result!.odu.numero).toBe(8);
      expect(result!.odu.nome).toBe('EjiOníle');
      expect(result!.alinhamento_energetico).toBe('Fria / Magnética');
    });

    it('returns Saturno mapping with Okaran (1)', () => {
      const result = getPlanetOdu('Saturno');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Saturno');
      expect(result!.odu.numero).toBe(1);
      expect(result!.odu.nome).toBe('Okaran');
      expect(result!.alinhamento_energetico).toBe('Quente / Densa');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetOdu('Netuno')).toBeNull();
      expect(getPlanetOdu('Plutão')).toBeNull();
      expect(getPlanetOdu('Urano')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetOdu('')).toBeNull();
    });

    it('returns null for case-sensitive mismatches', () => {
      expect(getPlanetOdu('sol')).toBeNull();
      expect(getPlanetOdu('SOL')).toBeNull();
      expect(getPlanetOdu('lua')).toBeNull();
    });
  });

  // ─── getOduPlanet: reverse lookup ────────────────────────────────────────────

  describe('getOduPlanet', () => {
    it('returns Sol for Obará', () => {
      expect(getOduPlanet('Obará')).toBe('Sol');
    });

    it('returns Lua for Irosun', () => {
      expect(getOduPlanet('Irosun')).toBe('Lua');
    });

    it('returns Marte for Odi', () => {
      expect(getOduPlanet('Odi')).toBe('Marte');
    });

    it('returns Mercurio for Etaogundá', () => {
      expect(getOduPlanet('Etaogundá')).toBe('Mercurio');
    });

    it('returns Jupiter for Oxé', () => {
      expect(getOduPlanet('Oxé')).toBe('Jupiter');
    });

    it('returns Venus for EjiOníle', () => {
      expect(getOduPlanet('EjiOníle')).toBe('Venus');
    });

    it('returns Saturno for Okaran', () => {
      expect(getOduPlanet('Okaran')).toBe('Saturno');
    });

    it('returns null for unknown Odu', () => {
      expect(getOduPlanet('Alafia')).toBeNull();
      expect(getOduPlanet('Ofun')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getOduPlanet('')).toBeNull();
    });
  });

  // ─── getAllPlanetOdus ─────────────────────────────────────────────────────────

  describe('getAllPlanetOdus', () => {
    it('returns all 7 planet mappings', () => {
      const result = getAllPlanetOdus();
      expect(result).toHaveLength(7);
    });

    it('contains all classical planets', () => {
      const result = getAllPlanetOdus();
      const planetNames = result.map(m => m.planeta);
      expect(planetNames).toContain('Sol');
      expect(planetNames).toContain('Lua');
      expect(planetNames).toContain('Marte');
      expect(planetNames).toContain('Mercúrio');
      expect(planetNames).toContain('Júpiter');
      expect(planetNames).toContain('Vênus');
      expect(planetNames).toContain('Saturno');
    });

    it('each mapping has valid Odu with numero and nome', () => {
      const result = getAllPlanetOdus();
      for (const mapping of result) {
        expect(mapping.odu).toBeDefined();
        expect(typeof mapping.odu.numero).toBe('number');
        expect(typeof mapping.odu.nome).toBe('string');
        expect(mapping.odu.numero).toBeGreaterThan(0);
        expect(mapping.odu.numero).toBeLessThanOrEqual(16);
      }
    });

    it('each mapping has spiritual significance', () => {
      const result = getAllPlanetOdus();
      for (const mapping of result) {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('each mapping has ritual associations', () => {
      const result = getAllPlanetOdus();
      for (const mapping of result) {
        expect(mapping.associacoes_rituais).toBeDefined();
        expect(mapping.associacoes_rituais.ebos).toBeDefined();
        expect(Array.isArray(mapping.associacoes_rituais.ebos)).toBe(true);
        expect(mapping.associacoes_rituais.elementos).toBeDefined();
        expect(mapping.associacoes_rituais.direcoes).toBeDefined();
        expect(mapping.associacoes_rituais.cores).toBeDefined();
      }
    });
  });

  // ─── getAllPlanets ───────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns array of7 planet names', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
    });

    it('returns expected planet names', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercurio');
      expect(result).toContain('Jupiter');
      expect(result).toContain('Venus');
      expect(result).toContain('Saturno');
    });

    it('returns array is sorted alphabetically', () => {
      const result = getAllPlanets();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  // ─── hasPlanetOdu ────────────────────────────────────────────────────────────

  describe('hasPlanetOdu', () => {
    it('returns true for known planets', () => {
      expect(hasPlanetOdu('Sol')).toBe(true);
      expect(hasPlanetOdu('Lua')).toBe(true);
      expect(hasPlanetOdu('Marte')).toBe(true);
      expect(hasPlanetOdu('Mercurio')).toBe(true);
      expect(hasPlanetOdu('Jupiter')).toBe(true);
      expect(hasPlanetOdu('Venus')).toBe(true);
      expect(hasPlanetOdu('Saturno')).toBe(true);
    });

    it('returns false for unknown planets', () => {
      expect(hasPlanetOdu('Netuno')).toBe(false);
      expect(hasPlanetOdu('Plutão')).toBe(false);
      expect(hasPlanetOdu('Urano')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasPlanetOdu('')).toBe(false);
    });
  });

  // ─── getOduByNumber ──────────────────────────────────────────────────────────

  describe('getOduByNumber', () => {
    it('returns Sol mapping for Odu number 6', () => {
      const result = getOduByNumber(6);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Sol');
      expect(result!.odu.nome).toBe('Obará');
    });

    it('returns Lua mapping for Odu number 4', () => {
      const result = getOduByNumber(4);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Lua');
      expect(result!.odu.nome).toBe('Irosun');
    });

    it('returns Marte mapping for Odu number 7', () => {
      const result = getOduByNumber(7);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Marte');
      expect(result!.odu.nome).toBe('Odi');
    });

    it('returns Mercurio mapping for Odu number 3', () => {
      const result = getOduByNumber(3);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.odu.nome).toBe('Etaogundá');
    });

    it('returns Jupiter mapping for Odu number 5', () => {
      const result = getOduByNumber(5);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.odu.nome).toBe('Oxé');
    });

    it('returns Venus mapping for Odu number 8', () => {
      const result = getOduByNumber(8);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Vênus');
      expect(result!.odu.nome).toBe('EjiOníle');
    });

    it('returns Saturno mapping for Odu number 1', () => {
      const result = getOduByNumber(1);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Saturno');
      expect(result!.odu.nome).toBe('Okaran');
    });

    it('returns null for unmapped Odu numbers', () => {
      expect(getOduByNumber(2)).toBeNull(); // Ejiokô - not mapped
      expect(getOduByNumber(9)).toBeNull(); // Ossá - not mapped
      expect(getOduByNumber(10)).toBeNull(); // Ofun - not mapped
      expect(getOduByNumber(16)).toBeNull(); // Alafia - not mapped
    });

    it('returns null for invalid numbers', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
      expect(getOduByNumber(17)).toBeNull();
    });
  });

  // ─── PLANET_ODU_MAPPINGS constant ─────────────────────────────────────────────

  describe('PLANET_ODU_MAPPINGS', () => {
    it('is defined and not null', () => {
      expect(PLANET_ODU_MAPPINGS).toBeDefined();
      expect(PLANET_ODU_MAPPINGS).not.toBeNull();
    });

    it('has exactly 7 entries', () => {
      expect(Object.keys(PLANET_ODU_MAPPINGS)).toHaveLength(7);
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(PLANET_ODU_MAPPINGS)).toBe(true);
    });

    it('each mapping entry is frozen', () => {
      for (const mapping of Object.values(PLANET_ODU_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });

    it('all 7 classical planets are present', () => {
      expect(PLANET_ODU_MAPPINGS.Sol).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Lua).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Marte).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Mercurio).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Jupiter).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Venus).toBeDefined();
      expect(PLANET_ODU_MAPPINGS.Saturno).toBeDefined();
    });
  });

  // ─── Interface completeness ──────────────────────────────────────────────────

  describe('PlanetOduMapping interface completeness', () => {
    it('has required fields for all mappings', () => {
      const mappings = getAllPlanetOdus();
      for (const mapping of mappings) {
        expect(mapping.planeta).toBeDefined();
        expect(mapping.odu).toBeDefined();
        expect(mapping.alinhamento_energetico).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.associacoes_rituais).toBeDefined();
      }
    });

    it('all Odu numbers are unique across planets', () => {
      const mappings = getAllPlanetOdus();
      const numeros = mappings.map(m => m.odu.numero);
      const uniqueNumeros = new Set(numeros);
      expect(uniqueNumeros.size).toBe(numeros.length);
    });

    it('all Odu names are unique across planets', () => {
      const mappings = getAllPlanetOdus();
      const nomes = mappings.map(m => m.odu.nome);
      const uniqueNomes = new Set(nomes);
      expect(uniqueNomes.size).toBe(nomes.length);
    });

    it('ritual associations contain ebos, elementos, direcoes, cores', () => {
      const mappings = getAllPlanetOdus();
      for (const mapping of mappings) {
        const ritual = mapping.associacoes_rituais;
        expect(ritual.ebos.length).toBeGreaterThan(0);
        expect(ritual.elementos.length).toBeGreaterThan(0);
        expect(ritual.direcoes.length).toBeGreaterThan(0);
        expect(ritual.cores.length).toBeGreaterThan(0);
      }
    });

    it('significado_espiritual describes the Odu archetype', () => {
      const mappings = getAllPlanetOdus();
      for (const mapping of mappings) {
        // Check that significance mentions the Odu name
        expect(mapping.significado_espiritual.toLowerCase()).toContain(
          mapping.odu.nome.toLowerCase()
        );
      }
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all required functions', async () => {
      const module = await import('@/lib/correlation/planet-odu');
      expect(typeof module.default).toBe('object');
      expect(typeof module.getPlanetOdu).toBe('function');
      expect(typeof module.getOduPlanet).toBe('function');
      expect(typeof module.getAllPlanetOdus).toBe('function');
      expect(typeof module.getAllPlanets).toBe('function');
      expect(typeof module.hasPlanetOdu).toBe('function');
      expect(typeof module.getOduByNumber).toBe('function');
    });
  });
});
