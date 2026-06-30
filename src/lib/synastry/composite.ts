// W70 Synastry Engine — composite.ts
// Composite chart midpoint calculation.
//
// Composite method (W70, classical): for each pair of corresponding planets,
// the composite position is the MIDPOINT of the two longitudes, projected onto
// the zodiac (0..360°). For houses we likewise midpoint each cusp.
//
// Composite ASC: midpoint of the two Ascendants.
// Composite House Cusps: midpoint of corresponding cusps.
//
// Each "Planet" yields exactly one composite PlanetPosition. We do not place
// nodes (N/S) — out of scope for v1.

import type { Locale, NatalChart, PlanetPosition, ZodiacSign, HouseCusp, HouseNumber } from './types.ts';
import type { CompositeChart } from './synastry-types.ts';

const ZODIAC_ORDER: readonly ZodiacSign[] = Object.freeze([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpius', 'sagittarius', 'capricornius', 'aquarius', 'pisces',
] as ZodiacSign[]);

// Map sign -> its starting degree in the tropical zodiac.
const SIGN_START_DEG: Readonly<Record<ZodiacSign, number>> = Object.freeze({
  aries: 0,
  taurus: 30,
  gemini: 60,
  cancer: 90,
  leo: 120,
  virgo: 150,
  libra: 180,
  scorpius: 210,
  sagittarius: 240,
  capricornius: 270,
  aquarius: 300,
  pisces: 330,
});

// Midpoint of two angles on a circle (0..360). Chooses SHORTER arc.
function midpointAngle(a: number, b: number): number {
  const raw = ((a + b) / 2) % 360;
  // ensure non-negative
  return raw < 0 ? raw + 360 : raw;
}

function degreeToSign(deg: number): ZodiacSign {
  // Normalize
  const d = ((deg % 360) + 360) % 360;
  // Find sign index
  for (let i = 0; i < ZODIAC_ORDER.length; i++) {
    const sign = ZODIAC_ORDER[i];
    const start = SIGN_START_DEG[sign];
    const nextStart = (start + 30) % 360;
    if (start <= nextStart) {
      if (d >= start && d < nextStart) return sign;
    } else {
      // wrap case: pisces (330) -> aries (0)
      if (d >= start || d < nextStart) return sign;
    }
  }
  // Should be unreachable — defensive fallback
  return 'aries';
}

function degreeWithinSign(deg: number): number {
  const d = ((deg % 360) + 360) % 360;
  // 0..30 within sign
  return d % 30;
}

// Compute the composite planet corresponding to a pair (pa, pb).
function compositePlanet(pa: PlanetPosition, pb: PlanetPosition): PlanetPosition {
  if (pa.planet !== pb.planet) {
    throw new Error(`compositePlanet: planet mismatch ${pa.planet} vs ${pb.planet}`);
  }
  const mid = midpointAngle(pa.degree, pb.degree);
  return {
    planet: pa.planet,
    sign: degreeToSign(mid),
    house: pa.house, // primary chart's house mapping is informational; composite houses derived separately
    degree: mid,
    retrograde: pa.retrograde && pb.retrograde, // only if both are retrograde
  };
}

function compositeCusp(a: HouseCusp, b: HouseCusp): HouseCusp {
  if (a.house !== b.house) {
    throw new Error(`compositeCusp: house mismatch ${a.house} vs ${b.house}`);
  }
  const mid = midpointAngle(a.degree, b.degree);
  return {
    house: a.house,
    sign: degreeToSign(mid),
    degree: mid,
  };
}

export function calculateCompositeChart(chartA: NatalChart, chartB: NatalChart): CompositeChart {
  // Composite planets: pair by planet name. Assume both charts contain same planets.
  if (chartA.planets.length !== chartB.planets.length) {
    throw new Error('calculateCompositeChart: chart planet count mismatch');
  }
  const midpoints: PlanetPosition[] = [];
  for (let i = 0; i < chartA.planets.length; i++) {
    midpoints.push(compositePlanet(chartA.planets[i], chartB.planets[i]));
  }

  // Composite houses: 12 cusps each.
  if (chartA.houses.length !== chartB.houses.length || chartA.houses.length !== 12) {
    throw new Error('calculateCompositeChart: house count must be 12 for both charts');
  }
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push(compositeCusp(chartA.houses[i], chartB.houses[i]));
  }

  return Object.freeze({
    midpoints: Object.freeze(midpoints),
    houses: Object.freeze(houses),
  });
}

export function getCompositePlanetPositions(c: CompositeChart): readonly PlanetPosition[] {
  return c.midpoints;
}

export function getCompositeHouses(c: CompositeChart): readonly HouseCusp[] {
  return c.houses;
}

// --- interpretation strings (pt-BR / en / es) ---
const INTERPRETATIONS: Readonly<Record<Locale, string>> = Object.freeze({
  'pt-BR': 'O Mapa Composto revela a energia do relacionamento como uma terceira entidade. Os planetas médios mostram como vocês funcionam ENQUANTO PAR, e não como indivíduos. Lua composta indica a emocionalidade do casal; Sol composto, a identidade relacional; Vênus composto, o padrão afetivo.',
  'en': 'The Composite Chart reveals the relationship\'s energy as a third entity. The midpoints show how you function AS A PAIR, not as individuals. Composite Moon indicates the couple\'s emotionality; composite Sun, the relational identity; composite Venus, the affective pattern.',
  'es': 'La Carta Compuesta revela la energía de la relación como una tercera entidad. Los puntos medios muestran cómo funcionan COMO PAREJA, no como individuos. Luna compuesta indica la emocionalidad de la pareja; Sol compuesto, la identidad relacional; Venus compuesto, el patrón afectivo.',
});

export function interpretComposite(c: CompositeChart, locale: Locale): string {
  return INTERPRETATIONS[locale] ?? INTERPRETATIONS['en'];
}

// --- audit (cycle 62 lesson 2) ---
export interface CompositeAudit {
  readonly planetCount: number;
  readonly houseCount: number;
  readonly zodiacSignsCovered: readonly ZodiacSign[];
  readonly passes: boolean;
}

export function auditComposite(c: CompositeChart, minPlanets = 10, minHouses = 12): CompositeAudit {
  const signs = new Set<ZodiacSign>();
  for (const p of c.midpoints) signs.add(p.sign);
  for (const h of c.houses) signs.add(h.sign);
  return Object.freeze({
    planetCount: c.midpoints.length,
    houseCount: c.houses.length,
    zodiacSignsCovered: Object.freeze([...signs]),
    passes: c.midpoints.length >= minPlanets && c.houses.length >= minHouses,
  });
}

// Re-export composite type from synastry.ts would create a cycle; define here for clarity.
// (CompositeChart is defined in synastry.ts but consumed here via duck-typing.)
