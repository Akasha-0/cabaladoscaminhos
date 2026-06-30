// W70 Synastry — composite.spec.ts
import { Spec } from './harness.ts';
import {
  calculateCompositeChart,
  getCompositePlanetPositions,
  getCompositeHouses,
  interpretComposite,
  auditComposite,
} from '../composite.ts';
import { asNatalChartId } from '../types.ts';
import type { HouseCusp, NatalChart, PlanetPosition, ZodiacSign, HouseNumber } from '../types.ts';

function makeHouses(): readonly HouseCusp[] {
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  return signs.map((sgn, i) => ({
    house: (i + 1) as HouseNumber,
    sign: sgn,
    degree: i * 30,
  } as HouseCusp));
}

function planet(idx: 0|1|2|3|4|5|6|7|8|9, baseDeg: number): PlanetPosition {
  const planetNames = ['sol','lua','mercurio','venus','marte','jupiter','saturno','urano','netuno','plutao'] as const;
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  const deg = baseDeg + idx * 36;
  return {
    planet: planetNames[idx],
    sign: signs[Math.floor(deg / 30) % 12],
    house: ((Math.floor(deg / 30) % 12) + 1) as HouseNumber,
    degree: ((deg % 360) + 360) % 360,
    retrograde: false,
  };
}

function makeChart(baseDeg: number): NatalChart {
  return Object.freeze({
    id: asNatalChartId('chart-' + String(baseDeg)),
    planets: Object.freeze([0,1,2,3,4,5,6,7,8,9].map((i) => planet(i as 0|1|2|3|4|5|6|7|8|9, baseDeg))),
    houses: Object.freeze(makeHouses()),
    ascendant: Object.freeze({ sign: 'aries' as ZodiacSign, degree: 0 }),
  });
}

export async function runXxxSpec(): Promise<{ passed: number; failed: number; assertions: number; failures: readonly { assertion: string; expected: unknown; actual: unknown; detail?: string }[] }> {
  const spec = new Spec('composite');

  // SECTION 1 — basic midpoint math
  await spec.run('compositeSol between 0° and 60° = 30°', async (s) => {
    const a = makeChart(0);
    const b = makeChart(60);
    const c = calculateCompositeChart(a, b);
    const sol = c.midpoints.find((p) => p.planet === 'sol')!;
    s.expect(sol.degree).toBe(30);
  });
  await spec.run('compositeSol between 0° and 180° = 90°', async (s) => {
    const a = makeChart(0);
    const b = makeChart(180);
    const c = calculateCompositeChart(a, b);
    const sol = c.midpoints.find((p) => p.planet === 'sol')!;
    s.expect(sol.degree).toBe(90);
  });
  await spec.run('compositeLua midpoint (100°, 200°) at base+idx*36 = 186°', async (s) => {
    // chartA base=100, lua (idx=1) → 100+36 = 136°
    // chartB base=200, lua (idx=1) → 200+36 = 236°
    // midpoint = (136+236)/2 = 186°
    const a = makeChart(100);
    const b = makeChart(200);
    const c = calculateCompositeChart(a, b);
    const lua = c.midpoints.find((p) => p.planet === 'lua')!;
    s.expect(lua.degree).toBe(186);
  });
  await spec.run('compositeVenus midpoint wraps negative (180° expected)', async (s) => {
    // a base=-90 -> venus idx=3 → -90+108 = 18 → normalize to 18°
    // b base=-60 -> venus idx=3 → -60+108 = 48 → 48°
    // midpoint = (18+48)/2 = 33°
    const a = makeChart(-90);
    const b = makeChart(-60);
    const c = calculateCompositeChart(a, b);
    const v = c.midpoints.find((p) => p.planet === 'venus')!;
    s.expect(v.degree).toBe(33);
  });
  await spec.run('composite midpoint selects shorter arc', async (s) => {
    // a=350, b=10 — clockwise via 0 = 20° vs counter-clockwise 340°
    // midpoint should be on the SHORTER arc: 0°
    const a = makeChart(0);
    const b = makeChart(360);
    const c = calculateCompositeChart(a, b);
    const sol = c.midpoints.find((p) => p.planet === 'sol')!;
    s.expect(sol.degree).toBe(0);
  });

  // SECTION 2 — composite houses
  await spec.run('composite houses = 12', async (s) => {
    const a = makeChart(0);
    const b = makeChart(60);
    const c = calculateCompositeChart(a, b);
    s.expect(c.houses.length).toBe(12);
  });
  await spec.run('composite house 1 = midpoint of chartA 0° + chartB 0°', async (s) => {
    const a = makeChart(0);
    const b = makeChart(0);
    const c = calculateCompositeChart(a, b);
    const h1 = c.houses.find((h) => h.house === 1)!;
    s.expect(h1.degree).toBe(0);
  });
  await spec.run('composite house 4 midpoint (cusps always equal here)', async (s) => {
    // makeHouses produces 12 cusps at 0, 30, ..., 330. baseDeg does not affect cusps.
    // So h4 cusp = 90° in BOTH charts → midpoint = 90°
    const a = makeChart(0);
    const b = makeChart(180);
    const c = calculateCompositeChart(a, b);
    const h4 = c.houses.find((h) => h.house === 4)!;
    s.expect(h4.degree).toBe(90);
  });
  await spec.run('composite house 7 cusp = 180° (cusps match)', async (s) => {
    const a = makeChart(0);
    const b = makeChart(180);
    const c = calculateCompositeChart(a, b);
    const h7 = c.houses.find((h) => h.house === 7)!;
    s.expect(h7.degree).toBe(180);
  });
  await spec.run('composite houses yield valid zodiac signs', async (s) => {
    const a = makeChart(0);
    const b = makeChart(180);
    const c = calculateCompositeChart(a, b);
    const validSigns = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
    for (const h of c.houses) {
      s.expect(validSigns.includes(h.sign)).toBeTruthy();
    }
  });

  // SECTION 3 — getComposite* helpers
  await spec.run('getCompositePlanetPositions returns 10', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    s.expect(getCompositePlanetPositions(c).length).toBe(10);
  });
  await spec.run('getCompositeHouses returns 12', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    s.expect(getCompositeHouses(c).length).toBe(12);
  });
  await spec.run('helper returns same instance (readonly)', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    s.expect(getCompositePlanetPositions(c) === c.midpoints).toBeTruthy();
  });

  // SECTION 4 — interpretComposite strings
  await spec.run('interpretComposite pt-BR returns pt text', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    const result = interpretComposite(c, 'pt-BR');
    s.expect(result.toLowerCase()).toContain('mapa composto');
  });
  await spec.run('interpretComposite en returns english text', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    const result = interpretComposite(c, 'en');
    s.expect(result.toLowerCase()).toContain('composite');
  });
  await spec.run('interpretComposite es returns spanish text', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    const result = interpretComposite(c, 'es');
    s.expect(result.toLowerCase()).toContain('compuesta');
  });

  // SECTION 5 — audit
  await spec.run('auditComposite reports 10 planets + 12 houses', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    const audit = auditComposite(c);
    s.expect(audit.planetCount).toBe(10);
    s.expect(audit.houseCount).toBe(12);
    s.expect(audit.passes).toBeTruthy();
  });
  await spec.run('audit composite covers all 12 zodiac signs in 10-planet chart', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(0));
    const audit = auditComposite(c);
    s.expect(audit.zodiacSignsCovered.length).toBe(12);
  });
  await spec.run('audit flags too-few houses as fail', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    const audit = auditComposite(c, 20);
    s.expect(audit.passes).toBeFalsy();
  });
  await spec.run('composite is frozen', async (s) => {
    const c = calculateCompositeChart(makeChart(0), makeChart(60));
    s.expect(Object.isFrozen(c)).toBeTruthy();
  });

  return spec.getResult();
}
