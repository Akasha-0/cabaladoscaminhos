import { describe, it, expect } from 'vitest';
import {
  CORRELATION_MAP,
  getCorrelationEntry,
  extractFromMap,
} from '@/lib/ai/correlation-map';
import { normalizeBirthChart } from '@/lib/ai/dossier/oracle-prompt-builder';
import type { BirthChart } from '@akasha/core-astrology';

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
  // Array format with both .house and .numero (normalized BirthChart uses .numero)
  const astrologyMap = {
    ascendant: 'Virgem',
    planets: [
      { planet: 'mars', sign: 'Leão', degree: 22, house: 11 },
      { planet: 'venus', sign: 'Câncer', degree: 5, house: 10 },
    ],
    houses: [
      { house: 1, numero: 1, sign: 'Virgem', degree: 12 },
      { house: 2, numero: 2, sign: 'Libra', degree: 8 },
    ],
  };
  it('extrai planets array por nome (planets.mars.house)', () => {
    const out = extractFromMap(astrologyMap, ['planets.mars.house', 'planets.venus.sign']);
    expect(out).toEqual({ 'planets.mars.house': 11, 'planets.venus.sign': 'Câncer' });
  });
  it('extrai houses array por número (houses.2) — usa .numero', () => {
    const out = extractFromMap(astrologyMap, ['houses.2', 'houses.1']);
    expect(out).toEqual({ 'houses.2': 'Libra', 'houses.1': 'Virgem' });
  });
  it('ignora keys ausentes sem quebrar', () => {
    const out = extractFromMap(astrologyMap, ['planets.pluto.sign']);
    expect(Object.keys(out).length).toBe(0);
  });
  it('retorna objeto vazio para mapa nulo/indefinido', () => {
    expect(extractFromMap(null, ['x'])).toEqual({});
    expect(extractFromMap(undefined, ['x'])).toEqual({});
  });
  it('a extração da Casa 1 só traz dados delegados (sem vazamento)', () => {
    const e = getCorrelationEntry(1);
    const out = extractFromMap(astrologyMap, e.astrology.extractionKeys);
    expect(out).toHaveProperty('planets.mars.sign', 'Leão');
    expect(Object.keys(out).some((k) => k.includes('venus'))).toBe(false);
  });
  it('extrai nodes e ascendente (flat key)', () => {
    const nodeMap = { northNode: { sign: 'cancer', house: 5 }, southNode: { sign: 'capricornio', house: 11 } };
    const out = extractFromMap(nodeMap, ['northNode.sign', 'southNode.sign']);
    expect(out).toEqual({ 'northNode.sign': 'cancer', 'southNode.sign': 'capricornio' });
  });
  it('extrai aspekte (flat top-level)', () => {
    const map = { aspects: [{ type: 'trine', planets: ['sun', 'moon'] }] };
    const out = extractFromMap(map, ['aspects']);
    expect(out).toHaveProperty('aspects');
  });
});

describe('normalizeBirthChart — BirthChart → extractFromMap format', () => {
  // Minimal mock BirthChart covering the key structures
  const mockBirthChart: BirthChart = {
    planets: [],
    houses: [],
    ascendant: 127.5,
    midheaven: 200,
    aspects: [{ type: 'trine', planets: ['sol', 'lua'] }] as unknown[],
    chart: {
      planeta: {
        sol: { planeta: 'sol', signo: 'leao' as const, casa: 5, grauNoSigno: 17 },
        lua: { planeta: 'lua', signo: 'aries' as const, casa: 1, grauNoSigno: 3 },
        marte: { planeta: 'marte', signo: 'escorpio' as const, casa: 8, grauNoSigno: 22 },
        jupiter: { planeta: 'jupiter', signo: 'touro' as const, casa: 2, grauNoSigno: 10 },
        venus: { planeta: 'venus', signo: 'cancer' as const, casa: 10, grauNoSigno: 5 },
        mercurio: { planeta: 'mercurio', signo: 'virgem' as const, casa: 6, grauNoSigno: 14 },
        saturno: { planeta: 'saturno', signo: 'peixes' as const, casa: 12, grauNoSigno: 28 },
        netuno: { planeta: 'netuno', signo: 'aquario' as const, casa: 11, grauNoSigno: 2 },
        urano: { planeta: 'urano', signo: 'gemeos' as const, casa: 9, grauNoSigno: 8 },
        plutao: { planeta: 'plutao', signo: 'sagitario' as const, casa: 7, grauNoSigno: 15 },
        chiron: { planeta: 'chiron', signo: 'libra' as const, casa: 4, grauNoSigno: 1 },
        lilith: { planeta: 'lilith', signo: 'aries' as const, casa: 1, grauNoSigno: 20 },
        node_norte: { planeta: 'node_norte', signo: 'cancer' as const, casa: 5, grauNoSigno: 10 },
        node_sul: { planeta: 'node_sul', signo: 'capricornio' as const, casa: 11, grauNoSigno: 10 },
      },
      casas: [
        { numero: 1, signo: 'aries' as const, grauNoSigno: 5, planetaRegente: 'marte' },
        { numero: 2, signo: 'touro' as const, grauNoSigno: 10, planetaRegente: 'venus' },
        { numero: 3, signo: 'gemeos' as const, grauNoSigno: 20, planetaRegente: 'mercurio' },
        { numero: 4, signo: 'cancer' as const, grauNoSigno: 8, planetaRegente: 'lua' },
        { numero: 5, signo: 'leao' as const, grauNoSigno: 15, planetaRegente: 'sol' },
        { numero: 6, signo: 'virgem' as const, grauNoSigno: 3, planetaRegente: 'mercurio' },
        { numero: 7, signo: 'libra' as const, grauNoSigno: 12, planetaRegente: 'venus' },
        { numero: 8, signo: 'escorpio' as const, grauNoSigno: 22, planetaRegente: 'marte' },
        { numero: 9, signo: 'sagitario' as const, grauNoSigno: 6, planetaRegente: 'jupiter' },
        { numero: 10, signo: 'capricornio' as const, grauNoSigno: 18, planetaRegente: 'saturno' },
        { numero: 11, signo: 'aquario' as const, grauNoSigno: 2, planetaRegente: 'saturno' },
        { numero: 12, signo: 'peixes' as const, grauNoSigno: 25, planetaRegente: 'jupiter' },
      ],
      ascendente: 17.5, // 17.5° → 0° Aries
      mediumCoeli: 127.5,
      nodes: {
        norte: { planeta: 'node_norte', signo: 'cancer' as const, casa: 5, grauNoSigno: 10 },
        sul: { planeta: 'node_sul', signo: 'capricornio' as const, casa: 11, grauNoSigno: 10 },
      },
    },
  };

  it('mapeia planetas internos → nomes em inglês', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    // normalizeBirthChart stores 'sign'/'house' (not 'signo'/'casa') to match extraction key format
    expect(normalized).toHaveProperty('planets.sun.sign', 'leao');
    expect(normalized).toHaveProperty('planets.mars.sign', 'escorpio');
    expect(normalized).toHaveProperty('planets.jupiter.sign', 'touro');
    expect(normalized).toHaveProperty('planets.venus.sign', 'cancer');
    expect(normalized).toHaveProperty('planets.mercury.sign', 'virgem');
    expect(normalized).toHaveProperty('planets.saturn.sign', 'peixes');
    expect(normalized).toHaveProperty('planets.neptune.sign', 'aquario');
    expect(normalized).toHaveProperty('planets.uranus.sign', 'gemeos');
    expect(normalized).toHaveProperty('planets.pluto.sign', 'sagitario');
    expect(normalized).toHaveProperty('planets.chiron.sign', 'libra');
    expect(normalized).toHaveProperty('planets.lilith.sign', 'aries');
  });

  it('inclui ascendente como flat key (signo derivado do grau)', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    // 17.5° → 0° Aries; ascendant stored as flat key (sign string)
    expect(normalized).toHaveProperty('ascendant', 'aries');
    expect(normalized).toHaveProperty('ascendente_signo', 'aries');
  });

  it('mapeia casas como Record com .numero e .house', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    const h = normalized.houses as Record<string, Record<string, unknown>>;
    expect(h['1'].house).toBe(1);
    expect(h['1'].numero).toBe(1);
    expect(h['1'].sign).toBe('aries');
    expect(h['8'].house).toBe(8);
    expect(h['8'].numero).toBe(8);
    expect(h['8'].sign).toBe('escorpio');
  });

  it('inclui nodes e aspects no top-level', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    expect(normalized).toHaveProperty('northNode.sign', 'cancer');
    expect(normalized).toHaveProperty('southNode.sign', 'capricornio');
    expect(normalized).toHaveProperty('aspects');
  });

  it('extractFromMap extrai corretamente com extraction keys reais', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    // Casa 1: ['ascendant', 'planets.mars.sign', 'planets.mars.house', 'houses.1']
    const out = extractFromMap(normalized, ['ascendant', 'planets.mars.sign', 'planets.mars.house', 'houses.1']);
    expect(out).toHaveProperty('ascendant', 'aries');
    expect(out).toHaveProperty('planets.mars.sign', 'escorpio');
    expect(out).toHaveProperty('planets.mars.house', 8);
    expect(out).toHaveProperty('houses.1', 'aries');
  });

  it('extractFromMap com keys de casa real (houses.2)', () => {
    const normalized = normalizeBirthChart(mockBirthChart);
    // Casa 2: ['planets.jupiter.sign', 'planets.jupiter.house']
    const out = extractFromMap(normalized, ['planets.jupiter.sign', 'planets.jupiter.house']);
    expect(out).toHaveProperty('planets.jupiter.sign', 'touro');
    expect(out).toHaveProperty('planets.jupiter.house', 2);
  });
});
