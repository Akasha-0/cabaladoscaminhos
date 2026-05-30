import { describe, it, expect } from 'vitest';
import { getPlanetZodiac, getAllPlanetZodiacMappings, getAllPlanets, hasPlanetZodiac, getPlanetDomicilio, getPlanetQualidade } from '@/lib/correlation/planet-zodiac';

describe('correlation/planet-zodiac', () => {
  const mappings = getAllPlanetZodiacMappings();

  it('has all main planets', () => {
    expect(mappings.length).toBeGreaterThanOrEqual(7);
  });

  it('each mapping has required fields', () => {
    for (const m of mappings) {
      expect(m.planeta).toBeTruthy();
      expect(m.signos_regidos).toBeTruthy();
      expect(m.domicilio).toBeTruthy();
      expect(m.exaltação).toBeTruthy();
      expect(m.queda).toBeTruthy();
      expect(m.exilio).toBeTruthy();
      expect(m.qualidade).toBeTruthy();
    }
  });

  it('getPlanetZodiac finds Sol', () => {
    const s = getPlanetZodiac('Sol');
    expect(s).toBeDefined();
    expect(s?.domicilio).toBe('Leão');
  });

  it('getPlanetZodiac finds Lua', () => {
    const l = getPlanetZodiac('Lua');
    expect(l).toBeDefined();
    expect(l?.domicilio).toBe('Câncer');
  });

  it('getPlanetZodiac returns null for unknown planet', () => {
    expect(getPlanetZodiac('Unknown')).toBeNull();
  });

  it('each planet has signos_regidos', () => {
    for (const m of mappings) {
      expect(Array.isArray(m.signos_regidos)).toBe(true);
    }
  });

  it('each planet has qualidade (cardinal/fixed/mutable)', () => {
    for (const m of mappings) {
      expect(['cardinal', 'fixed', 'mutable']).toContain(m.qualidade);
    }
  });

  it('getAllPlanets returns array of planet names', () => {
    const planets = getAllPlanets();
    expect(planets.length).toBeGreaterThan(0);
    expect(planets).toContain('Sol');
  });

  it('hasPlanetZodiac returns true for known planets', () => {
    expect(hasPlanetZodiac('Sol')).toBe(true);
    expect(hasPlanetZodiac('Lua')).toBe(true);
  });

  it('hasPlanetZodiac returns false for unknown planets', () => {
    expect(hasPlanetZodiac('Unknown')).toBe(false);
  });

  it('getPlanetDomicilio returns domicile sign', () => {
    expect(getPlanetDomicilio('Saturno')).toBe('Capricórnio');
  });

  it('getPlanetQualidade returns quality', () => {
    const q = getPlanetQualidade('Sol');
    expect(q).toBeTruthy();
  });
});
