// W70 Synastry Engine — synastry.ts (main entry).
// computeSynastry(userA, userB) -> SynastryReport
//
// Pipeline:
//   1. validateProfiles(userA, userB) -> ValidationResult
//   2. aspects       = calculateAllAspects(userA.natalChart.planets, userB.natalChart.planets)
//   3. overlaysA2B   = computeAllOverlays(userA.natalChart.planets, userB.natalChart.houses)
//   4. overlaysB2A   = computeAllOverlays(userB.natalChart.planets, userA.natalChart.houses)
//   5. composite     = calculateCompositeChart(userA.natalChart, userB.natalChart)
//   6. scores        = computeTraditionalScores(...)  — 7 traditions
//   7. SynastryReport = { aspects, overlays, composite, scores, summary }
//
// "CompatibilityScore" 0..100 per tradition PLUS an overall weighted score.
// Per-tradition heuristics (W70):
//   - cigano:       card-rank alignment + odu compatibility (5-point closeness)
//   - tarot:        arcana difference (lower = better), suit complementarity
//   - astrologia:   #harmonious aspects vs #challenging aspects, weighted by strength
//   - numerologia:  life-path modulo (1-4 → high; 5-9 → mid; 11/22 → compatibility boost)
//   - cabala:       sephirah tree distance (shorter path = higher)
//   - orixas:       regentOrixa match (same = strong; kin = moderate)
//   - tantra:       chakra distance (consecutive = high; non-adjacent = medium)
//
// All functions pure. No external IO.

import { calculateAllAspects } from './aspects.ts';
import { computeAllOverlays, getPlanetInPartnerHouse, HOUSE_TOPICS } from './houses-overlay.ts';
import { calculateCompositeChart } from './composite.ts';
import type {
  CompatibilityScore,
  HouseOverlay,
  SynastryReport,
  ValidationResult,
} from './synastry-types.ts';

import type {
  CardKey,
  Chakra,
  HouseCusp,
  HouseNumber,
  Locale,
  PlanetPosition,
  Sephirah,
  Tradition,
  UserProfile,
} from './types.ts';
import { TRADITIONS, assertCatalogCoverage } from './types.ts';

export type { CompositeChart } from './synastry-types.ts';

// --- validation ---
export function validateProfiles(userA: UserProfile, userB: UserProfile): ValidationResult {
  const errors: string[] = [];
  if (!userA.natalChart || userA.natalChart.planets.length === 0) {
    errors.push('userA.natalChart.planets must be non-empty');
  }
  if (!userB.natalChart || userB.natalChart.planets.length === 0) {
    errors.push('userB.natalChart.planets must be non-empty');
  }
  if (userA.natalChart.houses.length !== 12) {
    errors.push(`userA.natalChart.houses must have 12 cusps (got ${userA.natalChart.houses.length})`);
  }
  if (userB.natalChart.houses.length !== 12) {
    errors.push(`userB.natalChart.houses must have 12 cusps (got ${userB.natalChart.houses.length})`);
  }
  if (!userA.ciganoBirthCard) errors.push('userA.ciganoBirthCard missing');
  if (!userB.ciganoBirthCard) errors.push('userB.ciganoBirthCard missing');
  if (userA.userId === userB.userId) errors.push('cannot compute synastry with self');
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

// --- per-tradition compatibility (0..100) ---

// Cigano: birth-card distance in 28-card deck (cycle 67 cancer-key formula).
// For W70 we accept that each CardKey is `${tradition}:${name}` and parse numeric tail.
// In practice: closer = more harmonious.
function scoreCigano(a: UserProfile, b: UserProfile): number {
  // Parse position from card key like "cigano:cavaleiro". We rank via a simple modulo: distance mod 28.
  // Without a complete deck table we approximate using shared-card-keys fallback.
  const distance = Math.abs(hash(a.ciganoBirthCard) - hash(b.ciganoBirthCard)) % 28;
  const closeness = 1 - distance / 27;
  return Math.round(closeness * 100);
}

// Tarot: arcana difference + suit complementarity.
function scoreTarot(a: UserProfile, b: UserProfile): number {
  const arcDiff = Math.abs(a.tarotBirthArcana - b.tarotBirthArcana);
  // 0 = identical (90), 21 = far (10)
  let arcScore = 90 - (arcDiff / 21) * 80;
  let suitBoost = 0;
  if (a.tarotDominantSuit === b.tarotDominantSuit) suitBoost = -10;
  else if (suitComplement(a.tarotDominantSuit, b.tarotDominantSuit)) suitBoost = 10;
  return Math.max(0, Math.min(100, Math.round(arcScore + suitBoost)));
}

function suitComplement(a: UserProfile['tarotDominantSuit'], b: UserProfile['tarotDominantSuit']): boolean {
  // Complement pairs by symbol opposition (fire<->water, air<->earth)
  // For tarot suits: wands=fire, cups=water, swords=air, pentacles=earth.
  const pairs: Readonly<Array<readonly [UserProfile['tarotDominantSuit'], UserProfile['tarotDominantSuit']]>> = Object.freeze([
    ['wands', 'cups'], ['swords', 'pentacles'],
  ] as const);

  for (const pair of pairs) {
    if ((pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)) {
      return true;
    }
  }
  return false;
}

// Astrologia: harmonic/challenging aspect ratio.
function scoreAstrologia(report: SynastryReport): number {
  let harmoniousScore = 0;
  let challengingScore = 0;
  let totalAspects = 0;
  for (const a of report.aspects) {
    totalAspects++;
    if (a.harmonious) harmoniousScore += a.strength;
    if (a.challenging) challengingScore += a.strength * 0.7; // challenges contribute but with discount
  }
  if (totalAspects === 0) return 50; // neutral
  const raw = (harmoniousScore - challengingScore) / totalAspects;
  return Math.max(0, Math.min(100, Math.round(50 + raw * 50)));
}

// Numerologia: life-path sum commonalities.
function scoreNumerologia(a: UserProfile, b: UserProfile): number {
  const na = a.lifePathNumber;
  const nb = b.lifePathNumber;
  const diff = Math.abs(numValue(na) - numValue(nb));
  // Same number = 80 (identity), master number combo (11/22/33) = +20
  const base = Math.max(0, 80 - diff * 8);
  let boost = 0;
  if (isMaster(nb) && isMaster(na)) boost = 20;
  else if (na === nb) boost = 10;
  return Math.min(100, base + boost);
}

function numValue(n: number): number {
  // Master numbers reduced by frequency only
  if (n === 11 || n === 22 || n === 33) return n;
  return n % 9 === 0 ? 9 : n % 9;
}

function isMaster(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

// Cabala: sephirah tree distance on the Kabbalistic Tree of Life.
const SEPHIROT_TREE: Readonly<Record<Sephirah, readonly Sephirah[]>> = Object.freeze({
  kether:   ['chokmah', 'binah', 'tiphareth'],
  chokmah:  ['kether', 'binah', 'chesed'],
  binah:    ['kether', 'chokmah', 'geburah', 'tiphareth'],
  chesed:   ['chokmah', 'geburah', 'netzach'],
  geburah:  ['binah', 'chesed', 'hod'],
  tiphareth: ['kether', 'binah', 'chesed', 'geburah', 'netzach', 'hod', 'yesod'],
  netzach:  ['chesed', 'tiphareth', 'hod'],
  hod:      ['geburah', 'tiphareth', 'netzach', 'yesod'],
  yesod:    ['tiphareth', 'hod', 'malkuth'],
  malkuth:  ['yesod'],
} as Record<Sephirah, readonly Sephirah[]>);

function sephirahDistance(a: Sephirah, b: Sephirah): number {
  if (a === b) return 0;
  const visited = new Set<Sephirah>();
  const queue: Array<[Sephirah, number]> = [[a, 0]];
  visited.add(a);
  while (queue.length > 0) {
    const [node, dist] = queue.shift()!;
    const neighbors = SEPHIROT_TREE[node];
    for (const n of neighbors) {
      if (n === b) return dist + 1;
      if (!visited.has(n)) {
        visited.add(n);
        queue.push([n, dist + 1]);
      }
    }
  }
  return 99; // disconnected (should not occur in our 10-Sephirah tree)
}

function scoreCabala(a: UserProfile, b: UserProfile): number {
  const dist = sephirahDistance(a.sephirah, b.sephirah);
  // 0 = 100, 1 = 90, 2 = 80, 3 = 65, 4 = 50; 5+ = 35
  const table: Readonly<Record<number, number>> = Object.freeze({
    0: 100, 1: 90, 2: 80, 3: 65, 4: 50, 5: 40, 6: 35, 7: 30,
  });
  return table[dist] ?? 25;
}

// Orixás: regent-orixá shared?
function scoreOrixas(a: UserProfile, b: UserProfile): number {
  if (a.oduList.length === 0 || b.oduList.length === 0) return 50;
  const regA = new Set(a.oduList.map((o) => o.regentOrixa.toLowerCase()));
  const regB = new Set(b.oduList.map((o) => o.regentOrixa.toLowerCase()));
  let shared = 0;
  for (const r of regA) if (regB.has(r)) shared++;
  // Also check requesting orixas overlap (kinetic)
  const reqA = new Set(a.oduList.map((o) => o.requestingOrixa.toLowerCase()));
  const reqB = new Set(b.oduList.map((o) => o.requestingOrixa.toLowerCase()));
  let sharedReq = 0;
  for (const r of reqA) if (reqB.has(r)) sharedReq++;
  const base = 50 + shared * 15 + sharedReq * 10;
  return Math.min(100, base);
}

// Tantra: chakra distance on 7-level column.
const CHAKRA_ORDER: readonly Chakra[] = Object.freeze([
  'muladhara', 'svadhisthana', 'manipura', 'anahata',
  'vishuddha', 'ajna', 'sahasrara',
] as Chakra[]);

function scoreTantra(a: UserProfile, b: UserProfile): number {
  const ia = CHAKRA_ORDER.indexOf(a.dominantChakra);
  const ib = CHAKRA_ORDER.indexOf(b.dominantChakra);
  if (ia === -1 || ib === -1) return 50;
  const dist = Math.abs(ia - ib);
  // 0 = 100 (same), 1 = 90, 2 = 75, 3 = 60, 4 = 45, 5 = 35, 6 = 30
  const table: Readonly<Record<number, number>> = Object.freeze({
    0: 100, 1: 90, 2: 75, 3: 60, 4: 45, 5: 35, 6: 30,
  });
  return table[dist] ?? 25;
}

// --- public scoring entry ---
export function scoreCompatibility(report: SynastryReport): CompatibilityScore {
  const byTradition: Record<Tradition, number> = {} as Record<Tradition, number>;
  // Always include all 7 traditions; use the report's pre-computed scores if present,
  // else re-derive astrologia from aspects (other traditions can't be re-derived
  // without profiles).
  const hasScores = Object.keys(report.scores).length === TRADITIONS.length;
  if (hasScores) {
    for (const t of TRADITIONS) {
      byTradition[t] = report.scores[t];
    }
  } else {
    for (const t of TRADITIONS) {
      byTradition[t] = 50; // default neutral
    }
    byTradition['astrologia'] = scoreAstrologia(report);
  }
  const vals = Object.values(byTradition);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const lowest = vals.reduce((min, v) => (v < min ? v : min), 100);
  const highest = vals.reduce((max, v) => (v > max ? v : max), 0);
  const summary = `Overall ${overall}/100 (range ${lowest}–${highest})`;
  return Object.freeze({
    overall,
    byTradition: Object.freeze(byTradition),
    summary,
  });
}

// --- main entry ---
export function computeSynastry(
  userA: UserProfile,
  userB: UserProfile,
  locale: Locale = 'pt-BR',
): SynastryReport {
  const validation = validateProfiles(userA, userB);
  if (!validation.valid) {
    throw new Error(`computeSynastry: invalid profiles: ${validation.errors.join('; ')}`);
  }
  const aspects = calculateAllAspects(userA.natalChart.planets, userB.natalChart.planets);
  const overlaysA2B = computeAllOverlays(userA.natalChart.planets, userB.natalChart.houses, locale);
  const overlaysB2A = computeAllOverlays(userB.natalChart.planets, userA.natalChart.houses, locale);
  const composite = calculateCompositeChart(userA.natalChart, userB.natalChart);

  // Per-tradition scores
  const perTradition: Record<Tradition, number> = {} as Record<Tradition, number>;
  perTradition['cigano'] = scoreCigano(userA, userB);
  perTradition['tarot'] = scoreTarot(userA, userB);
  perTradition['astrologia'] = 50; // placeholder, replaced below
  perTradition['numerologia'] = scoreNumerologia(userA, userB);
  perTradition['cabala'] = scoreCabala(userA, userB);
  perTradition['orixas'] = scoreOrixas(userA, userB);
  perTradition['tantra'] = scoreTantra(userA, userB);

  // Build a stub report to pass to scoreAstrologia (it reads .aspects)
  const stub: SynastryReport = Object.freeze({
    aspects,
    overlays: Object.freeze([...overlaysA2B, ...overlaysB2A]),
    composite,
    scores: Object.freeze({} as Record<Tradition, number>),
    summary: '',
  }) as SynastryReport;

  perTradition['astrologia'] = scoreAstrologia(stub);

  const report: SynastryReport = Object.freeze({
    aspects,
    overlays: Object.freeze([...overlaysA2B, ...overlaysB2A]),
    composite,
    scores: Object.freeze({ ...perTradition }),
    summary: summarizeInternal(perTradition),
  });

  return report;
}

function summarizeInternal(perTradition: Record<Tradition, number>): string {
  const vals = Object.values(perTradition);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return `Compatibilidade geral: ${overall}/100 — tradiciones cobertas: ${TRADITIONS.length}`;
}

export function summarizeReport(report: SynastryReport, locale: Locale = 'pt-BR'): string {
  const overall = Math.round(
    Object.values(report.scores).reduce((a, b) => a + b, 0) / Object.values(report.scores).length,
  );
  const parts: string[] = [];
  for (const t of TRADITIONS) {
    parts.push(`${t}=${report.scores[t]}`);
  }
  const phrases: Readonly<Record<Locale, string>> = Object.freeze({
    'pt-BR': `Síntese da compatibilidade (média ${overall}/100). `,
    'en': `Compatibility synthesis (average ${overall}/100). `,
    'es': `Síntesis de compatibilidad (promedio ${overall}/100). `,
  });
  return phrases[locale] + parts.join(', ');
}

export function assertCatalogCoverageForProfiles(
  userA: UserProfile,
  userB: UserProfile,
  minRequired = 7,
) {
  // Sanity-check BOTH profiles are 7-tradition-complete.
  const covA = assertCatalogCoverage(userA, minRequired);
  const covB = assertCatalogCoverage(userB, minRequired);
  return { covA, covB, bothPass: covA.passes && covB.passes };
}

// --- small utility: stable string hash (FNV-1a 32-bit) ---
function hash(s: CardKey | string): number {
  let h = 0x811c9dc5;
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Re-export types for downstream consumers.
export type { CompatibilityScore, HouseOverlay, SynastryReport, ValidationResult } from './synastry-types.ts';
export type { Aspect, AspectType } from './aspects.ts';

// Re-export the rest of the public surface so index.ts can pick everything up via synastry.ts.
export {
  calculateAspect,
  calculateAllAspects,
  getMajorAspects,
  getMinorAspects,
  isHarmonious,
  isChallenging,
  getAspectStrength,
  auditAspectCatalog,
} from './aspects.ts';

export {
  getPlanetInPartnerHouse,
  interpretOverlay,
  computeHouseOverlay,
  computeAllOverlays,
  auditHouseOverlay,
} from './houses-overlay.ts';

export {
  calculateCompositeChart,
  getCompositePlanetPositions,
  getCompositeHouses,
  interpretComposite,
  auditComposite,
} from './composite.ts';

export { TRADITIONS, assertCatalogCoverage, asUserId, asNatalChartId, asCardKey } from './types.ts';

// Helper: planet-in-house via simple logic (exposed for callers that pre-cached cusps).
export function _planetInPartnerHouseForCaller(
  planet: PlanetPosition,
  cusps: readonly HouseCusp[],
): HouseNumber {
  return getPlanetInPartnerHouse(planet, cusps);
}

// HOUSE_TOPICS re-exposed so index.ts can import once.
export const _HOUSE_TOPICS = HOUSE_TOPICS;
export const _USER_PROFILE_TYPE_PING = null as unknown as UserProfile;

// Suppress unused-import warning.
export const _CHAKRA_PING = null as unknown as Chakra;
