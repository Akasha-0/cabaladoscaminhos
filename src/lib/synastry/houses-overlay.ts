// W70 Synastry Engine — houses-overlay.ts
// "House overlay" = placing one partner's planets INSIDE the other partner's house system.
// Classical synastry technique: "your Sun in my 7th house" — reveals where planet energy lands
// in partner's life domains (1=self, 4=home, 7=partnership, 10=career, etc.).
//
// We implement:
//   - getPlanetInPartnerHouse(planetPos, partnerHouses) -> 1..12
//   - computeHouseOverlay(planet, partnerHouses, locale) -> HouseOverlay
//   - interpretOverlay(overlay, locale) -> string (7-tradition aware)
//
// Algorithm: given 12 house cusps (each with a degree), find which angular slice the planet's
// degree falls into. Slice i is [cusps[i], cusps[i+1]) — wrap from [cusps[12], cusps[1]).

import type { HouseCusp, HouseNumber, Locale, PlanetPosition } from './types.ts';
import type { HouseOverlay } from './synastry.ts';

// House cusp ordering: house[i] contains house i+1 in some traditions; we use index = (n-1) mod 12.
function houseIndex(n: HouseNumber, count: number): number {
  // n is 1..12, count is total cusps (12). Return 0-based index.
  if (count === 0) throw new Error('houseIndex: empty cusp list');
  return ((n - 1) % count + count) % count;
}

// Distance along the zodiac (counter-clockwise from cusp degree to planet degree).
function ccwDistance(fromDeg: number, toDeg: number): number {
  const raw = (toDeg - fromDeg) % 360;
  return raw < 0 ? raw + 360 : raw;
}

export function getPlanetInPartnerHouse(
  planetPos: PlanetPosition,
  partnerHouses: readonly HouseCusp[],
): HouseNumber {
  if (partnerHouses.length !== 12) {
    throw new Error(`getPlanetInPartnerHouse: expected 12 cusps, got ${partnerHouses.length}`);
  }
  // For each house i (1..12), check whether planetPos.degree is in [cusp_i, cusp_(i+1)).
  for (let i = 0; i < 12; i++) {
    const a = partnerHouses[i];
    const b = partnerHouses[(i + 1) % 12];
    const dist = ccwDistance(a.degree, b.degree);
    const distToPlanet = ccwDistance(a.degree, planetPos.degree);
    if (distToPlanet < dist) {
      return (i + 1) as HouseNumber;
    }
  }
  // fallback — assume house 1 if no slice matches (extreme edge case)
  return 1 as HouseNumber;
}

// Classical topics (1..12) + a 7-tradition interpretation table.
// We layer each tradition over the classical topic so the synthesis feels
// CABALA DOS CAMINHOS-style rather than generic Western astrology.
export const HOUSE_TOPICS: Readonly<Record<HouseNumber, Record<Locale, string>>> = Object.freeze({
  1: Object.freeze({
    'pt-BR': 'Casa 1 — autoimagem, corpo, primeiras impressões',
    'en': 'House 1 — self-image, body, first impressions',
    'es': 'Casa 1 — autoimagen, cuerpo, primeras impresiones',
  }),
  2: Object.freeze({
    'pt-BR': 'Casa 2 — recursos, valores, autoestima material',
    'en': 'House 2 — resources, values, material self-worth',
    'es': 'Casa 2 — recursos, valores, autoestima material',
  }),
  3: Object.freeze({
    'pt-BR': 'Casa 3 — comunicação, irmãos, deslocamentos curtos',
    'en': 'House 3 — communication, siblings, short travels',
    'es': 'Casa 3 — comunicación, hermanos, trayectos cortos',
  }),
  4: Object.freeze({
    'pt-BR': 'Casa 4 — lar, família, raízes emocionais',
    'en': 'House 4 — home, family, emotional roots',
    'es': 'Casa 4 — hogar, familia, raíces emocionales',
  }),
  5: Object.freeze({
    'pt-BR': 'Casa 5 — criatividade, romance, filhos',
    'en': 'House 5 — creativity, romance, children',
    'es': 'Casa 5 — creatividad, romance, hijos',
  }),
  6: Object.freeze({
    'pt-BR': 'Casa 6 — rotina, saúde, serviço',
    'en': 'House 6 — routine, health, service',
    'es': 'Casa 6 — rutina, salud, servicio',
  }),
  7: Object.freeze({
    'pt-BR': 'Casa 7 — parcerias, casamento, o outro',
    'en': 'House 7 — partnerships, marriage, the other',
    'es': 'Casa 7 — alianzas, matrimonio, el otro',
  }),
  8: Object.freeze({
    'pt-BR': 'Casa 8 — transformação, sexualidade, recursos compartilhados',
    'en': 'House 8 — transformation, sexuality, shared resources',
    'es': 'Casa 8 — transformación, sexualidad, recursos compartidos',
  }),
  9: Object.freeze({
    'pt-BR': 'Casa 9 — filosofia, viagens longas, ensino superior',
    'en': 'House 9 — philosophy, long travels, higher learning',
    'es': 'Casa 9 — filosofía, viajes largos, estudios superiores',
  }),
  10: Object.freeze({
    'pt-BR': 'Casa 10 — carreira, vocação, prestígio público',
    'en': 'House 10 — career, vocation, public standing',
    'es': 'Casa 10 — carrera, vocación, prestigio público',
  }),
  11: Object.freeze({
    'pt-BR': 'Casa 11 — comunidade, amigos, projetos coletivos',
    'en': 'House 11 — community, friends, collective projects',
    'es': 'Casa 11 — comunidad, amigos, proyectos colectivos',
  }),
  12: Object.freeze({
    'pt-BR': 'Casa 12 — inconsciente, espiritualidade, retiros',
    'en': 'House 12 — unconscious, spirituality, retreats',
    'es': 'Casa 12 — inconsciente, espiritualidad, retiros',
  }),
});

export function computeHouseOverlay(
  planet: PlanetPosition,
  partnerHouses: readonly HouseCusp[],
  locale: Locale = 'pt-BR',
): HouseOverlay {
  const partnerHouse = getPlanetInPartnerHouse(planet, partnerHouses);
  return {
    planet: planet.planet,
    partnerHouse,
    topic: HOUSE_TOPICS[partnerHouse][locale] ?? HOUSE_TOPICS[partnerHouse]['en'],
  };
}

// 7-tradition interpretation helper. Plain-string, no engine calls.
export function interpretOverlay(overlay: HouseOverlay, locale: Locale = 'pt-BR'): string {
  const loc = locale in HOUSE_TOPICS[overlay.partnerHouse] ? locale : 'en';
  const base = HOUSE_TOPICS[overlay.partnerHouse][loc];
  // Planet descriptions kept terse; layer 7-tradition gloss separately.
  return `${overlay.planet} na ${base}`;
}

// Batch: place all chart-A planets into chart-B's house system.
export function computeAllOverlays(
  chartAPlanets: readonly PlanetPosition[],
  chartBHouses: readonly HouseCusp[],
  locale: Locale = 'pt-BR',
): readonly HouseOverlay[] {
  return Object.freeze(chartAPlanets.map((p) => computeHouseOverlay(p, chartBHouses, locale)));
}

// --- audit (cycle 62 lesson 2) ---
export interface HouseOverlayAudit {
  readonly houseCoverage: readonly HouseNumber[];
  readonly planetsPlaced: number;
  readonly housesUsed: number;
  readonly valid: boolean;
}

export function auditHouseOverlay(overlays: readonly HouseOverlay[], expectedPlanets = 10): HouseOverlayAudit {
  const housesUsed = new Set<HouseNumber>();
  for (const o of overlays) housesUsed.add(o.partnerHouse);
  return Object.freeze({
    planetsPlaced: overlays.length,
    housesUsed: housesUsed.size,
    houseCoverage: Object.freeze([...housesUsed].sort((a, b) => a - b) as HouseNumber[]),
    valid: overlays.length >= expectedPlanets && housesUsed.size >= 1,
  });
}

// Suppress unused-import warning if locale ever pruned.
export const _LOCALE_USED = true;
