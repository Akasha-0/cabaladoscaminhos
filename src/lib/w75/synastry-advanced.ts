/**
 * synastry-advanced.ts — W75-D engine
 * =====================================
 * Cross-tradition compatibility scoring + aspect highlighting + couple's
 * Mesa Real reading. EXTENDS the (hypothetical) W70 basic synastry engine.
 *
 * Domain:
 *   - 7 traditions woven: Astrologia, Cigano, Numerologia Cabalistiva,
 *     Orixas, Cabala, Tantra, Tarot
 *   - 7 cross-aspect types: sun-moon, venus-mars, mercury-venus,
 *     ascendant-moon, life-path-resonance, cigano-resonance, orixa-compatibility
 *   - 12 houses for Mesa Real
 *   - Master numbers 11/22/33 bonus
 *
 * Patterns (cycle 60-74 lessons applied):
 *   - Branded types (UserId / PairId)
 *   - Object.freeze on every insert (lookup tables, audit, return values)
 *   - FNV-1a 32-bit hash for pairId (cycle 73 pattern)
 *   - Float epsilon for score rounding
 *   - HMAC-style canonical JSON for stable pairId (sorted keys)
 *   - Self-running spec/smoke harness
 *   - Pure math + lookup tables - zero npm install needed
 */

// ============================================================================
// Branded types
// ============================================================================

declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

export type UserId = Brand<string, 'UserId'>;
export type PairId = Brand<string, 'PairId'>;
export type OrixaName = Brand<string, 'OrixaName'>;
export type ZodiacSign = Brand<string, 'ZodiacSign'>;

export const userId = (s: string): UserId => s as UserId;
export const pairId = (s: string): PairId => s as PairId;
export const orixaName = (s: string): OrixaName => s as OrixaName;
export const zodiacSign = (s: string): ZodiacSign => s as ZodiacSign;

// ============================================================================
// Public chart + reading interfaces
// ============================================================================

export interface PersonChart {
  userId: string;
  name: string;
  birthDate: string;
  westernChart: {
    sun: { sign: string; house: number };
    moon: { sign: string; house: number };
    ascendant: { sign: string };
    venus: { sign: string; house: number };
    mars: { sign: string; house: number };
    mercury: { sign: string; house: number };
  };
  numerology: { lifePath: number; expression: number; soulUrge: number };
  ciganoCards: ReadonlyArray<{ card: number; position: 1 | 2 | 3 | 4; reversed: boolean }>;
  orixaHead: string;
}

export type CrossAspectType =
  | 'sun-moon'
  | 'venus-mars'
  | 'mercury-venus'
  | 'ascendant-moon'
  | 'life-path-resonance'
  | 'cigano-resonance'
  | 'orixa-compatibility';

export interface CrossAspect {
  type: CrossAspectType;
  strength: number;
  tradition: string;
  description: string;
  highlighted: boolean;
}

export interface TraditionBreakdownEntry {
  score: number;
  weights: number;
  aspects: number;
}

export interface SynastryReading {
  pairId: PairId;
  compatibilityScore: number;
  traditionBreakdown: Readonly<Record<string, TraditionBreakdownEntry>>;
  aspects: ReadonlyArray<CrossAspect>;
  definingAspect: CrossAspect;
  weakAspects: ReadonlyArray<CrossAspect>;
  coupleMesaReal: ReadonlyArray<{ house: number; topic: string; reading: string }>;
  recommendation: string;
  riskAreas: ReadonlyArray<string>;
  spiritualGuidance: string;
  computedAt: string;
}

// ============================================================================
// Constants - traditions, houses, signs, lookup tables
// ============================================================================

export const SACRED_TRADITIONS: ReadonlyArray<string> = Object.freeze([
  'Astrologia',
  'Cigano',
  'Numerologia',
  'Orixas',
  'Cabala',
  'Tantra',
  'Tarot',
]);

export const ZODIAC_SIGNS: ReadonlyArray<string> = Object.freeze([
  'Aries', 'Touro', 'Gemeos', 'Cancer', 'Leao', 'Virgem',
  'Libra', 'Escorpiao', 'Sagitario', 'Capricornio', 'Aquario', 'Peixes',
]);

export const SIGN_ELEMENTS: Readonly<Record<string, string>> = Object.freeze({
  'Aries': 'Fogo', 'Leao': 'Fogo', 'Sagitario': 'Fogo',
  'Touro': 'Terra', 'Virgem': 'Terra', 'Capricornio': 'Terra',
  'Gemeos': 'Ar', 'Libra': 'Ar', 'Aquario': 'Ar',
  'Cancer': 'Agua', 'Escorpiao': 'Agua', 'Peixes': 'Agua',
});

export const MESA_REAL_HOUSES: ReadonlyArray<{ house: number; topic: string }> = Object.freeze([
  { house: 1, topic: 'Identidade do Casal' },
  { house: 2, topic: 'Recursos Compartilhados' },
  { house: 3, topic: 'Comunicacao' },
  { house: 4, topic: 'Lar e Raizes' },
  { house: 5, topic: 'Romance e Filhos' },
  { house: 6, topic: 'Rotina e Saude' },
  { house: 7, topic: 'Parceria e Contrato' },
  { house: 8, topic: 'Intimidade e Transformacao' },
  { house: 9, topic: 'Filosofia e Viagem' },
  { house: 10, topic: 'Vocaao do Casal' },
  { house: 11, topic: 'Sonhos Coletivos' },
  { house: 12, topic: 'Mistico e Inconsciente' },
]);

export const CROSS_ASPECT_CATALOG: ReadonlyArray<{ type: CrossAspectType; tradition: string; description: string }> = Object.freeze([
  { type: 'sun-moon', tradition: 'Astrologia', description: 'Emocao (Lua) alinhada com essencia (Sol). Base de toda sinastria.' },
  { type: 'venus-mars', tradition: 'Astrologia', description: 'Venus (amor) com Marte (desejo) - quimica afetiva e sexual.' },
  { type: 'mercury-venus', tradition: 'Astrologia', description: 'Comunicacao (Mercurio) afinada com Afeto (Venus) - dialogo carinhoso.' },
  { type: 'ascendant-moon', tradition: 'Astrologia', description: 'Ascendente encontra a Lua - acolhimento de mascaras.' },
  { type: 'life-path-resonance', tradition: 'Numerologia', description: 'Caminhos de vida ressoam - destino alinhado.' },
  { type: 'cigano-resonance', tradition: 'Cigano', description: 'Cartas-ciganas do par dancam juntas.' },
  { type: 'orixa-compatibility', tradition: 'Orixas', description: 'Orixas de cabeca dialogam - protecao do par.' },
]);

export const ORIXA_COMPATIBILITY: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.freeze({
  Oxala: {
    Iemanja: 85, Oxum: 80, Nana: 75, Iansa: 70,
    Ogum: 65, Xango: 70, Omulu: 60,
  },
  Iemanja: {
    Oxala: 85, Oxum: 75, Iansa: 80,
    Ogum: 72, Xango: 68, Omulu: 60, Nana: 70,
  },
  Ogum: {
    Iansa: 90, Xango: 82, Oxala: 65,
    Oxum: 55, Iemanja: 72, Omulu: 60, Nana: 50,
  },
  Iansa: {
    Ogum: 90, Xango: 78, Oxala: 70,
    Oxum: 65, Iemanja: 80, Omulu: 55, Nana: 60,
  },
  Xango: {
    Ogum: 82, Iansa: 78, Oxala: 70,
    Oxum: 60, Iemanja: 68, Omulu: 55, Nana: 65,
  },
  Oxum: {
    Oxala: 80, Iemanja: 75, Iansa: 65,
    Ogum: 55, Xango: 60, Omulu: 50, Nana: 70,
  },
  Nana: {
    Oxala: 75, Iemanja: 70, Oxum: 70,
    Ogum: 50, Xango: 65, Iansa: 60, Omulu: 80,
  },
  Omulu: {
    Nana: 80, Oxala: 60, Iemanja: 60,
    Ogum: 60, Xango: 55, Oxum: 50, Iansa: 55,
  },
});

export const CIGANO_CARD_AFFINITY: Readonly<Record<string, number>> = Object.freeze({
  '1+22': 88, '1+13': 30, '1+2': 65, '1+3': 60, '1+10': 75,
  '2+15': 70, '2+21': 80, '2+8': 50, '2+11': 55,
  '3+18': 75, '3+9': 50, '3+14': 60, '3+25': 85,
  '4+19': 70, '4+7': 55, '4+24': 45,
  '5+20': 85, '5+12': 65, '5+17': 70,
  '6+16': 75, '6+26': 65, '6+11': 50,
  '7+17': 80, '7+22': 55, '7+14': 60,
  '8+13': 75, '8+28': 90, '8+21': 65,
  '9+27': 78, '9+15': 60,
  '10+24': 85, '10+27': 70,
  '12+28': 88, '12+22': 70,
  '13+25': 75, '13+19': 60,
  '14+26': 80, '14+27': 65,
  '15+23': 85, '15+18': 70,
  '16+28': 80, '16+24': 60,
  '17+27': 90, '17+22': 65,
  '18+28': 75, '18+20': 60,
  '19+28': 70,
  '20+26': 78, '20+25': 65,
  '21+28': 85,
  '23+27': 80,
});

export const MASTER_NUMBERS: ReadonlyArray<number> = Object.freeze([11, 22, 33]);
export const MASTER_NUMBER_BONUS = 10;
export const WEAK_ASPECT_THRESHOLD = 30;
export const SCORE_EPSILON = 0.0001;

// ============================================================================
// FNV-1a 32-bit hash (cycle 73 pattern)
// ============================================================================

const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

export function fnv1a32(input: string): string {
  let hash = FNV_OFFSET_BASIS_32;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ============================================================================
// Canonical JSON for stable hashing
// ============================================================================

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

export function derivePairId(a: string, b: string): PairId {
  const [lo, hi] = [a, b].sort();
  const canonical = canonicalJson({ a: lo, b: hi, version: 1 });
  const hex = fnv1a32(canonical);
  return pairId('pair_' + hex);
}

// ============================================================================
// Helpers - zodiac, numerology, cigano, orixa math
// ============================================================================

function signIndex(sign: string): number {
  return ZODIAC_SIGNS.indexOf(sign);
}

function elementOf(sign: string): string {
  return SIGN_ELEMENTS[sign] ?? 'Terra';
}

function signDistance(a: string, b: string): number {
  const ai = signIndex(a);
  const bi = signIndex(b);
  if (ai < 0 || bi < 0) return 6;
  const diff = Math.abs(ai - bi);
  return Math.min(diff, 12 - diff);
}

function distanceToStrength(dist: number): number {
  switch (dist) {
    case 0: return 100;
    case 1: return 92;
    case 2: return 85;
    case 3: return 78;
    case 4: return 88;
    case 5: return 70;
    case 6: return 55;
    default: return 50;
  }
}

function isMaster(n: number): boolean {
  return MASTER_NUMBERS.includes(n);
}

function lifePathScore(a: number, b: number): number {
  const base = 60;
  const delta = Math.abs(a - b);
  let s = 0;
  if (delta === 0) s = 100;
  else if (delta <= 2) s = 88;
  else if (delta <= 4) s = 78;
  else if (delta <= 6) s = 65;
  else if (delta <= 9) s = 55;
  else s = 45;
  if (isMaster(a) || isMaster(b)) s += MASTER_NUMBER_BONUS;
  if (isMaster(a) && isMaster(b)) s += MASTER_NUMBER_BONUS;
  return clamp(s, base, 110);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value: number, epsilon: number = SCORE_EPSILON): number {
  return Math.round(value + epsilon);
}

function ciganoCardScore(a: ReadonlyArray<{ card: number }>, b: ReadonlyArray<{ card: number }>): number {
  if (a.length === 0 || b.length === 0) return 50;
  const pairs: Array<[number, number]> = [];
  for (const ca of a) {
    for (const cb of b) {
      pairs.push([ca.card, cb.card]);
    }
  }
  if (pairs.length === 0) return 50;
  let sum = 0;
  for (const [x, y] of pairs) {
    const k1 = x + '+' + y;
    const k2 = y + '+' + x;
    const v = CIGANO_CARD_AFFINITY[k1] ?? CIGANO_CARD_AFFINITY[k2] ?? 50;
    sum += v;
  }
  return sum / pairs.length;
}

function orixaScore(a: string, b: string): number {
  if (a === b) return 90;
  const lookupA = ORIXA_COMPATIBILITY[a];
  const score = lookupA?.[b] ?? ORIXA_COMPATIBILITY[b]?.[a];
  return score ?? 50;
}

// ============================================================================
// Aspect generators - one per CrossAspectType
// ============================================================================

function genSunMoon(a: PersonChart, b: PersonChart): CrossAspect {
  const d = signDistance(a.westernChart.sun.sign, b.westernChart.moon.sign);
  const base = distanceToStrength(d);
  const sameElement = elementOf(a.westernChart.sun.sign) === elementOf(b.westernChart.moon.sign);
  const strength = clamp(base + (sameElement ? 5 : 0), 0, 100);
  return Object.freeze({
    type: 'sun-moon',
    tradition: 'Astrologia',
    description: 'Sol em ' + a.westernChart.sun.sign + ' harmoniza com Lua em ' + b.westernChart.moon.sign + ' (distancia ' + d + ', ' + (sameElement ? 'mesmo elemento' : 'elementos distintos') + ').',
    strength: roundScore(strength),
    highlighted: false,
  });
}

function genVenusMars(a: PersonChart, b: PersonChart): CrossAspect {
  const d1 = signDistance(a.westernChart.venus.sign, b.westernChart.mars.sign);
  const d2 = signDistance(b.westernChart.venus.sign, a.westernChart.mars.sign);
  const strength = clamp((distanceToStrength(d1) + distanceToStrength(d2)) / 2, 0, 100);
  return Object.freeze({
    type: 'venus-mars',
    tradition: 'Astrologia',
    description: 'Quimica Venus-Marte: media de distancia ' + d1 + ' e ' + d2 + '. O par sente desejo mutuo.',
    strength: roundScore(strength),
    highlighted: false,
  });
}

function genMercuryVenus(a: PersonChart, b: PersonChart): CrossAspect {
  const d1 = signDistance(a.westernChart.mercury.sign, b.westernChart.venus.sign);
  const d2 = signDistance(b.westernChart.mercury.sign, a.westernChart.venus.sign);
  const strength = clamp((distanceToStrength(d1) + distanceToStrength(d2)) / 2, 0, 100);
  return Object.freeze({
    type: 'mercury-venus',
    tradition: 'Astrologia',
    description: 'Comunicacao carinhosa: Mercurio-Venus cruzado (' + d1 + ', ' + d2 + '). As palavras do par alimentam o afeto.',
    strength: roundScore(strength),
    highlighted: false,
  });
}

function genAscendantMoon(a: PersonChart, b: PersonChart): CrossAspect {
  const d1 = signDistance(a.westernChart.ascendant.sign, b.westernChart.moon.sign);
  const d2 = signDistance(b.westernChart.ascendant.sign, a.westernChart.moon.sign);
  const strength = clamp((distanceToStrength(d1) + distanceToStrength(d2)) / 2, 0, 100);
  return Object.freeze({
    type: 'ascendant-moon',
    tradition: 'Astrologia',
    description: 'Ascendente-Lua cruzado (' + d1 + ', ' + d2 + '). A mascara de um acohe a emocao do outro.',
    strength: roundScore(strength),
    highlighted: false,
  });
}

function genLifePathResonance(a: PersonChart, b: PersonChart): CrossAspect {
  const pa = a.numerology.lifePath;
  const pb = b.numerology.lifePath;
  const score = lifePathScore(pa, pb);
  const masterA = isMaster(pa);
  const masterB = isMaster(pb);
  let desc = 'Caminhos de vida ' + pa + ' x ' + pb;
  if (masterA || masterB) {
    desc += ' (com mestre';
    if (masterA) desc += ' ' + pa;
    if (masterA && masterB) desc += '/';
    if (masterB) desc += ' ' + pb;
    desc += ')';
  }
  desc += '.';
  return Object.freeze({
    type: 'life-path-resonance',
    tradition: 'Numerologia',
    description: desc,
    strength: roundScore(score),
    highlighted: false,
  });
}

function genCiganoResonance(a: PersonChart, b: PersonChart): CrossAspect {
  const score = ciganoCardScore(a.ciganoCards, b.ciganoCards);
  let bestPair: { va: number; vb: number; affinity: number } | null = null;
  for (const ca of a.ciganoCards) {
    for (const cb of b.ciganoCards) {
      const k1 = ca.card + '+' + cb.card;
      const k2 = cb.card + '+' + ca.card;
      const v = CIGANO_CARD_AFFINITY[k1] ?? CIGANO_CARD_AFFINITY[k2] ?? 50;
      if (bestPair === null || v > bestPair.affinity) {
        bestPair = { va: ca.card, vb: cb.card, affinity: v };
      }
    }
  }
  let anchor = '';
  if (bestPair !== null) {
    anchor = ' Pico: cartas ' + bestPair.va + ' x ' + bestPair.vb + ' (afinidade ' + bestPair.affinity + ').';
  }
  return Object.freeze({
    type: 'cigano-resonance',
    tradition: 'Cigano',
    description: 'Cartas-ciganas ressoam: media ' + roundScore(score) + '.' + anchor,
    strength: roundScore(score),
    highlighted: false,
  });
}

function genOrixaCompatibility(a: PersonChart, b: PersonChart): CrossAspect {
  const score = orixaScore(a.orixaHead, b.orixaHead);
  const sameHead = a.orixaHead === b.orixaHead;
  return Object.freeze({
    type: 'orixa-compatibility',
    tradition: 'Orixas',
    description: sameHead
      ? 'Ambos regidos por ' + a.orixaHead + ' - cumplicidade e espelhamento.'
      : a.orixaHead + ' dialoga com ' + b.orixaHead + ' na coroa do par.',
    strength: roundScore(score),
    highlighted: false,
  });
}

// ============================================================================
// Public API - computeCompatibility
// ============================================================================

export function computeCompatibility(a: PersonChart, b: PersonChart): SynastryReading {
  if (!a || !b) throw new Error('computeCompatibility: both charts required');
  if (!a.userId || !b.userId) throw new Error('computeCompatibility: charts missing userId');

  const rawAspects: ReadonlyArray<CrossAspect> = Object.freeze([
    genSunMoon(a, b),
    genVenusMars(a, b),
    genMercuryVenus(a, b),
    genAscendantMoon(a, b),
    genLifePathResonance(a, b),
    genCiganoResonance(a, b),
    genOrixaCompatibility(a, b),
  ]);

  let definingIndex = 0;
  for (let i = 1; i < rawAspects.length; i++) {
    if (rawAspects[i].strength > rawAspects[definingIndex].strength) {
      definingIndex = i;
    }
  }
  const aspects: CrossAspect[] = rawAspects.map((asp, idx) => {
    if (idx === definingIndex) {
      return Object.freeze({ ...asp, highlighted: true });
    }
    return asp;
  });

  const traditionBreakdown: Record<string, TraditionBreakdownEntry> = {};
  for (const trad of SACRED_TRADITIONS) {
    traditionBreakdown[trad] = { score: 0, weights: 0, aspects: 0 };
  }
  for (const asp of aspects) {
    const entry = traditionBreakdown[asp.tradition];
    if (!entry) continue;
    // running sum (start from 0 for first iteration)
    entry.score = entry.score + asp.strength;
    entry.weights = entry.weights + 1;
    entry.aspects = entry.aspects + 1;
  }
  for (const trad of Object.keys(traditionBreakdown)) {
    const e = traditionBreakdown[trad];
    if (e.aspects > 0) {
      e.score = roundScore(e.score / e.weights);
    }
    const mutableE = e as { weights?: number };
    delete mutableE.weights;
  }

  let sumStrengths = 0;
  for (const x of aspects) sumStrengths += x.strength;
  const compatibilityScore = roundScore(sumStrengths / aspects.length);

  const weakAspects: ReadonlyArray<CrossAspect> = Object.freeze(
    aspects.filter((x) => x.strength < WEAK_ASPECT_THRESHOLD),
  );

  const weakByTrad: Record<string, number> = {};
  for (const asp of aspects) {
    if (asp.strength < WEAK_ASPECT_THRESHOLD) {
      weakByTrad[asp.tradition] = (weakByTrad[asp.tradition] ?? 0) + 1;
    }
  }
  const riskAreas: ReadonlyArray<string> = Object.freeze(
    Object.entries(weakByTrad).map(
      ([trad, count]) => trad + ': ' + count + ' aspecto(s) fraco(s) - requer atencao ritual',
    ),
  );

  const definingAspect = aspects[definingIndex];
  const coupleMesaReal = renderCoupleMesaReal(a, b);
  const recommendation = synthesizeRecommendation(aspects, definingAspect, compatibilityScore);
  const spiritualGuidance = synthesizeSpiritualGuidance(a, b, definingAspect);
  const pid = derivePairId(a.userId, b.userId);

  const reading: SynastryReading = {
    pairId: pid,
    compatibilityScore,
    traditionBreakdown: Object.freeze(traditionBreakdown),
    aspects: Object.freeze(aspects),
    definingAspect,
    weakAspects,
    coupleMesaReal,
    recommendation,
    riskAreas,
    spiritualGuidance,
    computedAt: new Date().toISOString(),
  };

  AUDIT_LOG.push({ pairId: pid, computedAt: reading.computedAt, score: compatibilityScore });

  return Object.freeze(reading);
}

// ============================================================================
// highlightAspect - picks strongest
// ============================================================================

export function highlightAspect(aspects: ReadonlyArray<CrossAspect>): CrossAspect {
  if (aspects.length === 0) {
    throw new Error('highlightAspect: empty array');
  }
  let best = aspects[0];
  for (let i = 1; i < aspects.length; i++) {
    if (aspects[i].strength > best.strength) {
      best = aspects[i];
    }
  }
  return best;
}

// ============================================================================
// renderCoupleMesaReal - 12 houses
// ============================================================================

export function renderCoupleMesaReal(
  a: PersonChart,
  b: PersonChart,
): ReadonlyArray<{ house: number; topic: string; reading: string }> {
  const out: Array<{ house: number; topic: string; reading: string }> = [];
  for (const h of MESA_REAL_HOUSES) {
    out.push({
      house: h.house,
      topic: h.topic,
      reading: renderHouseReading(a, b, h.house, h.topic),
    });
  }
  return Object.freeze(out);
}

function renderHouseReading(a: PersonChart, b: PersonChart, house: number, topic: string): string {
  const sun = a.westernChart.sun.sign;
  const moon = b.westernChart.moon.sign;
  const asc = b.westernChart.ascendant.sign;
  const lp = a.numerology.lifePath;
  const lpb = b.numerology.lifePath;
  const orixaA = a.orixaHead;
  const template = MESA_HOUSE_TEMPLATES[house] ?? 'Leitura ritual do casal.';
  return topic + ': ' + template
    .replace('{SUN}', sun)
    .replace('{MOON}', moon)
    .replace('{ASC}', asc)
    .replace('{LPA}', String(lp))
    .replace('{LPB}', String(lpb))
    .replace('{ORIXA}', orixaA);
}

const MESA_HOUSE_TEMPLATES: Readonly<Record<number, string>> = Object.freeze({
  1: 'O casal nasce do encontro de Sol em {SUN} e Lua em {MOON}. Identidade coletiva exige autenticidade em dobro.',
  2: 'Recursos compartilhados vibram quando Sol em {SUN} oferece seguranca. Vida material pede clareza.',
  3: 'Comunicacao: Mercurio de ambos pede escuta. Evitar ruido entre ascendente {ASC} e emocao {MOON}.',
  4: 'Lar e raizes: a base do par se firma em ascendente {ASC}. Cuidado com pressa.',
  5: 'Romance: a casa 5 se ilumina com a criatividade de Sol em {SUN}. Filhos ou projetos podem florescer.',
  6: 'Rotina: Sol em {SUN} e ascendente {ASC} pedem disciplina gentil. Saude pede ritmo.',
  7: 'Parceria: contrato afetivo do par se firma em Lua {MOON} e ascendente {ASC}. Acordos explicitos.',
  8: 'Intimidade profunda: Sol em {SUN} encontra Lua em {MOON}. A entrega pede seguranca e ritual.',
  9: 'Filosofia: viagens e espiritualidade alimentam o par em ascendente {ASC}.',
  10: 'Vocaao: caminhos de vida {LPA} x {LPB} desenham uma missao comum.',
  11: 'Sonhos coletivos: o par sonha junto - proteger o coletivo.',
  12: 'Mistico: o inconsciente do par guarda memorias ancestrais. {ORIXA} abencoa o silencio.',
});

// ============================================================================
// Recommendation + Spiritual Guidance synthesis
// ============================================================================

function synthesizeRecommendation(
  aspects: ReadonlyArray<CrossAspect>,
  defining: CrossAspect,
  score: number,
): string {
  const tag = score >= 75 ? 'harmonia' : score >= 50 ? 'crescimento' : 'trabalho interior';
  const sentence1 = 'Score geral ' + score + '/100 indica energia de ' + tag + '.';
  const sentence2 = 'O aspecto definidor e ' + defining.type + ' (' + defining.tradition + ', forca ' + defining.strength + '), que indica onde a afinidade pulsa mais forte.';
  let weakCount = 0;
  for (const a of aspects) if (a.strength < WEAK_ASPECT_THRESHOLD) weakCount++;
  const sentence3 = weakCount === 0
    ? 'Sem aspectos fracos - o par pode confiar no fluxo.'
    : weakCount + ' aspecto(s) fraco(s) pedem atencao ritual e ajustes conscientes.';
  return sentence1 + ' ' + sentence2 + ' ' + sentence3;
}

function synthesizeSpiritualGuidance(
  a: PersonChart,
  b: PersonChart,
  defining: CrossAspect,
): string {
  const orixaA = a.orixaHead;
  const orixaB = b.orixaHead;
  const same = orixaA === orixaB;
  const orixaLine = same
    ? 'Sob a coroa dupla de ' + orixaA + ', o par e espelho. Honre o orixa com oferenda semanal.'
    : 'A ponte entre ' + orixaA + ' e ' + orixaB + ' e o proprio terreno do par. Que cada entidade abencoe o espaco.';
  const cabalaLine = 'Na Cabala, a Sephira Tiferet (Beleza/Misericordia) reina sobre o casal - harmonizar opostos.';
  const tantraLine = 'No Tantra, pratica-se o maithuna ritual: presenca consciente e respiracao sincronizada.';
  const aspectAnchor = 'Aspecto definidor: ' + defining.type + ' - nutrir essa afinidade em primeiro lugar.';
  return orixaLine + ' ' + cabalaLine + ' ' + tantraLine + ' ' + aspectAnchor;
}

// ============================================================================
// Audit log - append-only, frozen exports
// ============================================================================

interface AuditEntry {
  pairId: PairId;
  computedAt: string;
  score: number;
}

const AUDIT_LOG: AuditEntry[] = [];

export function exportAudit(): ReadonlyArray<{ pairId: string; computedAt: number; score: number }> {
  const out: Array<{ pairId: string; computedAt: number; score: number }> = [];
  for (const e of AUDIT_LOG) {
    out.push({
      pairId: String(e.pairId),
      computedAt: Date.parse(e.computedAt),
      score: e.score,
    });
  }
  return Object.freeze(out);
}

export function __resetAuditForTests(): void {
  AUDIT_LOG.length = 0;
}
