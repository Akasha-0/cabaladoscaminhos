import { describe, it, expect } from 'vitest';
import { 
  getPlanetZodiac, 
  getAllPlanetZodiacs, 
  getAllPlanets, 
  hasPlanetZodiac, 
  getPlanetDomicilio, 
  getPlanetQualidade,
  getZodiacPlanet,
  getPlanetElemento,
  PLANET_ZODIAC_MAPPINGS,
} from '@/lib/correlation/planet-zodiac';

describe('correlation/planet-zodiac', () => {
  const mappings = getAllPlanetZodiacs();

  it('has all main planets', () => {
    expect(mappings.length).toBeGreaterThanOrEqual(7);
  });

  it('each mapping has required fields', () => {
    for (const m of mappings) {
      expect(m.planeta).toBeTruthy();
      expect(m.signo).toBeTruthy();
      expect(m.elemento_conexao).toBeTruthy();
      expect(m.significado_espiritual).toBeTruthy();
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
    expect(s?.signo).toBe('Leão');
    expect(s?.elemento_conexao).toBe('Fogo');
    expect(s?.significado_espiritual).toBeTruthy();
  });

  it('getPlanetZodiac finds Lua', () => {
    const l = getPlanetZodiac('Lua');
    expect(l).toBeDefined();
    expect(l?.domicilio).toBe('Câncer');
    expect(l?.signo).toBe('Câncer');
    expect(l?.elemento_conexao).toBe('Água');
  });

  it('getPlanetZodiac finds Mercúrio', () => {
    const m = getPlanetZodiac('Mercúrio');
    expect(m).toBeDefined();
    expect(m?.signo).toBe('Gêmeos');
    expect(m?.elemento_conexao).toBe('Ar');
  });

  it('getPlanetZodiac finds Vênus', () => {
    const v = getPlanetZodiac('Vênus');
    expect(v).toBeDefined();
    expect(v?.signo).toBe('Touro');
    expect(v?.elemento_conexao).toBe('Terra');
  });

  it('getPlanetZodiac finds Marte', () => {
    const m = getPlanetZodiac('Marte');
    expect(m).toBeDefined();
    expect(m?.signo).toBe('Áries');
    expect(m?.elemento_conexao).toBe('Fogo');
  });

  it('getPlanetZodiac finds Júpiter', () => {
    const j = getPlanetZodiac('Júpiter');
    expect(j).toBeDefined();
    expect(j?.signo).toBe('Sagitário');
    expect(j?.elemento_conexao).toBe('Fogo');
  });

  it('getPlanetZodiac finds Saturno', () => {
    const s = getPlanetZodiac('Saturno');
    expect(s).toBeDefined();
    expect(s?.signo).toBe('Capricórnio');
    expect(s?.elemento_conexao).toBe('Terra');
  });

  it('getPlanetZodiac returns null for unknown planet', () => {
    expect(getPlanetZodiac('Unknown')).toBeNull();
    expect(getPlanetZodiac('')).toBeNull();
    expect(getPlanetZodiac('Plutão')).toBeNull();
    expect(getPlanetZodiac('Netuno')).toBeNull();
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

  it('each planet has spiritual meaning with adequate length', () => {
    for (const m of mappings) {
      expect(typeof m.significado_espiritual).toBe('string');
      expect(m.significado_espiritual.length).toBeGreaterThan(20);
    }
  });

  it('each planet has elemento_conexao', () => {
    for (const m of mappings) {
      expect(['Fogo', 'Água', 'Ar', 'Terra']).toContain(m.elemento_conexao);
    }
  });

  it('getAllPlanets returns array of planet names', () => {
    const planets = getAllPlanets();
    expect(planets.length).toBeGreaterThan(0);
    expect(planets).toContain('Sol');
    expect(planets).toContain('Lua');
    expect(planets).toContain('Mercúrio');
    expect(planets).toContain('Vênus');
    expect(planets).toContain('Marte');
    expect(planets).toContain('Júpiter');
    expect(planets).toContain('Saturno');
    expect(planets.length).toBe(7);
  });

  it('getAllPlanetZodiacs returns array of all mappings', () => {
    const all = getAllPlanetZodiacs();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(7);
  });

  it('hasPlanetZodiac returns true for known planets', () => {
    expect(hasPlanetZodiac('Sol')).toBe(true);
    expect(hasPlanetZodiac('Lua')).toBe(true);
    expect(hasPlanetZodiac('Mercúrio')).toBe(true);
    expect(hasPlanetZodiac('Vênus')).toBe(true);
    expect(hasPlanetZodiac('Marte')).toBe(true);
    expect(hasPlanetZodiac('Júpiter')).toBe(true);
    expect(hasPlanetZodiac('Saturno')).toBe(true);
  });

  it('hasPlanetZodiac returns false for unknown planets', () => {
    expect(hasPlanetZodiac('Unknown')).toBe(false);
    expect(hasPlanetZodiac('')).toBe(false);
  });

  it('getPlanetDomicilio returns domicile sign', () => {
    expect(getPlanetDomicilio('Sol')).toBe('Leão');
    expect(getPlanetDomicilio('Lua')).toBe('Câncer');
    expect(getPlanetDomicilio('Saturno')).toBe('Capricórnio');
  });

  it('getPlanetQualidade returns quality', () => {
    expect(getPlanetQualidade('Sol')).toBe('fixed');
    expect(getPlanetQualidade('Lua')).toBe('cardinal');
    expect(getPlanetQualidade('Mercúrio')).toBe('mutable');
  });

  it('getPlanetElemento returns element for planet', () => {
    expect(getPlanetElemento('Sol')).toBe('Fogo');
    expect(getPlanetElemento('Lua')).toBe('Água');
    expect(getPlanetElemento('Mercúrio')).toBe('Ar');
    expect(getPlanetElemento('Vênus')).toBe('Terra');
  });

  // ─── getZodiacPlanet tests ──────────────────────────────────────────────────

  it('getZodiacPlanet returns planet for sign', () => {
    expect(getZodiacPlanet('Leão')).toBe('Sol');
    expect(getZodiacPlanet('Câncer')).toBe('Lua');
    expect(getZodiacPlanet('Gêmeos')).toBe('Mercúrio');
    expect(getZodiacPlanet('Touro')).toBe('Vênus');
    expect(getZodiacPlanet('Áries')).toBe('Marte');
    expect(getZodiacPlanet('Sagitário')).toBe('Júpiter');
    expect(getZodiacPlanet('Capricórnio')).toBe('Saturno');
  });

  it('getZodiacPlanet returns null for unknown sign', () => {
    expect(getZodiacPlanet('Unknown')).toBeNull();
    expect(getZodiacPlanet('')).toBeNull();
    expect(getZodiacPlanet('Ofiúco')).toBeNull();
  });

  // ─── PLANET_ZODIAC_MAPPINGS tests ────────────────────────────────────────────

  it('PLANET_ZODIAC_MAPPINGS is frozen', () => {
    expect(Object.isFrozen(PLANET_ZODIAC_MAPPINGS)).toBe(true);
  });

  it('PLANET_ZODIAC_MAPPINGS has 7 planets', () => {
    expect(Object.keys(PLANET_ZODIAC_MAPPINGS).length).toBe(7);
  });

  // ─── Element distribution tests ─────────────────────────────────────────────

  it('has planets from all four elements', () => {
    const elements = new Set(mappings.map(m => m.elemento_conexao));
    expect(elements.has('Fogo')).toBe(true);
    expect(elements.has('Água')).toBe(true);
    expect(elements.has('Ar')).toBe(true);
    expect(elements.has('Terra')).toBe(true);
    expect(elements.size).toBe(4);
  });

  it('Sol has correct element', () => {
    const sol = getPlanetZodiac('Sol');
    expect(sol?.elemento_conexao).toBe('Fogo');
  });

  it('Lua has correct element', () => {
    const lua = getPlanetZodiac('Lua');
    expect(lua?.elemento_conexao).toBe('Água');
  });

  it('Marte has correct characteristics', () => {
    const marte = getPlanetZodiac('Marte');
    expect(marte).toBeDefined();
    expect(marte!.signos_regidos).toContain('Áries');
    expect(marte!.domicilio).toBe('Áries');
  });

  it('Saturno has correct characteristics', () => {
    const saturno = getPlanetZodiac('Saturno');
    expect(saturno).toBeDefined();
    expect(saturno!.signo).toBe('Capricórnio');
    expect(saturno!.qualidade).toBe('cardinal');
  });
});
