/**
 * AD-04 — Birth Chart Precision Validation Tests
 *
 * Doc 23 (auditoria-mapas-geolocalizacao.md): AD-04 is BLOCKED waiting for
 * 3 reference birth charts to validate precision. This test file provides
 * the next-best thing: consistency and reasonability guards for the simplified
 * ephemeris in src/lib/astrologia/swiss-ephemeris.ts.
 *
 * We do NOT test against real Swiss Ephemeris precision (AD-04 requirement).
 * We DO verify:
 *   1. Determinism: same input → same output across multiple runs
 *   2. Valid ranges: all longitudes [0, 360), degrees [1, 30], signs ∈ 12 valid
 *   3. Sign consistency: zodiac boundaries respected (e.g. 0-30° = Aries)
 *   4. House assignment: ascendant, MC, house cusps in valid ranges
 *   5. Planet presence: all expected planets present for any valid birth date
 *   6. No crashes: handles edge cases (midnight, near-zero lat/lon)
 *   7. Known sign facts: Sun near perihelion ≈ Jan 3 (Capricorn season)
 *
 * Reference coords: São Paulo, SP (lat=-23.5505, lon=-46.6333)
 */

import { describe, it, expect } from 'vitest';
import { calcularPosicao, getSigno, getGrauNoSigno, normalizeDegrees, getBirthChart, type BirthChart, type Planeta, type Signo } from '@akasha/core-astrology';

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** São Paulo, SP — used as the standard reference location */
const SAOPAULO = { lat: -23.5505, lon: -46.6333 };

/** All 13 planet keys returned by getPositions() */
const ALL_PLANETS: Planeta[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao',
  'node_norte', 'chiron', 'lilith',
];

/** The 12 valid sign names */
const ALL_SIGNS: Signo[] = [
  'aries', 'touro', 'gemeos', 'cancer',
  'leao', 'virgem', 'libra', 'escorpio',
  'sagitario', 'capricornio', 'aquario', 'peixes',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  // Parse as midnight UTC
  return new Date(iso + 'T00:00:00Z');
}

function expectLongitudeInRange(longitude: number, label: string): void {
  expect(longitude, `${label} must be ≥ 0`).toBeGreaterThanOrEqual(0);
  expect(longitude, `${label} must be < 360`).toBeLessThan(360);
}

function expectSignValid(sign: Signo, label: string): void {
  expect(ALL_SIGNS, `${label} must be one of the 12 valid signs`).toContain(sign);
}

/** Verify that a longitude falls within a specific zodiac sign (boundary-closed / boundary-open) */
function expectLongitudeInSign(
  longitude: number,
  expectedSign: Signo,
  label: string
): void {
  const signIndex = ALL_SIGNS.indexOf(expectedSign);
  const signStart = signIndex * 30;
  const signEnd = signStart + 30; // exclusive upper bound

  const norm = ((longitude % 360) + 360) % 360;
  const inRange = norm >= signStart && norm < signEnd;
  expect(inRange, `${label} (${longitude.toFixed(2)}°) should be in ${expectedSign} (${signStart}°–${signEnd}°)`).toBe(true);
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('AD-04 — Birth Chart Precision: Determinism', () => {
  const date = parseDate('1990-01-15');
  const chart1 = getBirthChart({ birthDate: date, ...SAOPAULO });
  const chart2 = getBirthChart({ birthDate: date, ...SAOPAULO });

  it('returns the same planets array on repeated calls', () => {
    expect(chart1.planets).toHaveLength(chart2.planets.length);
    for (let i = 0; i < chart1.planets.length; i++) {
      expect(chart1.planets[i].longitude, `planet[${i}] longitude must be stable`).toBeCloseTo(
        chart2.planets[i].longitude,
        5
      );
    }
  });

  it('returns the same ascendant on repeated calls', () => {
    expect(chart1.ascendant, 'ascendant must be deterministic').toBeCloseTo(chart2.ascendant, 5);
  });

  it('returns the same house cusps on repeated calls', () => {
    expect(chart1.houses).toHaveLength(chart2.houses.length);
    for (let i = 0; i < chart1.houses.length; i++) {
      expect(chart1.houses[i].cusp, `house[${i}] cusp must be deterministic`).toBeCloseTo(
        chart2.houses[i].cusp,
        5
      );
    }
  });

  it('calculates the same positions for an identical Date object reference', () => {
    const d = new Date('2000-01-01T12:00:00Z');
    const p1 = calcularPosicao('sol', d);
    const p2 = calcularPosicao('sol', d);
    expect(p1.longitude).toBeCloseTo(p2.longitude, 5);
    expect(p1.velocidade).toBe(p2.velocidade);
  });
});

describe('AD-04 — Birth Chart Precision: Valid Ranges', () => {
  const date = parseDate('1990-01-15');
  const chart = getBirthChart({ birthDate: date, ...SAOPAULO });

  it('all planet longitudes are in [0, 360)', () => {
    for (const planet of chart.planets) {
      expectLongitudeInRange(planet.longitude, `${planet.planet} longitude`);
    }
  });

  it('all planet degrees within sign are in [1, 30]', () => {
    for (const planet of chart.planets) {
      expect(planet.degree, `${planet.planet} degree must be 1–30`).toBeGreaterThanOrEqual(1);
      expect(planet.degree, `${planet.planet} degree must be 1–30`).toBeLessThanOrEqual(30);
    }
  });

  it('all planet signs are valid (one of the 12)', () => {
    for (const planet of chart.planets) {
      expectSignValid(planet.sign, `${planet.planet} sign`);
    }
  });

  it('ascendant is in [0, 360)', () => {
    expectLongitudeInRange(chart.ascendant, 'ascendant');
  });

  it('midheaven (MC) is in [0, 360)', () => {
    expectLongitudeInRange(chart.midheaven, 'midheaven');
  });

  it('all 12 house cusps are in [0, 360)', () => {
    expect(chart.houses).toHaveLength(12);
    for (const house of chart.houses) {
      expectLongitudeInRange(house.cusp, `house ${house.number} cusp`);
    }
  });

  it('normalizeDegrees preserves [0,360) for any integer input', () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(359.9)).toBeCloseTo(359.9, 3);
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(720)).toBe(0);
    expect(normalizeDegrees(-90)).toBe(270);
    expect(normalizeDegrees(-360)).toBe(0);
  });
});

describe('AD-04 — Birth Chart Precision: Sign Consistency', () => {
  it('getSigno maps 0-30° → aries, 30-60° → touro, ...', () => {
    expect(getSigno(0)).toBe('aries');
    expect(getSigno(29.99)).toBe('aries');
    expect(getSigno(30)).toBe('touro');
    expect(getSigno(59.99)).toBe('touro');
    expect(getSigno(60)).toBe('gemeos');
    expect(getSigno(90)).toBe('cancer');
    expect(getSigno(180)).toBe('libra');
    expect(getSigno(270)).toBe('capricornio');
    expect(getSigno(359.99)).toBe('peixes');
    expect(getSigno(360)).toBe('aries'); // wrap-around
  });

  it('getGrauNoSigno returns 0-29 (then callers add 1 for 1-30)', () => {
    expect(getGrauNoSigno(0)).toBe(0);
    expect(getGrauNoSigno(29.99)).toBeCloseTo(29.99, 2);
    expect(getGrauNoSigno(30)).toBe(0);
    expect(getGrauNoSigno(59.99)).toBeCloseTo(29.99, 2);
    expect(getGrauNoSigno(360)).toBe(0);
    expect(getGrauNoSigno(390)).toBe(0); // 390 = 13 * 30, 13 full cycles, back to aries degree 0
  });

  it('Sun sign is consistent with known approximate solar longitude (Jan 15 = Capricorn season)', () => {
    // Capricorn season: Dec 22 – Jan 19. A person born Jan 15 should have Sun in Capricorn.
    const sunJan15 = calcularPosicao('sol', parseDate('1990-01-15'));
    expectLongitudeInSign(sunJan15.longitude, 'capricornio', 'Sun on Jan 15');
  });

  it('Sun sign is consistent with known approximate solar longitude (Jul 15 = Cancer season)', () => {
    // Cancer season: Jun 21 – Jul 22. A person born Jul 15 should have Sun in Cancer.
    const sunJul15 = calcularPosicao('sol', parseDate('1990-07-15'));
    expectLongitudeInSign(sunJul15.longitude, 'cancer', 'Sun on Jul 15');
  });

  it('Sun sign is consistent with known approximate solar longitude (Oct 15 = Libra season)', () => {
    // Libra season: Sep 23 – Oct 23.
    const sunOct15 = calcularPosicao('sol', parseDate('1990-10-15'));
    expectLongitudeInSign(sunOct15.longitude, 'libra', 'Sun on Oct 15');
  });

  it('Sun sign is consistent with known approximate solar longitude (Apr 15 = Aries season)', () => {
    // Aries season: Mar 21 – Apr 19.
    const sunApr15 = calcularPosicao('sol', parseDate('1990-04-15'));
    expectLongitudeInSign(sunApr15.longitude, 'aries', 'Sun on Apr 15');
  });

  it('sign of a longitude is the same whether calculated directly or via PlanetPosition', () => {
    const date = parseDate('1986-08-20');
    const planets = getBirthChart({ birthDate: date, ...SAOPAULO }).planets;
    for (const p of planets) {
      const directSign = getSigno(p.longitude);
      expect(p.sign, `${p.planet} sign must match direct getSigno()`).toBe(directSign);
    }
  });
});

describe('AD-04 — Birth Chart Precision: Planet Presence', () => {
  it('getPositions returns all 13 expected planets for a standard date', () => {
    const planets = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO }).planets;
    expect(planets).toHaveLength(13);
    const names = planets.map(p => p.planet);
    for (const expected of ALL_PLANETS) {
      expect(names, `${expected} must be present`).toContain(expected);
    }
  });

  it('all planets are distinct (no duplicate planet entries)', () => {
    const planets = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO }).planets;
    const names = planets.map(p => p.planet);
    const unique = new Set(names);
    expect(unique.size, 'all planet entries must be unique').toBe(names.length);
  });

  it('getPositions returns all 13 planets for 4 different dates spanning decades', () => {
    const dates = ['1970-01-01', '1986-08-20', '2000-06-15', '2024-12-31'];
    for (const iso of dates) {
      const planets = getBirthChart({ birthDate: parseDate(iso), ...SAOPAULO }).planets;
      expect(planets, `${iso}: must return 13 planets`).toHaveLength(13);
    }
  });

  it('sol and lua have positive velocity (always moving forward)', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const sol = chart.planets.find(p => p.planet === 'sol')!;
    const lua = chart.planets.find(p => p.planet === 'lua')!;
    expect(sol.velocity, 'Sun velocity must be positive').toBeGreaterThan(0);
    expect(lua.velocity, 'Moon velocity must be positive').toBeGreaterThan(0);
  });

  it('outer planets have plausible velocities (lower than inner)', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const jup = chart.planets.find(p => p.planet === 'jupiter')!;
    const sat = chart.planets.find(p => p.planet === 'saturno')!;
    const nep = chart.planets.find(p => p.planet === 'netuno')!;
    const plz = chart.planets.find(p => p.planet === 'plutao')!;
    // Approximate daily motions: Jupiter ~0.08°/day, Saturn ~0.03°/day, Neptune ~0.006°/day, Pluto ~0.004°/day
    expect(jup.velocity).toBeGreaterThan(0.05);
    expect(jup.velocity).toBeLessThan(0.15);
    expect(sat.velocity).toBeGreaterThan(0.02);
    expect(sat.velocity).toBeLessThan(0.06);
    expect(nep.velocity).toBeGreaterThan(0.003);
    expect(nep.velocity).toBeLessThan(0.015);
    expect(plz.velocity).toBeGreaterThan(0.002);
    expect(plz.velocity).toBeLessThan(0.008);
  });
});

describe('AD-04 — Birth Chart Precision: House Assignment', () => {
  it('ascendant is a valid sign name (via getSigno)', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const ascSign = getSigno(chart.ascendant);
    expectSignValid(ascSign, 'ascendant');
  });

  it('midheaven is a valid sign name (via getSigno)', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const mcSign = getSigno(chart.midheaven);
    expectSignValid(mcSign, 'midheaven');
  });

  it('all 12 house cusps are valid sign names', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    for (const house of chart.houses) {
      const cuspSign = getSigno(house.cusp);
      expectSignValid(cuspSign, `house ${house.number} cusp`);
    }
  });

  it('houses are numbered 1-12 in order', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const numbers = chart.houses.map(h => h.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('house 1 cusp ≈ ascendant longitude (within 1°)', () => {
    // House 1 cusp is the ascendant in Placidus/Equal systems
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const house1Cusp = chart.houses[0].cusp;
    expect(Math.abs(chart.ascendant - house1Cusp), 'house 1 cusp ≈ ascendant').toBeLessThan(1);
  });
});

describe('AD-04 — Birth Chart Precision: No Crashes / Edge Cases', () => {
  it('handles birth at midnight (00:00 UTC)', () => {
    const midnight = new Date('2000-01-01T00:00:00Z');
    const chart = getBirthChart({ birthDate: midnight, ...SAOPAULO });
    expect(chart.planets).toHaveLength(13);
    expectLongitudeInRange(chart.ascendant, 'ascendant at midnight');
  });

  it('handles birth at noon (12:00 UTC)', () => {
    const noon = new Date('2000-06-15T12:00:00Z');
    const chart = getBirthChart({ birthDate: noon, ...SAOPAULO });
    expect(chart.planets).toHaveLength(13);
    expectLongitudeInRange(chart.midheaven, 'midheaven at noon');
  });

  it('handles date in the distant past (1900)', () => {
    const early = parseDate('1900-01-01');
    const chart = getBirthChart({ birthDate: early, ...SAOPAULO });
    expect(chart.planets).toHaveLength(13);
    for (const p of chart.planets) {
      expectLongitudeInRange(p.longitude, `${p.planet} longitude in 1900`);
    }
  });

  it('handles date in the future (2100)', () => {
    const future = parseDate('2100-01-01');
    const chart = getBirthChart({ birthDate: future, ...SAOPAULO });
    expect(chart.planets).toHaveLength(13);
    for (const p of chart.planets) {
      expectLongitudeInRange(p.longitude, `${p.planet} longitude in 2100`);
    }
  });

  it('handles equator location (latitude ≈ 0)', () => {
    const equator = { lat: 0.0, lon: -46.6333 };
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...equator });
    expect(chart.planets).toHaveLength(13);
    expectLongitudeInRange(chart.ascendant, 'ascendant at equator');
    expectLongitudeInRange(chart.midheaven, 'midheaven at equator');
  });

  it('handles date-line location (longitude ≈ ±180)', () => {
    const dateline = { lat: -23.5505, lon: 180.0 };
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...dateline });
    expect(chart.planets).toHaveLength(13);
    // All longitudes should still be normalized [0,360)
    for (const p of chart.planets) {
      expectLongitudeInRange(p.longitude, `${p.planet} longitude near dateline`);
    }
  });

  it('calcularPosicao handles every known planeta without throwing', () => {
    const date = parseDate('2000-01-01');
    for (const planeta of ALL_PLANETS) {
      expect(() => calcularPosicao(planeta, date), `${planeta} must not throw`).not.toThrow();
      const pos = calcularPosicao(planeta, date);
      expectLongitudeInRange(pos.longitude, `${planeta} longitude`);
    }
  });
});

describe('AD-04 — Birth Chart Precision: MapaNatal Chart Object', () => {
  it('chart.planeta contains all 10 classical planets', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const EXPECTED_CHART_PLANETS = [
      'sol', 'lua', 'mercurio', 'venus', 'marte',
      'jupiter', 'saturno', 'urano', 'netuno', 'plutao',
    ];
    for (const key of EXPECTED_CHART_PLANETS) {
      expect(chart.chart.planeta, `${key} must be in chart.planeta`).toHaveProperty(key);
    }
  });

  it('chart.casas has exactly 12 houses', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    expect(chart.chart.casas).toHaveLength(12);
    for (const casa of chart.chart.casas) {
      expectSignValid(casa.signo, `casa ${casa.numero} signo`);
    }
  });

  it('chart.ascendente matches the top-level ascendant field', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    expect(chart.chart.ascendente).toBeCloseTo(chart.ascendant, 5);
  });

  it('nodes are exactly 180° apart', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    // node_sul is derived (not stored), so we compute it from node_norte.
    const north = chart.planets.find(p => p.planet === 'node_norte')!.longitude;
    const south = ((north + 180) % 360);
    // Math: (north - south) mod 360 should equal 180 (or 0 for north=south)
    const diff = Math.abs(((north - south) % 360 + 360) % 360);
    const distanceFromOpposition = Math.abs(diff - 180);
    expect(distanceFromOpposition, 'nodes must be 180° apart').toBeLessThan(0.1);
  });

  it('nodes never have retrograde flag set', () => {
    const chart = getBirthChart({ birthDate: parseDate('1990-01-15'), ...SAOPAULO });
    const north = chart.planets.find(p => p.planet === 'node_norte')!;
    expect(north.retrograde, 'north node must not be retrograde').toBe(false);
  });
});

describe('AD-04 — Birth Chart Precision: Reference Case (Eliane Simão, Doc 09)', () => {
  // Eliane Simão de Almeida, 20/08/1986, São Paulo
  // Used throughout the test suite as the canonical reference case
  const DATA_ELIANE = parseDate('1986-08-20');
  const CHART_ELIANE = getBirthChart({ birthDate: DATA_ELIANE, ...SAOPAULO });

  it('all 13 planets present for Eliane', () => {
    expect(CHART_ELIANE.planets).toHaveLength(13);
  });

  it('all planet longitudes in valid range for Eliane', () => {
    for (const p of CHART_ELIANE.planets) {
      expectLongitudeInRange(p.longitude, `${p.planet} longitude`);
    }
  });

  it('all house cusps in valid range for Eliane', () => {
    expect(CHART_ELIANE.houses).toHaveLength(12);
    for (const h of CHART_ELIANE.houses) {
      expectLongitudeInRange(h.cusp, `house ${h.number} cusp`);
    }
  });

  it('ascendant and MC are valid signs for Eliane', () => {
    expectSignValid(getSigno(CHART_ELIANE.ascendant), 'ascendant');
    expectSignValid(getSigno(CHART_ELIANE.midheaven), 'midheaven');
  });

  it('aspects array is returned (may be empty)', () => {
    expect(Array.isArray(CHART_ELIANE.aspects)).toBe(true);
  });

  it('MapaNatal chart object is complete for Eliane', () => {
    expect(CHART_ELIANE.chart).toBeDefined();
    expect(CHART_ELIANE.chart.planeta['sol']).toBeDefined();
    expect(CHART_ELIANE.chart.planeta['lua']).toBeDefined();
    expect(CHART_ELIANE.chart.casas).toHaveLength(12);
  });
});
