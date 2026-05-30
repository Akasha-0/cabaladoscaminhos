import { describe, it, expect } from 'vitest';
import { getMeanings, getPlanetMeaning } from '@/lib/astrologia/planet-meanings';
import type { Planeta } from '@/lib/astrologia/tipos';

describe('astrologia/planet-meanings', () => {
  const meanings = getMeanings();

  it('has all10 main planets', () => {
    expect(meanings.length).toBeGreaterThanOrEqual(10);
  });

  it('each planet has required fields', () => {
    for (const p of meanings) {
      expect(p.planeta).toBeTruthy();
      expect(p.nome).toBeTruthy();
      expect(p.simbolo).toBeTruthy();
      expect(p.dominio).toBeTruthy();
      expect(Array.isArray(p.keywords)).toBe(true);
      expect(p.keywords.length).toBeGreaterThan(0);
      expect(p.descrição).toBeTruthy();
      expect(p.força).toBeTruthy();
      expect(p.fraqueza).toBeTruthy();
      expect(Array.isArray(p.profissões)).toBe(true);
      expect(p.arquétipo).toBeTruthy();
    }
  });

  it('getPlanetMeaning finds sol', () => {
    const s = getPlanetMeaning('sol');
    expect(s).toBeDefined();
    expect(s?.planeta).toBe('sol');
  });

  it('getPlanetMeaning finds lua', () => {
    const l = getPlanetMeaning('lua');
    expect(l).toBeDefined();
    expect(l?.planeta).toBe('lua');
  });

  it('getPlanetMeaning finds all main planets', () => {
    const planets: Planeta[] = ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'];
    for (const p of planets) {
      expect(getPlanetMeaning(p)).toBeDefined();
    }
  });

  it('each planet has symbol', () => {
    for (const p of meanings) {
      expect(p.simbolo.length).toBeGreaterThan(0);
    }
  });

  it('each planet has keywords', () => {
    for (const p of meanings) {
      expect(p.keywords.length).toBeGreaterThan(0);
    }
  });

  it('sol archetype is about identity/ego', () => {
    const s = getPlanetMeaning('sol');
    expect(s?.arquétipo).toBeTruthy();
  });

  it('lua archetype is about emotions/intuition', () => {
    const l = getPlanetMeaning('lua');
    expect(l?.arquétipo).toBeTruthy();
  });
});
