import { describe, it, expect } from 'vitest';
import {
  getPlanetOrixa,
  getAllPlanetOrixaMappings,
  getAllPlanets,
  hasPlanetOrixa,
  PLANET_ORIXA_MAPPINGS,
  type PlanetOrixaMapping,
} from '@/lib/correlation/planet-orixa';

describe('planet-orixa', () => {
  // ─── getPlanetOrixa: valid planets ─────────────────────────────────────────

  describe('getPlanetOrixa', () => {
    it('returns Sol mapping with Xangô', () => {
      const mapping = getPlanetOrixa('Sol');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Sol');
      expect(mapping!.orixa).toBe('Xangô');
      expect(mapping!.dia).toContain('Quarta-feira');
      expect(mapping!.cores).toContain('Amarelo');
      expect(mapping!.elemento).toBe('Fogo');
      expect(mapping!.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('returns Lua mapping with Iemanjá', () => {
      const mapping = getPlanetOrixa('Lua');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Lua');
      expect(mapping!.orixa).toBe('Iemanjá');
      expect(mapping!.dia).toBe('Segunda-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Azul Escuro', 'Branco']));
      expect(mapping!.elemento).toBe('Água');
      expect(mapping!.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('returns Marte mapping with Ogum', () => {
      const mapping = getPlanetOrixa('Marte');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Marte');
      expect(mapping!.orixa).toBe('Ogum');
      expect(mapping!.dia).toBe('Terça-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Azul Claro', 'Vermelho', 'Verde']));
      expect(mapping!.elemento).toBe('Fogo');
    });

    it('returns Mercurio mapping with Oxumaré', () => {
      const mapping = getPlanetOrixa('Mercurio');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Mercúrio');
      expect(mapping!.orixa).toBe('Oxumaré');
      expect(mapping!.dia).toBe('Quarta-feira');
      expect(mapping!.elemento).toBe('Ar / Água');
      expect(mapping!.qualidade_energetica).toBe('Neutra / Volátil');
    });

    it('returns Jupiter mapping with Oxóssi', () => {
      const mapping = getPlanetOrixa('Jupiter');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Júpiter');
      expect(mapping!.orixa).toBe('Oxóssi');
      expect(mapping!.dia).toBe('Quinta-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Verde', 'Azul-turquesa']));
      expect(mapping!.elemento).toBe('Terra / Fogo');
    });

    it('returns Venus mapping with Oxum', () => {
      const mapping = getPlanetOrixa('Venus');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Vênus');
      expect(mapping!.orixa).toBe('Oxum');
      expect(mapping!.dia).toContain('Sexta-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Rosa', 'Amarelo-ouro']));
      expect(mapping!.elemento).toBe('Água');
      expect(mapping!.qualidade_energetica).toBe('Fria / Magnética');
    });

    it('returns Saturno mapping with Omolu', () => {
      const mapping = getPlanetOrixa('Saturno');
      expect(mapping).not.toBeNull();
      expect(mapping!.planet).toBe('Saturno');
      expect(mapping!.orixa).toBe('Omolu');
      expect(mapping!.dia).toBe('Segunda-feira');
      expect(mapping!.cores).toEqual(expect.arrayContaining(['Preto e Branco']));
      expect(mapping!.elemento).toBe('Terra');
      expect(mapping!.qualidade_energetica).toBe('Quente / Densa');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetOrixa('Netuno')).toBeNull();
      expect(getPlanetOrixa('Plutão')).toBeNull();
      expect(getPlanetOrixa('Urano')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetOrixa('')).toBeNull();
    });

    it('returns null for case-sensitive mismatches', () => {
      expect(getPlanetOrixa('sol')).toBeNull();
      expect(getPlanetOrixa('SOL')).toBeNull();
      expect(getPlanetOrixa('lua')).toBeNull();
    });
  });

  // ─── getAllPlanetOrixaMappings ──────────────────────────────────────────────

  describe('getAllPlanetOrixaMappings', () => {
    it('returns all 7 planet mappings', () => {
      const all = getAllPlanetOrixaMappings();
      expect(all).toHaveLength(7);
    });

    it('contains all expected Orixás', () => {
      const all = getAllPlanetOrixaMappings();
      const orixas = all.map((m) => m.orixa);
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxumaré');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Omolu');
    });

    it('each mapping has all required fields', () => {
      const all = getAllPlanetOrixaMappings();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('planet');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('cores');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(Array.isArray(mapping.cores)).toBe(true);
        expect(mapping.cores.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getAllPlanets ──────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns 7 planet names', () => {
      const planets = getAllPlanets();
      expect(planets).toHaveLength(7);
    });

    it('includes all expected planets', () => {
      const planets = getAllPlanets();
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercurio');
      expect(planets).toContain('Jupiter');
      expect(planets).toContain('Venus');
      expect(planets).toContain('Saturno');
    });
  });

  // ─── hasPlanetOrixa ──────────────────────────────────────────────────────────

  describe('hasPlanetOrixa', () => {
    it('returns true for all valid planets', () => {
      expect(hasPlanetOrixa('Sol')).toBe(true);
      expect(hasPlanetOrixa('Lua')).toBe(true);
      expect(hasPlanetOrixa('Marte')).toBe(true);
      expect(hasPlanetOrixa('Mercurio')).toBe(true);
      expect(hasPlanetOrixa('Jupiter')).toBe(true);
      expect(hasPlanetOrixa('Venus')).toBe(true);
      expect(hasPlanetOrixa('Saturno')).toBe(true);
    });

    it('returns false for unknown planets', () => {
      expect(hasPlanetOrixa('Netuno')).toBe(false);
      expect(hasPlanetOrixa('Plutão')).toBe(false);
      expect(hasPlanetOrixa('Urano')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasPlanetOrixa('')).toBe(false);
    });
  });

  // ─── PLANET_ORIXA_MAPPINGS constant ─────────────────────────────────────────

  describe('PLANET_ORIXA_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(PLANET_ORIXA_MAPPINGS)).toBe(true);
    });

    it('each entry matches getPlanetOrixa result', () => {
      for (const planet of Object.keys(PLANET_ORIXA_MAPPINGS)) {
        expect(getPlanetOrixa(planet)).toEqual(PLANET_ORIXA_MAPPINGS[planet]);
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('PlanetOrixaMapping interface completeness', () => {
    it('Sol has correct energetic quality mapping', () => {
      const mapping = getPlanetOrixa('Sol')!;
      expect(mapping.qualidade_energetica).toBe('Quente / Radiante');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Xangô');
    });

    it('Lua has correct energetic quality mapping', () => {
      const mapping = getPlanetOrixa('Lua')!;
      expect(mapping.qualidade_energetica).toBe('Fria / Receptiva');
      expect(mapping.elemento).toBe('Água');
      expect(mapping.orixa).toBe('Iemanjá');
    });

    it('Marte has correct energetic quality mapping', () => {
      const mapping = getPlanetOrixa('Marte')!;
      expect(mapping.qualidade_energetica).toBe('Quente / Ígnea');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Ogum');
    });

    it('Venus has magnetic quality for love/attraction', () => {
      const mapping = getPlanetOrixa('Venus')!;
      expect(mapping.qualidade_energetica).toBe('Fria / Magnética');
      expect(mapping.orixa).toBe('Oxum');
      expect(mapping.cores).toContain('Rosa');
    });

    it('Saturno has dense quality for karma/cycles', () => {
      const mapping = getPlanetOrixa('Saturno')!;
      expect(mapping.qualidade_energetica).toBe('Quente / Densa');
      expect(mapping.orixa).toBe('Omolu');
    });
  });
});