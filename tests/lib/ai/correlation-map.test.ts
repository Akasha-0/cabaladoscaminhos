import { describe, it, expect } from 'vitest';
import {
  CORRELATION_MAP,
  getCorrelationEntry,
  extractFromMap,
} from '@/lib/ai/correlation-map';

describe('CORRELATION_MAP — as 36 casas da Mesa Real', () => {
  it('tem exatamente 36 entradas', () => {
    expect(Object.keys(CORRELATION_MAP)).toHaveLength(36);
  });

  it('cobre as casas 1..36 sequencialmente, com houseId coerente', () => {
    for (let i = 1; i <= 36; i++) {
      const entry = CORRELATION_MAP[i];
      expect(entry, `casa ${i} ausente`).toBeDefined();
      expect(entry.houseId).toBe(i);
      expect(entry.houseName.length).toBeGreaterThan(0);
      expect(entry.houseTheme.length).toBeGreaterThan(0);
    }
  });

  it('toda casa delega ao menos um aspecto em cada sistema', () => {
    for (let i = 1; i <= 36; i++) {
      const e = CORRELATION_MAP[i];
      const astroKeys = e.astrology.extractionKeys.length;
      expect(astroKeys, `casa ${i} sem extractionKeys astrológicas`).toBeGreaterThan(0);
      expect(e.kabalah.extractionKeys.length, `casa ${i} cabalística vazia`).toBeGreaterThan(0);
      expect(e.tantric.extractionKeys.length, `casa ${i} tântrica vazia`).toBeGreaterThan(0);
      expect(e.kabalah.aspects.length).toBeGreaterThan(0);
      expect(e.tantric.aspects.length).toBeGreaterThan(0);
    }
  });

  it('Casa 1 (Cavaleiro) delega Ascendente+Marte | Expressão | Alma', () => {
    const e = getCorrelationEntry(1);
    expect(e.astrology.primaryPlanets).toEqual(['ascendant', 'mars']);
    expect(e.kabalah.extractionKeys).toContain('expression');
    expect(e.tantric.extractionKeys).toContain('soul');
  });

  it('Casa 34 (Peixes) delega 2ª Casa+Vênus | Expressão | Karma — e NÃO o Ascendente', () => {
    const e = getCorrelationEntry(34);
    expect(e.astrology.primaryHouses).toContain(2);
    expect(e.astrology.primaryPlanets).toContain('venus');
    expect(e.tantric.extractionKeys).toContain('karma');
    // determinismo: a casa 34 não puxa dados do Ascendente nem da Lua
    expect(e.astrology.extractionKeys.join(' ')).not.toContain('ascendant');
    expect(e.astrology.extractionKeys.join(' ')).not.toContain('moon');
  });

  it('getCorrelationEntry lança para casa fora do intervalo', () => {
    expect(() => getCorrelationEntry(0)).toThrow();
    expect(() => getCorrelationEntry(37)).toThrow();
  });
});

describe('extractFromMap — extração determinística por dot-path', () => {
  const astrologyMap = {
    ascendant: { sign: 'Virgem', degree: 12 },
    planets: { mars: { sign: 'Leão', house: 11 }, venus: { sign: 'Câncer', house: 10 } },
    houses: { 1: 'Virgem', 2: 'Libra' },
  };

  it('extrai apenas as keys solicitadas', () => {
    const out = extractFromMap(astrologyMap, ['ascendant.sign', 'planets.mars.house']);
    expect(out).toEqual({ 'ascendant.sign': 'Virgem', 'planets.mars.house': 11 });
  });

  it('ignora keys ausentes sem quebrar', () => {
    const out = extractFromMap(astrologyMap, ['planets.pluto.sign', 'houses.1']);
    expect(out).toEqual({ 'houses.1': 'Virgem' });
  });

  it('retorna objeto vazio para mapa nulo/indefinido', () => {
    expect(extractFromMap(null, ['x'])).toEqual({});
    expect(extractFromMap(undefined, ['x'])).toEqual({});
  });

  it('a extração da Casa 1 só traz dados delegados (sem vazamento)', () => {
    const e = getCorrelationEntry(1);
    const out = extractFromMap(astrologyMap, e.astrology.extractionKeys);
    expect(out).toHaveProperty('ascendant.sign', 'Virgem');
    expect(out).toHaveProperty('planets.mars.sign', 'Leão');
    // Vênus NÃO é delegada à casa 1 — não deve aparecer
    expect(Object.keys(out).some((k) => k.includes('venus'))).toBe(false);
  });
});
