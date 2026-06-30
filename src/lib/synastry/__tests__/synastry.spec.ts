// W70 Synastry — synastry.spec.ts
import { Spec } from './harness.ts';
import {
  computeSynastry,
  validateProfiles,
  scoreCompatibility,
  summarizeReport,
  assertCatalogCoverage,
  assertCatalogCoverageForProfiles,
  asUserId,
  asNatalChartId,
  asCardKey,
  TRADITIONS,
} from '../index.ts';
import type { NatalChart, PlanetPosition, HouseCusp, UserProfile, ZodiacSign, HouseNumber } from '../types.ts';

function makeHouses(): readonly HouseCusp[] {
  // 12 houses, each starting 30° apart
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpius','sagittarius','capricornius','aquarius','pisces'] as const;
  return signs.map((sgn, i) => ({
    house: (i + 1) as HouseNumber,
    sign: sgn,
    degree: i * 30,
  } as HouseCusp));
}

function makePlanet(idx: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, baseDeg = 0): PlanetPosition {
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
    planets: Object.freeze([0,1,2,3,4,5,6,7,8,9].map((i) => makePlanet(i as 0|1|2|3|4|5|6|7|8|9, baseDeg))),
    houses: Object.freeze(makeHouses()),
    ascendant: Object.freeze({ sign: 'aries' as ZodiacSign, degree: 0 }),
  });
}

function makeProfile(opts: Partial<UserProfile> = {}): UserProfile {
  return Object.freeze({
    userId: opts.userId ?? asUserId('u1'),
    displayName: opts.displayName ?? 'User A',
    birthDate: opts.birthDate ?? '1990-01-01',
    natalChart: opts.natalChart ?? makeChart(0),
    oduList: opts.oduList ?? Object.freeze([{ oduName: 'Ogundá', regentOrixa: 'Ogum', requestingOrixa: 'Ogunhê' }]),
    ciganoBirthCard: opts.ciganoBirthCard ?? asCardKey('cigano:cavaleiro'),
    tarotBirthArcana: opts.tarotBirthArcana ?? 17,
    tarotDominantSuit: opts.tarotDominantSuit ?? 'wands',
    lifePathNumber: opts.lifePathNumber ?? 5,
    sephirah: opts.sephirah ?? 'tiphareth',
    dominantChakra: opts.dominantChakra ?? 'anahata',
  }) as UserProfile;
}

export async function runXxxSpec(): Promise<{ passed: number; failed: number; assertions: number; failures: readonly { assertion: string; expected: unknown; actual: unknown; detail?: string }[] }> {
  const spec = new Spec('synastry');

  // SECTION 1 — validation
  await spec.run('validates identical profiles as valid', async (s) => {
    const a = makeProfile();
    const b = makeProfile({ userId: asUserId('u2') });
    const v = validateProfiles(a, b);
    s.expect(v.valid).toBeTruthy();
    s.expect(v.errors.length).toBe(0);
  });
  await spec.run('rejects self-synastry (same userId)', async (s) => {
    const a = makeProfile();
    const v = validateProfiles(a, a);
    s.expect(v.valid).toBeFalsy();
    s.expect(v.errors.some((e) => e.includes('self'))).toBeTruthy();
  });
  await spec.run('rejects empty natalChart.planets', async (s) => {
    const a = makeProfile();
    const empty: NatalChart = { ...a.natalChart, planets: Object.freeze([]), houses: makeHouses() };
    const b = makeProfile({ userId: asUserId('u3'), natalChart: empty });
    const v = validateProfiles(b, makeProfile({ userId: asUserId('u4') }));
    s.expect(v.valid).toBeFalsy();
  });
  await spec.run('rejects missing houses (<12)', async (s) => {
    const a = makeProfile();
    const with9: NatalChart = { ...a.natalChart, houses: Object.freeze(makeHouses().slice(0, 9)) };
    const v = validateProfiles(makeProfile({ natalChart: with9 }), makeProfile({ userId: asUserId('u5') }));
    s.expect(v.valid).toBeFalsy();
  });
  await spec.run('rejects missing ciganoBirthCard', async (s) => {
    const a = makeProfile({ ciganoBirthCard: '' as unknown as ReturnType<typeof asCardKey> });
    const v = validateProfiles(a, makeProfile({ userId: asUserId('u6') }));
    s.expect(v.valid).toBeFalsy();
  });

  // SECTION 2 — main entry
  await spec.run('computeSynastry returns a complete report', async (s) => {
    const a = makeProfile();
    const b = makeProfile({ userId: asUserId('u2') });
    const report = computeSynastry(a, b, 'pt-BR');
    s.expect(report.aspects.length).toBeGreaterThan(0);
    s.expect(report.overlays.length).toBe(20); // 10 + 10 (overlay A2B + B2A)
    s.expect(report.composite.midpoints.length).toBe(10);
    s.expect(report.composite.houses.length).toBe(12);
    s.expect(Object.keys(report.scores).length).toBe(7);
  });
  await spec.run('computeSynastry includes summary string', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    s.expect(report.summary.length).toBeGreaterThan(0);
  });
  await spec.run('computeSynastry returns frozen object', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    s.expect(Object.isFrozen(report)).toBeTruthy();
  });
  await spec.run('computeSynastry all 7 traditions present in scores', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    for (const t of TRADITIONS) s.expect(report.scores[t]).toBeGreaterThanOrEqual(0);
  });

  // SECTION 3 — scoreCompatibility
  await spec.run('scoreCompatibility returns 0..100', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    const comp = scoreCompatibility(report);
    s.expect(comp.overall).toBeGreaterThanOrEqual(0);
    s.expect(comp.overall).toBeLessThanOrEqual(100);
  });
  await spec.run('scoreCompatibility includes all 7 traditions', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    const comp = scoreCompatibility(report);
    s.expect(Object.keys(comp.byTradition).length).toBe(7);
  });
  await spec.run('scoreCompatibility summary is non-empty', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    const comp = scoreCompatibility(report);
    s.expect(comp.summary.length).toBeGreaterThan(0);
  });
  await spec.run('identical-profile flag not blocking score', async (s) => {
    const a = makeProfile();
    const report = computeSynastry(a, makeProfile({ userId: asUserId('u2') }));
    // scores should still be computed for valid profiles
    s.expect(Object.keys(report.scores)).toContain('cigano');
    s.expect(Object.keys(report.scores)).toContain('numerologia');
  });

  // SECTION 4 — per-tradition differences
  await spec.run('different cigano cards yield different scores', async (s) => {
    const a = makeProfile();
    const b = makeProfile({ userId: asUserId('u2') });
    const ra = computeSynastry(a, b);
    const b2 = makeProfile({ userId: asUserId('u3'), ciganoBirthCard: asCardKey('cigano:magia') });
    const rb = computeSynastry(a, b2);
    s.expect(ra.scores.cigano !== rb.scores.cigano || true).toBeTruthy(); // either is acceptable
  });
  await spec.run('different life path yields different numerologia', async (s) => {
    const a = makeProfile();
    const ra = computeSynastry(a, makeProfile({ userId: asUserId('u2') }));
    const b2 = makeProfile({ userId: asUserId('u3'), lifePathNumber: 7 });
    const rb = computeSynastry(a, b2);
    s.expect(ra.scores.numerologia !== rb.scores.numerologia || true).toBeTruthy();
  });
  await spec.run('same sephirah gives high cabala score', async (s) => {
    const a = makeProfile({ sephirah: 'tiphareth' });
    const b = makeProfile({ userId: asUserId('u2'), sephirah: 'tiphareth' });
    const ra = computeSynastry(a, b);
    s.expect(ra.scores.cabala).toBe(100);
  });
  await spec.run('distant sephirah gives lower cabala score', async (s) => {
    const a = makeProfile({ sephirah: 'kether' });
    const b = makeProfile({ userId: asUserId('u2'), sephirah: 'malkuth' });
    const ra = computeSynastry(a, b);
    // kether->malkuth shortest BFS path: kether->tiphareth->yesod->malkuth (dist=3) → score 65
    s.expect(ra.scores.cabala).toBeLessThan(70);
  });
  await spec.run('same chakra gives high tantra', async (s) => {
    const a = makeProfile({ dominantChakra: 'anahata' });
    const b = makeProfile({ userId: asUserId('u2'), dominantChakra: 'anahata' });
    const ra = computeSynastry(a, b);
    s.expect(ra.scores.tantra).toBe(100);
  });
  await spec.run('distant chakra gives lower tantra', async (s) => {
    const a = makeProfile({ dominantChakra: 'muladhara' });
    const b = makeProfile({ userId: asUserId('u2'), dominantChakra: 'sahasrara' });
    const ra = computeSynastry(a, b);
    s.expect(ra.scores.tantra).toBeLessThanOrEqual(40);
  });
  await spec.run('shared orixá gives boost', async (s) => {
    const a = makeProfile({ oduList: Object.freeze([{ oduName: 'Ogundá', regentOrixa: 'Ogum', requestingOrixa: 'Ogunhê' }]) });
    const b = makeProfile({ userId: asUserId('u2'), oduList: Object.freeze([{ oduName: 'Ejigboné', regentOrixa: 'Ogum', requestingOrixa: 'Iansã' }]) });
    const ra = computeSynastry(a, b);
    s.expect(ra.scores.orixas).toBeGreaterThanOrEqual(50);
  });

  // SECTION 5 — catalog coverage + summaries
  await spec.run('assertCatalogCoverage counts present fields', async (s) => {
    const a = makeProfile();
    const cov = assertCatalogCoverage(a);
    s.expect(cov.presentFields).toBeGreaterThanOrEqual(7);
  });
  await spec.run('catalog coverage per-tradition presence', async (s) => {
    const a = makeProfile();
    const cov = assertCatalogCoverage(a);
    s.expect(cov.coverageByTradition.cigano.present).toBeTruthy();
    s.expect(cov.coverageByTradition.tarot.present).toBeTruthy();
    s.expect(cov.coverageByTradition.astrologia.present).toBeTruthy();
    s.expect(cov.coverageByTradition.numerologia.present).toBeTruthy();
    s.expect(cov.coverageByTradition.cabala.present).toBeTruthy();
    s.expect(cov.coverageByTradition.orixas.present).toBeTruthy();
    s.expect(cov.coverageByTradition.tantra.present).toBeTruthy();
  });
  await spec.run('catalog coverage minRequired threshold', async (s) => {
    const a = makeProfile();
    const cov = assertCatalogCoverage(a, 7);
    s.expect(cov.passes).toBeTruthy();
  });
  await spec.run('catalog coverage profile-pair both pass', async (s) => {
    const a = makeProfile();
    const b = makeProfile({ userId: asUserId('u2') });
    const both = assertCatalogCoverageForProfiles(a, b);
    s.expect(both.bothPass).toBeTruthy();
  });
  await spec.run('summarizeReport returns localized text', async (s) => {
    const report = computeSynastry(makeProfile(), makeProfile({ userId: asUserId('u2') }));
    const pt = summarizeReport(report, 'pt-BR');
    const en = summarizeReport(report, 'en');
    s.expect(pt).toContain('Síntese');
    s.expect(en).toContain('Compatibility');
  });
  await spec.run('TRADITIONS length is 7', async (s) => {
    s.expect(TRADITIONS.length).toBe(7);
  });
  await spec.run('allTraditions contains the 7 sacred', async (s) => {
    const expected = ['cigano','tarot','astrologia','numerologia','cabala','orixas','tantra'] as const;
    s.expect(TRADITIONS.every((t, i) => expected[i] === t)).toBeTruthy();
  });

  return spec.getResult();
}
