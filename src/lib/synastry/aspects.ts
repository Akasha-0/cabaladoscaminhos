// W70 Synastry Engine — aspects.ts
// Planetary aspect calculation: conjunction/opposition/trine/square/sextile + minor + orb strength.
//
// AspectType set covers the 8 classical aspects used in synastry interpretation:
//   - MAJOR (5): conjunction (0°), opposition (180°), trine (120°), square (90°), sextile (60°)
//   - MINOR (3): quincunx (150°), semisquare (45°), sesquisquare (135°)
//
// Orb model (W70): each aspect has a default orb. Strength = max(0, 1 - |actual_orb| / default_orb).
// Harmonious vs challenging dichotomy is a classical synastry distinction:
//   - harmonious: conjunction, trine, sextile       (flow, ease)
//   - challenging: opposition, square, semisquare    (tension, growth)
//   - quincunx, sesquisquare: minor, ambiguous       (counted as neither in score)

import type { PlanetPosition } from './types.ts';

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisquare'
  | 'sesquisquare';

export interface Aspect {
  readonly planetA: string;
  readonly planetB: string;
  readonly type: AspectType;
  readonly orb: number;        // degrees of separation (0..max)
  readonly strength: number;   // 0..1, computed from orb ratio
  readonly harmonious: boolean;
  readonly challenging: boolean;
  readonly angleDeg: number;   // true absolute angle (0..180)
}

// Default orbs per aspect type (classical Ptolemaic values).
export const DEFAULT_ORBS: Readonly<Record<AspectType, number>> = Object.freeze({
  conjunction: 8,
  opposition: 7,
  trine: 7,
  square: 6,
  sextile: 5,
  quincunx: 3,
  semisquare: 3,
  sesquisquare: 3,
});

// Target angles (in degrees) for each aspect.
export const ASPECT_ANGLES: Readonly<Record<AspectType, number>> = Object.freeze({
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
  semisquare: 45,
  sesquisquare: 135,
});

const MAJOR_ASPECTS: readonly AspectType[] = Object.freeze([
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
]);

const MINOR_ASPECTS: readonly AspectType[] = Object.freeze([
  'quincunx',
  'semisquare',
  'sesquisquare',
]);

// --- lookup helpers ---
export function getMajorAspects(): readonly AspectType[] {
  return MAJOR_ASPECTS;
}

export function getMinorAspects(): readonly AspectType[] {
  return MINOR_ASPECTS;
}

// --- harmonic classification ---
export function isHarmonious(t: AspectType): boolean {
  return t === 'conjunction' || t === 'trine' || t === 'sextile';
}

export function isChallenging(t: AspectType): boolean {
  return t === 'opposition' || t === 'square' || t === 'semisquare';
}

// --- orb strength: 1.0 at exact, 0.0 at max orb ---
export function getAspectStrength(orb: number, type: AspectType): number {
  const maxOrb = DEFAULT_ORBS[type];
  if (!Number.isFinite(orb) || orb < 0) return 0;
  if (orb >= maxOrb) return 0;
  const strength = 1 - orb / maxOrb;
  // Clamp slightly above 1 is impossible, slightly below 0 is impossible; clamp anyway for safety.
  return Math.max(0, Math.min(1, strength));
}

// --- angle math: find absolute angular separation in [0, 180] ---
function angularSeparation(degA: number, degB: number): number {
  const raw = Math.abs(degA - degB) % 360;
  // wrap to [0, 180] — the angular distance on a circle
  const normalized = raw > 180 ? 360 - raw : raw;
  return normalized;
}

// --- find closest aspect between two planet positions ---
export function calculateAspect(planetA: PlanetPosition, planetB: PlanetPosition): Aspect | null {
  // Defensive: same planet cannot aspect itself
  if (planetA.planet === planetB.planet) return null;
  const angle = angularSeparation(planetA.degree, planetB.degree);

  let bestType: AspectType | null = null;
  let bestOrb = Infinity;
  for (const t of Object.keys(ASPECT_ANGLES) as AspectType[]) {
    const target = ASPECT_ANGLES[t];
    const orb = Math.abs(angle - target);
    if (orb <= DEFAULT_ORBS[t] && orb < bestOrb) {
      bestOrb = orb;
      bestType = t;
    }
  }

  if (bestType === null) return null;
  const strength = getAspectStrength(bestOrb, bestType);
  return {
    planetA: planetA.planet,
    planetB: planetB.planet,
    type: bestType,
    orb: bestOrb,
    strength,
    harmonious: isHarmonious(bestType),
    challenging: isChallenging(bestType),
    angleDeg: angle,
  };
}

// --- batch: pairwise aspects across two charts ---
export function calculateAllAspects(
  chartA: readonly PlanetPosition[],
  chartB: readonly PlanetPosition[],
): readonly Aspect[] {
  const aspects: Aspect[] = [];
  for (const pa of chartA) {
    for (const pb of chartB) {
      const a = calculateAspect(pa, pb);
      if (a !== null) aspects.push(a);
    }
  }
  return Object.freeze(aspects);
}

// --- audit helper (cycle 62 lesson 2 — exported inspectors) ---
export function auditAspectCatalog(): {
  majorCount: number;
  minorCount: number;
  harmoniousCount: number;
  challengingCount: number;
  orbs: Readonly<Record<AspectType, number>>;
} {
  const harmoniousCount = (Object.keys(ASPECT_ANGLES) as AspectType[]).filter(isHarmonious).length;
  const challengingCount = (Object.keys(ASPECT_ANGLES) as AspectType[]).filter(isChallenging).length;
  return {
    majorCount: MAJOR_ASPECTS.length,
    minorCount: MINOR_ASPECTS.length,
    harmoniousCount,
    challengingCount,
    orbs: DEFAULT_ORBS,
  };
}
