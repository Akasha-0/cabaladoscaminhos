import { describe, expect, it } from 'vitest';
import {
  GLYPHS_BY_PLANET,
  PLANET_COLORS,
  formatDegreeToZodiac,
  longitudeToSvgAngle,
} from './zodiac';

// Mandala Fase 3 (spec mandala-fase3-zodiac-tantra)
// Requisito 3.1: longitude absoluta correta na eclíptica
// Requisito 3.2: 10 glifos astrológicos com cores

describe('longitudeToSvgAngle', () => {
  it('mapeia longitude 0° (ascendente) para SVG 180° (esquerda, 9 horas)', () => {
    expect(longitudeToSvgAngle(0)).toBe(180);
  });

  it('mapeia longitude 90° para SVG 90° (baixo, 6 horas)', () => {
    expect(longitudeToSvgAngle(90)).toBe(90);
  });

  it('mapeia longitude 180° para SVG 0° (direita, 3 horas)', () => {
    expect(longitudeToSvgAngle(180)).toBe(0);
  });

  it('mapeia longitude 270° para SVG 270° (cima, 12 horas)', () => {
    expect(longitudeToSvgAngle(270)).toBe(270);
  });

  it('Sol em Gêmeos 15° (longitude 75°) → SVG 105°', () => {
    // Gêmeos começa em 60° (signIndex 2 * 30), + 15 = 75°
    // SVG = (180 - 75) % 360 = 105
    expect(longitudeToSvgAngle(75)).toBe(105);
  });

  it('retorna 0 para NaN ou Infinity', () => {
    expect(longitudeToSvgAngle(NaN)).toBe(0);
    expect(longitudeToSvgAngle(Infinity)).toBe(0);
  });

  it('Sol em Peixes 29° (longitude 359°) → SVG 181° (próximo de 180°)', () => {
    expect(longitudeToSvgAngle(359)).toBe(181);
  });
});

describe('GLYPHS_BY_PLANET', () => {
  it('tem glifos para os 10 planetas principais', () => {
    expect(GLYPHS_BY_PLANET.Sol).toBe('☉');
    expect(GLYPHS_BY_PLANET.Lua).toBe('☽');
    expect(GLYPHS_BY_PLANET.Mercúrio).toBe('☿');
    expect(GLYPHS_BY_PLANET['Vênus']).toBe('♀');
    expect(GLYPHS_BY_PLANET.Marte).toBe('♂');
    expect(GLYPHS_BY_PLANET['Júpiter']).toBe('♃');
    expect(GLYPHS_BY_PLANET.Saturno).toBe('♄');
    expect(GLYPHS_BY_PLANET.Urano).toBe('♅');
    expect(GLYPHS_BY_PLANET.Netuno).toBe('♆');
    expect(GLYPHS_BY_PLANET['Plutão']).toBe('♇');
  });
});

describe('PLANET_COLORS', () => {
  it('Sol é dourado, Lua é prateado', () => {
    expect(PLANET_COLORS.Sol).toBe('#FFD166');
    expect(PLANET_COLORS.Lua).toBe('#C9D4E0');
  });
  it('Marte é vermelho (tradição)', () => {
    expect(PLANET_COLORS.Marte).toBe('#FF7A7A');
  });
});

describe('formatDegreeToZodiac (pré-existente, mantido)', () => {
  it('formata longitude absoluta em "Sign °GrauNaSign"', () => {
    expect(formatDegreeToZodiac(75)).toBe('Gêmeos 15°');
    expect(formatDegreeToZodiac(0)).toBe('Áries 0°');
  });
  it('retorna string vazia para null/undefined', () => {
    expect(formatDegreeToZodiac(null)).toBe('');
    expect(formatDegreeToZodiac(undefined)).toBe('');
  });
});
