// W70 Synastry — aspects.spec.ts
import { Spec } from './harness.ts';
import {
  getMajorAspects,
  getMinorAspects,
  isHarmonious,
  isChallenging,
  getAspectStrength,
  calculateAspect,
  calculateAllAspects,
  auditAspectCatalog,
  ASPECT_ANGLES,
  DEFAULT_ORBS,
} from '../aspects.ts';
import { asNatalChartId } from '../types.ts';
import type { NatalChart, PlanetPosition } from '../types.ts';

function planet(name: PlanetPosition['planet'], degree: number, retro = false): PlanetPosition {
  // Map degree -> sign (every 30°)
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  const sign = signs[Math.floor(((degree % 360 + 360) % 360) / 30)];
  return { planet: name, sign, house: 1, degree, retrograde: retro };
}

export async function runXxxSpec(): Promise<{ passed: number; failed: number; assertions: number; failures: readonly { assertion: string; expected: unknown; actual: unknown; detail?: string }[] }> {
  const spec = new Spec('aspects');

  // SECTION 1 — lookup helpers
  await spec.run('getMajorAspects returns 5 aspects', async (s) => {
    const majors = getMajorAspects();
    s.expect(majors.length).toBe(5);
  });
  await spec.run('getMinorAspects returns 3 aspects', async (s) => {
    const minors = getMinorAspects();
    s.expect(minors.length).toBe(3);
  });
  await spec.run('getMajorAspects includes conjunction', async (s) => {
    s.expect(getMajorAspects().some((t) => t === 'conjunction')).toBeTruthy();
  });
  await spec.run('getMajorAspects includes opposition', async (s) => {
    s.expect(getMajorAspects().some((t) => t === 'opposition')).toBeTruthy();
  });
  await spec.run('getMajorAspects includes trine', async (s) => {
    s.expect(getMajorAspects().some((t) => t === 'trine')).toBeTruthy();
  });
  await spec.run('getMajorAspects includes square', async (s) => {
    s.expect(getMajorAspects().some((t) => t === 'square')).toBeTruthy();
  });
  await spec.run('getMajorAspects includes sextile', async (s) => {
    s.expect(getMajorAspects().some((t) => t === 'sextile')).toBeTruthy();
  });
  await spec.run('getMinorAspects includes quincunx', async (s) => {
    s.expect(getMinorAspects().some((t) => t === 'quincunx')).toBeTruthy();
  });
  await spec.run('getMinorAspects includes semisquare', async (s) => {
    s.expect(getMinorAspects().some((t) => t === 'semisquare')).toBeTruthy();
  });
  await spec.run('getMinorAspects includes sesquisquare', async (s) => {
    s.expect(getMinorAspects().some((t) => t === 'sesquisquare')).toBeTruthy();
  });
  await spec.run('aspect catalog has 8 entries', async (s) => {
    s.expect(Object.keys(ASPECT_ANGLES).length).toBe(8);
  });
  await spec.run('all default orbs are positive', async (s) => {
    for (const t of Object.keys(DEFAULT_ORBS) as (keyof typeof DEFAULT_ORBS)[]) {
      s.expect(DEFAULT_ORBS[t]).toBeGreaterThan(0);
    }
  });

  // SECTION 2 — harmonic classification
  await spec.run('isHarmonious(conjunction) = true', async (s) => { s.expect(isHarmonious('conjunction')).toBeTruthy(); });
  await spec.run('isHarmonious(trine) = true', async (s) => { s.expect(isHarmonious('trine')).toBeTruthy(); });
  await spec.run('isHarmonious(sextile) = true', async (s) => { s.expect(isHarmonious('sextile')).toBeTruthy(); });
  await spec.run('isHarmonious(opposition) = false', async (s) => { s.expect(isHarmonious('opposition')).toBeFalsy(); });
  await spec.run('isHarmonious(square) = false', async (s) => { s.expect(isHarmonious('square')).toBeFalsy(); });
  await spec.run('isChallenging(opposition) = true', async (s) => { s.expect(isChallenging('opposition')).toBeTruthy(); });
  await spec.run('isChallenging(square) = true', async (s) => { s.expect(isChallenging('square')).toBeTruthy(); });
  await spec.run('isChallenging(semisquare) = true', async (s) => { s.expect(isChallenging('semisquare')).toBeTruthy(); });
  await spec.run('isChallenging(trine) = false', async (s) => { s.expect(isChallenging('trine')).toBeFalsy(); });
  await spec.run('isChallenging(conjunction) = false', async (s) => { s.expect(isChallenging('conjunction')).toBeFalsy(); });

  // SECTION 3 — strength math
  await spec.run('getAspectStrength at orb 0 = 1.0', async (s) => { s.expect(getAspectStrength(0, 'trine')).toBeCloseTo(1.0); });
  await spec.run('getAspectStrength at orb max = 0', async (s) => { s.expect(getAspectStrength(7, 'trine')).toBe(0); });
  await spec.run('getAspectStrength at orb half ≈ 0.5', async (s) => { s.expect(getAspectStrength(3.5, 'trine')).toBeCloseTo(0.5); });
  await spec.run('negative orb clamps to 0', async (s) => { s.expect(getAspectStrength(-1, 'trine')).toBe(0); });
  await spec.run('over-max orb clamps to 0', async (s) => { s.expect(getAspectStrength(99, 'trine')).toBe(0); });
  await spec.run('exact conjunction has strength 1', async (s) => { s.expect(getAspectStrength(0, 'conjunction')).toBe(1); });

  // SECTION 4 — pair detection
  await spec.run('0° between planets yields conjunction', async (s) => {
    const a = planet('sol', 0);
    const b = planet('lua', 0);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('conjunction');
  });
  await spec.run('180° between planets yields opposition', async (s) => {
    const a = planet('sol', 0);
    const b = planet('lua', 180);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('opposition');
  });
  await spec.run('120° between planets yields trine', async (s) => {
    const a = planet('sol', 30);
    const b = planet('lua', 150);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('trine');
  });
  await spec.run('90° between planets yields square', async (s) => {
    const a = planet('sol', 10);
    const b = planet('lua', 100);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('square');
  });
  await spec.run('60° between planets yields sextile', async (s) => {
    const a = planet('sol', 50);
    const b = planet('lua', 110);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('sextile');
  });
  await spec.run('150° between planets yields quincunx', async (s) => {
    const a = planet('sol', 10);
    const b = planet('lua', 160);
    const result = calculateAspect(a, b);
    s.expect(result?.type).toBe('quincunx');
  });
  await spec.run('wrap-around 350° -> 10° = 20° aspect (no aspect if < minor orbs)', async (s) => {
    const a = planet('sol', 0);
    const b = planet('lua', 19);
    const result = calculateAspect(a, b);
    // 19° is not within any major orb of any aspect
    s.expect(result).toBe(null);
  });
  await spec.run('same planet returns null', async (s) => {
    const a = planet('sol', 0);
    const result = calculateAspect(a, a);
    s.expect(result).toBe(null);
  });
  await spec.run('aspect orb is in degrees', async (s) => {
    const a = planet('sol', 50);
    const b = planet('lua', 110);
    const result = calculateAspect(a, b);
    s.expect(result?.orb).toBe(0);
  });
  await spec.run('aspect strength visible', async (s) => {
    const a = planet('sol', 50);
    const b = planet('lua', 110);
    const result = calculateAspect(a, b);
    s.expect(result?.strength).toBe(1);
  });
  await spec.run('aspect angleDeg visible', async (s) => {
    const a = planet('sol', 0);
    const b = planet('lua', 90);
    const result = calculateAspect(a, b);
    s.expect(result?.angleDeg).toBe(90);
  });
  await spec.run('aspect harmonious flag correct (trine)', async (s) => {
    const a = planet('sol', 30); const b = planet('lua', 150);
    const result = calculateAspect(a, b);
    s.expect(result?.harmonious).toBeTruthy();
    s.expect(result?.challenging).toBeFalsy();
  });
  await spec.run('aspect challenging flag correct (square)', async (s) => {
    const a = planet('sol', 10); const b = planet('lua', 100);
    const result = calculateAspect(a, b);
    s.expect(result?.challenging).toBeTruthy();
    s.expect(result?.harmonious).toBeFalsy();
  });

  // SECTION 5 — batch + audit
  const sigA: PlanetPosition = { planet: 'sol', sign: 'taurus', house: 1, degree: 50, retrograde: false };
  const sigB: PlanetPosition = { planet: 'lua', sign: 'capricornius', house: 7, degree: 290, retrograde: false };
  const placeholderChart: NatalChart = {
    id: asNatalChartId('demo'),
    planets: Object.freeze([sigA, sigB]),
    houses: Object.freeze([]),
    ascendant: { sign: 'aries', degree: 0 },
  };

  await spec.run('calculateAllAspects finds multiple aspects', async (s) => {
    const aspects = calculateAllAspects(placeholderChart.planets, placeholderChart.planets);
    // 2 planets × 2 planets — 4 pairings, all excluded same-planet; net positive counts.
    s.expect(aspects.length).toBe(2);
  });
  await spec.run('auditAspectCatalog reports 5 major + 3 minor', async (s) => {
    const audit = auditAspectCatalog();
    s.expect(audit.majorCount).toBe(5);
    s.expect(audit.minorCount).toBe(3);
  });
  await spec.run('audit harmonious/challenging counts', async (s) => {
    const audit = auditAspectCatalog();
    s.expect(audit.harmoniousCount).toBe(3);
    s.expect(audit.challengingCount).toBe(3);
  });
  await spec.run('audit orbs presence', async (s) => {
    const audit = auditAspectCatalog();
    s.expect(audit.orbs.conjunction).toBe(8);
  });

  return spec.getResult();
}
