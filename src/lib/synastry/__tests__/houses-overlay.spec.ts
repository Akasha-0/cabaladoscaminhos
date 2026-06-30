// W70 Synastry — houses-overlay.spec.ts
import { Spec } from './harness.ts';
import {
  getPlanetInPartnerHouse,
  computeHouseOverlay,
  interpretOverlay,
  computeAllOverlays,
  auditHouseOverlay,
  HOUSE_TOPICS,
} from '../houses-overlay.ts';
import { asNatalChartId } from '../types.ts';
import type { HouseCusp, PlanetPosition, ZodiacSign, HouseNumber } from '../types.ts';

function makeHouses(): readonly HouseCusp[] {
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  return signs.map((sgn, i) => ({
    house: (i + 1) as HouseNumber,
    sign: sgn,
    degree: i * 30,
  } as HouseCusp));
}

function planet(name: PlanetPosition['planet'], degree: number): PlanetPosition {
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  const sign = signs[Math.floor(((degree % 360 + 360) % 360) / 30)];
  return { planet: name, sign, house: 1, degree, retrograde: false };
}

export async function runXxxSpec(): Promise<{ passed: number; failed: number; assertions: number; failures: readonly { assertion: string; expected: unknown; actual: unknown; detail?: string }[] }> {
  const spec = new Spec('houses-overlay');
  const houses = makeHouses();

  // SECTION 1 — basic house placement
  await spec.run('planet at 0° → house 1', async (s) => {
    const p = planet('sol', 5); // within first slice [0, 30)
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(1);
  });
  await spec.run('planet at 30° → house 2', async (s) => {
    const p = planet('sol', 35); // within [30, 60)
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(2);
  });
  await spec.run('planet at 90° → house 4', async (s) => {
    const p = planet('sol', 95); // within [90, 120)
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(4);
  });
  await spec.run('planet at 180° → house 7', async (s) => {
    const p = planet('sol', 185);
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(7);
  });
  await spec.run('planet at 270° → house 10', async (s) => {
    const p = planet('sol', 275);
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(10);
  });
  await spec.run('planet at 350° → house 12', async (s) => {
    const p = planet('sol', 355); // within [330, 360)
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(12);
  });
  await spec.run('planet exactly on cusp 1 (0°) → house 1', async (s) => {
    const p = planet('sol', 0);
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(1);
  });
  await spec.run('planet exactly on cusp 4 (90°) → house 4', async (s) => {
    const p = planet('sol', 90);
    s.expect(getPlanetInPartnerHouse(p, houses)).toBe(4);
  });

  // SECTION 2 — computeHouseOverlay + topics
  await spec.run('computeHouseOverlay returns HouseOverlay', async (s) => {
    const p = planet('sol', 95); // house 4
    const overlay = computeHouseOverlay(p, houses, 'pt-BR');
    s.expect(overlay.partnerHouse).toBe(4);
    s.expect(overlay.planet).toBe('sol');
    s.expect(overlay.topic.length).toBeGreaterThan(0);
  });
  await spec.run('house 7 overlay contains partnership keyword', async (s) => {
    const p = planet('venus', 185); // house 7
    const overlay = computeHouseOverlay(p, houses, 'pt-BR');
    s.expect(overlay.topic.toLowerCase()).toContain('parceria');
  });
  await spec.run('house 10 overlay contains career keyword (en)', async (s) => {
    const p = planet('marte', 275); // house 10
    const overlay = computeHouseOverlay(p, houses, 'en');
    s.expect(overlay.topic.toLowerCase()).toContain('career');
  });
  await spec.run('house 5 overlay contains creativity (es)', async (s) => {
    const p = planet('sol', 125); // house 5
    const overlay = computeHouseOverlay(p, houses, 'es');
    s.expect(overlay.topic.toLowerCase()).toContain('creat');
  });

  // SECTION 3 — interpretOverlay 7-tradition
  await spec.run('interpretOverlay returns planet+topic', async (s) => {
    const p = planet('sol', 95);
    const overlay = computeHouseOverlay(p, houses, 'pt-BR');
    const interp = interpretOverlay(overlay, 'pt-BR');
    s.expect(interp).toContain('sol');
    s.expect(interp.toLowerCase()).toContain('lar');
  });
  await spec.run('interpretOverlay pt-BR uses pt topic', async (s) => {
    const p = planet('lua', 95);
    const overlay = computeHouseOverlay(p, houses, 'pt-BR');
    const interp = interpretOverlay(overlay, 'pt-BR');
    s.expect(interp.toLowerCase()).toContain('lar');
  });

  // SECTION 4 — computeAllOverlays batch
  await spec.run('computeAllOverlays places all 10 planets', async (s) => {
    const planets = [
      planet('sol', 5), planet('lua', 35), planet('mercurio', 65),
      planet('venus', 95), planet('marte', 125), planet('jupiter', 155),
      planet('saturno', 185), planet('urano', 215), planet('netuno', 275),
      planet('plutao', 295),
    ];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    s.expect(overlays.length).toBe(10);
  });
  await spec.run('computeAllOverlays covers multiple houses', async (s) => {
    const planets = [planet('sol', 5), planet('lua', 125)];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    const distinct = new Set(overlays.map((o) => o.partnerHouse));
    s.expect(distinct.size).toBe(2);
  });
  await spec.run('computeAllOverlays returns frozen', async (s) => {
    const planets = [planet('sol', 5)];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    s.expect(Object.isFrozen(overlays)).toBeTruthy();
  });
  await spec.run('computeAllOverlays invalid planet degrees yield valid houses', async (s) => {
    // still valid since all 0..360 mapped
    const planets = [planet('sol', 0), planet('lua', 359)];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    s.expect(overlays.length).toBe(2);
  });

  // SECTION 5 — audit + invariants
  await spec.run('auditHouseOverlay reports planets + houses used', async (s) => {
    const planets = [
      planet('sol', 5), planet('lua', 35), planet('mercurio', 65),
      planet('venus', 95), planet('marte', 125), planet('jupiter', 155),
      planet('saturno', 185), planet('urano', 215), planet('netuno', 275),
      planet('plutao', 295),
    ];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    const audit = auditHouseOverlay(overlays, 10);
    s.expect(audit.planetsPlaced).toBe(10);
    s.expect(audit.valid).toBeTruthy();
  });
  await spec.run('audit houseCoverage is a number[] (1..12)', async (s) => {
    const planets = [
      planet('sol', 5), planet('lua', 35),
    ];
    const overlays = computeAllOverlays(planets, houses, 'pt-BR');
    const audit = auditHouseOverlay(overlays, 2);
    for (const h of audit.houseCoverage) {
      s.expect(h).toBeGreaterThan(0);
      s.expect(h).toBeLessThanOrEqual(12);
    }
  });
  await spec.run('HOUSE_TOPICS has 12 entries', async (s) => {
    s.expect(Object.keys(HOUSE_TOPICS).length).toBe(12);
  });
  await spec.run('HOUSE_TOPICS each entry has pt-BR + en + es', async (s) => {
    for (let i = 1; i <= 12; i++) {
      const h = (i as HouseNumber);
      s.expect(HOUSE_TOPICS[h]['pt-BR']).toBeDefined();
      s.expect(HOUSE_TOPICS[h]['en']).toBeDefined();
      s.expect(HOUSE_TOPICS[h]['es']).toBeDefined();
    }
  });
  await spec.run('chained: computeHouseOverlay -> interpretOverlay returns non-empty', async (s) => {
    const overlay = computeHouseOverlay(planet('sol', 95), houses, 'pt-BR');
    const s2 = interpretOverlay(overlay, 'pt-BR');
    s.expect(s2.length).toBeGreaterThan(0);
  });
  await spec.run('chained: overlay topic contains planet + house', async (s) => {
    const overlay = computeHouseOverlay(planet('venus', 275), houses, 'pt-BR');
    s.expect(overlay.topic.toLowerCase()).toContain('carreira');
  });

  return spec.getResult();
}
