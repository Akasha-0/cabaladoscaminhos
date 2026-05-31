import { describe, it, expect } from 'vitest';
import {
  getPlanetPlanets,
  getAllPlanetRellations,
  getAllPlanetRelations,
  PLANET_PLANET_MAPPINGS,
  type PlanetPlanetMapping,
  type AspectType,
  type Planeta,
} from '@/lib/correlation/planet-planet';

describe('planet-planet', () => {
  // ─── PLANET_PLANET_MAPPINGS: all relationships ──────────────────────────────
  describe('PLANET_PLANET_MAPPINGS', () => {
    it('contains at least 20 planetary relationships', () => {
      expect(PLANET_PLANET_MAPPINGS.length).toBeGreaterThanOrEqual(20);
    });

    it('each mapping has valid planet names', () => {
      const validPlanets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(validPlanets).toContain(mapping.planeta);
        expect(validPlanets).toContain(mapping.planeta_relacionado);
      });
    });

    it('each mapping has valid aspect type', () => {
      const validAspects: AspectType[] = [
        'Conjunção',
        'Oposição',
        'Tríno',
        'Quadratura',
        'Sextil',
        'Semi-sextil',
        'Semi-quadratura',
        'Quincúncio',
      ];
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(validAspects).toContain(mapping.tipo_aspecto);
      });
    });

    it('each mapping has spiritual meaning array', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(Array.isArray(mapping.significado_espiritual)).toBe(true);
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has keywords array', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(Array.isArray(mapping.palavras_chave)).toBe(true);
        expect(mapping.palavras_chave.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has orixás array', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(Array.isArray(mapping.orixas)).toBe(true);
        expect(mapping.orixas.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has chakras array', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(Array.isArray(mapping.chakras)).toBe(true);
        expect(mapping.chakras.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has elements array', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(Array.isArray(mapping.elementos)).toBe(true);
        expect(mapping.elementos.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has interpretation string', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(typeof mapping.interpretacao).toBe('string');
        expect(mapping.interpretacao.length).toBeGreaterThan(0);
      });
    });

    it('each mapping has ritual suggestion string', () => {
      PLANET_PLANET_MAPPINGS.forEach(mapping => {
        expect(typeof mapping.ritual_sugerido).toBe('string');
        expect(mapping.ritual_sugerido.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getPlanetPlanets: bidirectional lookup ─────────────────────────────────
  describe('getPlanetPlanets', () => {
    it('finds Sol-Lua relationship by order', () => {
      const result = getPlanetPlanets('Sol', 'Lua');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.planeta_relacionado).toBe('Lua');
    });

    it('finds Sol-Lua relationship by reverse order', () => {
      const result = getPlanetPlanets('Lua', 'Sol');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.planeta_relacionado).toBe('Lua');
    });

    it('finds Vênus-Marte opposition relationship', () => {
      const result = getPlanetPlanets('Vênus', 'Marte');
      expect(result).not.toBeNull();
      expect(result?.tipo_aspecto).toBe('Oposição');
    });

    it('finds Júpiter-Saturno opposition relationship', () => {
      const result = getPlanetPlanets('Júpiter', 'Saturno');
      expect(result).not.toBeNull();
      expect(result?.tipo_aspecto).toBe('Oposição');
    });

    it('finds Sol-Marte trine relationship', () => {
      const result = getPlanetPlanets('Sol', 'Marte');
      expect(result).not.toBeNull();
      expect(result?.tipo_aspecto).toBe('Tríno');
    });

    it('finds Lua-Vênus trine relationship', () => {
      const result = getPlanetPlanets('Lua', 'Vênus');
      expect(result).not.toBeNull();
      expect(result?.tipo_aspecto).toBe('Tríno');
    });

    it('finds Mercúrio-Júpiter sextile relationship', () => {
      const result = getPlanetPlanets('Mercúrio', 'Júpiter');
      expect(result).not.toBeNull();
      expect(result?.tipo_aspecto).toBe('Sextil');
    });

    it('handles case sensitivity correctly', () => {
      const result = getPlanetPlanets('sol', 'lua');
      expect(result).toBeNull();
    });
  });

  // ─── getAllPlanetRelations: planet-specific relationships ───────────────────
  describe('getAllPlanetRelations', () => {
    it('finds all Sol relationships', () => {
      const results = getAllPlanetRelations('Sol');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.planeta === 'Sol' || r.planeta_relacionado === 'Sol').toBe(true);
      });
    });

    it('finds all Lua relationships', () => {
      const results = getAllPlanetRelations('Lua');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds all Mercúrio relationships', () => {
      const results = getAllPlanetRelations('Mercúrio');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds all Vênus relationships', () => {
      const results = getAllPlanetRelations('Vênus');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds all Marte relationships', () => {
      const results = getAllPlanetRelations('Marte');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds all Júpiter relationships', () => {
      const results = getAllPlanetRelations('Júpiter');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds all Saturno relationships', () => {
      const results = getAllPlanetRelations('Saturno');
      expect(results.length).toBeGreaterThan(0);
    });

    it('non-existent planet returns empty array', () => {
      const results = getAllPlanetRelations('PlanetaInvalido');
      expect(results).toEqual([]);
    });
  });

  // ─── getAllPlanetRellations: all relationships ─────────────────────────────
  describe('getAllPlanetRellations', () => {
    it('returns all mappings', () => {
      const results = getAllPlanetRellations();
      expect(results.length).toBe(PLANET_PLANET_MAPPINGS.length);
    });

    it('returns a new array (not the original)', () => {
      const results = getAllPlanetRellations();
      expect(results).not.toBe(PLANET_PLANET_MAPPINGS);
      results.push({} as PlanetPlanetMapping);
      expect(PLANET_PLANET_MAPPINGS.length).toBe(results.length - 1);
    });

    it('contains all expected aspect types', () => {
      const results = getAllPlanetRellations();
      const aspects = results.map(r => r.tipo_aspecto);
      expect(aspects).toContain('Conjunção');
      expect(aspects).toContain('Oposição');
      expect(aspects).toContain('Tríno');
      expect(aspects).toContain('Quadratura');
      expect(aspects).toContain('Sextil');
    });
  });

  // ─── Integration: planetary relationships ────────────────────────────────────
  describe('planetary integration', () => {
    it('Sol has relationships with multiple planets', () => {
      const solRelations = getAllPlanetRelations('Sol');
      const relatedPlanets = new Set(
        solRelations.flatMap(r =>
          r.planeta === 'Sol' ? [r.planeta_relacionado] : [r.planeta]
        )
      );
      expect(relatedPlanets.size).toBeGreaterThan(2);
    });

    it('Lua has relationships with multiple planets', () => {
      const luaRelations = getAllPlanetRelations('Lua');
      expect(luaRelations.length).toBeGreaterThan(2);
    });

    it('each relationship has appropriate orixás', () => {
      const results = getAllPlanetRellations();
      results.forEach(r => {
        expect(r.orixas.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('aspect types distribute across different types', () => {
      const results = getAllPlanetRellations();
      const aspectCounts = results.reduce((acc, r) => {
        acc[r.tipo_aspecto] = (acc[r.tipo_aspecto] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      expect(Object.keys(aspectCounts).length).toBeGreaterThan(3);
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('Planeta type is valid', () => {
      const planet: Planeta = 'Sol';
      expect(planet).toBe('Sol');
    });

    it('AspectType is valid', () => {
      const aspect: AspectType = 'Conjunção';
      expect(aspect).toBe('Conjunção');
    });

    it('PlanetPlanetMapping interface is properly exported', () => {
      const mapping: PlanetPlanetMapping = {
        planeta: 'Sol',
        planeta_relacionado: 'Lua',
        tipo_aspecto: 'Conjunção',
        significado_espiritual: ['Test'],
        palavras_chave: ['Test'],
        orixas: ['Xangô'],
        chakras: ['3º Plexo Solar'],
        elementos: ['Fogo'],
        interpretacao: 'Test interpretation',
        ritual_sugerido: 'Test ritual',
      };
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.tipo_aspecto).toBe('Conjunção');
    });
  });

  // ─── Frozen array integrity ─────────────────────────────────────────────────
  describe('PLANET_PLANET_MAPPINGS is frozen', () => {
    it('array itself is frozen', () => {
      expect(Object.isFrozen(PLANET_PLANET_MAPPINGS)).toBe(true);
    });
  });
});
