import { describe, it, expect } from 'vitest';
import {
  tropicalParaSideral,
  sideralParaTropical,
  AYANAMSA_OFFSETS,
  AYANAMSA_NOMES_PT,
} from './ayanamsa';

describe('F-212: Ayanamsa (R-018 D1)', () => {
  it('tropical default = identidade (offset 0)', () => {
    expect(tropicalParaSideral(180, 'tropical')).toBe(180);
    expect(sideralParaTropical(180, 'tropical')).toBe(180);
  });

  it('Lahiri ~23.85°', () => {
    expect(AYANAMSA_OFFSETS.lahiri).toBeCloseTo(23.85, 1);
  });

  it('Raman ~22.40°', () => {
    expect(AYANAMSA_OFFSETS.raman).toBeCloseTo(22.40, 1);
  });

  it('Krishnamurti ~23.82°', () => {
    expect(AYANAMSA_OFFSETS.krishnamurti).toBeCloseTo(23.82, 1);
  });

  it('tropical→sideral Lahiri: 0° (Áries tropical) = -23.85° = 336.15°', () => {
    expect(tropicalParaSideral(0, 'lahiri')).toBeCloseTo(336.15, 1);
  });

  it('sideral→tropical Lahiri: 0° (Áries sideral) = 23.85°', () => {
    expect(sideralParaTropical(0, 'lahiri')).toBeCloseTo(23.85, 1);
  });

  it('roundtrip tropical→sideral→tropical = identidade', () => {
    const samples = [0, 90, 180, 270, 359.99];
    for (const lon of samples) {
      for (const ayanamsa of ['tropical', 'lahiri', 'raman', 'krishnamurti'] as const) {
        const r = sideralParaTropical(tropicalParaSideral(lon, ayanamsa), ayanamsa);
        expect(Math.abs(r - lon)).toBeLessThan(1e-9);
      }
    }
  });

  it('wrap-around: longitude 350° tropical Lahiri = 326.15° sideral', () => {
    expect(tropicalParaSideral(350, 'lahiri')).toBeCloseTo(326.15, 1);
  });

  it('nomes PT-BR: Tropical / Lahiri / Raman / Krishnamurti', () => {
    expect(AYANAMSA_NOMES_PT.tropical).toContain('Tropical');
    expect(AYANAMSA_NOMES_PT.lahiri).toContain('Lahiri');
    expect(AYANAMSA_NOMES_PT.raman).toContain('Raman');
    expect(AYANAMSA_NOMES_PT.krishnamurti).toContain('Krishnamurti');
  });
});
