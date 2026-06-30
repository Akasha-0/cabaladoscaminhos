/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ENERGY + MOOD + SPIRITUAL-STATE DAILY CHECK-IN — Energy analysis
 *  Cabala dos Caminhos — wave 69, 2026-06-30
 *
 *  Pure analytics over the check-in store from `checkin.ts`.
 *
 *  Provides:
 *   - classifyEnergy(score)        — bucket: low / steady / high / peak
 *   - classifyBucket(score)        — re-export of checkin.classifyBucket
 *   - energyTrend(userId, window)  — 7-day rolling avg + direction
 *                                    (rising | falling | stable | insufficient)
 *   - energyVsHistory(userId, …)   — percentile of today's score in past 90d
 *   - suggestRitualForEnergy(b)    — sacred-practice recommendation
 *                                    referenced to the project's content library:
 *                                      banimento, descarrego, expansão,
 *                                      gratidão, meditação dos chakras,
 *                                      oração de Oxalá, oferenda aos Orixás,
 *                                      leitura de Odu, etc.
 *
 *  No external deps. Sacred-references follow the Lenormand + Odus + Orixás
 *  taxonomy in `src/lib/constants/`. No invented practices.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  CHECKINS,
  type Checkin,
  type EnergyBucket,
  type UserId,
  type DateKey,
  classifyBucket,
} from './checkin.ts';

// ───────────────────────────────────────────────────────────────────────────
//  Re-export (analytics layer is the public face of the engine)
// ───────────────────────────────────────────────────────────────────────────

export { classifyBucket };

// ───────────────────────────────────────────────────────────────────────────
//  Trend computation
// ───────────────────────────────────────────────────────────────────────────

export type TrendDirection = 'rising' | 'falling' | 'stable' | 'insufficient';

export interface EnergyTrend {
  /** Most recent EnergyBucket in the window (last date with a check-in) */
  latestBucket: EnergyBucket | null;
  /** Most recent score (1..10) */
  latestScore: number | null;
  /** 7-day rolling average over the last 7 check-ins (not calendar days) */
  rolling7DayAvg: number | null;
  /** Direction interpretation */
  direction: TrendDirection;
  /** Slope estimate: avg(recent half) − avg(older half). +ve = rising */
  slope: number;
  /** Number of check-ins that contributed to the analysis */
  sampleSize: number;
}

/**
 * Compute the energy trend for `userId` over the `windowDays`-most-recent
 * check-ins. `windowDays` defaults to 14. Returns an `EnergyTrend` snapshot.
 *
 * Algorithm:
 *   1. Take the last N records (N = window, capped at 365)
 *   2. Compute rolling 7-day average (last 7 check-ins)
 *   3. Split remaining older half vs newer half
 *   4. slope = avg(newer) − avg(older)
 *   5. direction = +ve (>+0.5) rising | −ve (<−0.5) falling | else stable
 *   6. If fewer than 3 check-ins: direction = 'insufficient'
 */
export function energyTrend(
  userId: UserId,
  windowDays = 14,
): EnergyTrend {
  const window = Math.max(1, Math.min(365, windowDays));

  const all = Array.from(CHECKINS.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0))
    .slice(0, window);

  if (all.length === 0) {
    return {
      latestBucket: null,
      latestScore: null,
      rolling7DayAvg: null,
      direction: 'insufficient',
      slope: 0,
      sampleSize: 0,
    };
  }

  const latest = all[0]!;
  const last7 = all.slice(0, Math.min(7, all.length));
  const rolling7 = last7.reduce((acc, c) => acc + c.energyScore, 0) / last7.length;

  if (all.length < 3) {
    return {
      latestBucket: latest.energyBucket,
      latestScore: latest.energyScore,
      rolling7DayAvg: round2(rolling7),
      direction: 'insufficient',
      slope: 0,
      sampleSize: all.length,
    };
  }

  const mid = Math.floor(all.length / 2);
  const older = all.slice(mid); // older half (earlier dates)
  const newer = all.slice(0, mid); // newer half (later dates)
  const avgOlder = older.reduce((acc, c) => acc + c.energyScore, 0) / older.length;
  const avgNewer = newer.reduce((acc, c) => acc + c.energyScore, 0) / newer.length;
  const slope = round2(avgNewer - avgOlder);

  let direction: TrendDirection = 'stable';
  if (slope > 0.5) direction = 'rising';
  else if (slope < -0.5) direction = 'falling';

  return {
    latestBucket: latest.energyBucket,
    latestScore: latest.energyScore,
    rolling7DayAvg: round2(rolling7),
    direction,
    slope,
    sampleSize: all.length,
  };
}

// ───────────────────────────────────────────────────────────────────────────
//  Percentile vs past 90 days
// ───────────────────────────────────────────────────────────────────────────

/**
 * Compute the percentile rank of `todayScore` within the user's past-90-day
 * energy distribution. Returns a value in [0, 1] where 0 = lowest, 1 = highest.
 *
 * Uses linear interpolation for ties (the "C = 1" method from NIST).
 * If fewer than 2 historical check-ins exist, returns null.
 */
export function energyVsHistory(
  userId: UserId,
  todayScore: number,
  windowDays = 90,
): number | null {
  if (!Number.isInteger(todayScore) || todayScore < 1 || todayScore > 10) {
    throw new RangeError(`todayScore must be integer 1..10 (got: ${todayScore})`);
  }
  const window = Math.max(2, Math.min(3650, windowDays));

  const historical = Array.from(CHECKINS.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0))
    .slice(0, window)
    .map((c) => c.energyScore);

  if (historical.length < 2) return null;

  const sorted = [...historical].sort((a, b) => a - b);
  const rank = lowerBound(sorted, todayScore);
  // Linear interpolation (NIST C=1 method)
  const exactMatches = sorted.filter((v) => v === todayScore).length;
  const percentile = (rank + 0.5 * exactMatches) / sorted.length;
  return round4(Math.min(1, Math.max(0, percentile)));
}

function lowerBound(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// ───────────────────────────────────────────────────────────────────────────
//  Ritual suggestions — referenced to the project's content library
// ───────────────────────────────────────────────────────────────────────────

export interface RitualSuggestion {
  bucket: EnergyBucket;
  primaryPractice: string;
  alternatives: readonly string[];
  sacredAnchor: string;
  /** 1-sentence rationale shown in the UI */
  rationale: string;
}

/**
 * Recommend a Cabala-dos-Caminhos-aligned sacred practice for the bucket.
 *
 * Critical: every practice below maps to a CONCEPT that exists in this
 * product's content library (Orixás, Odus, Lenormand mesa real, chakras,
 * banimento, descarrego, oração). See DELIVERABLE.md for citations.
 */
const RITUAL_TABLE: Readonly<Record<EnergyBucket, RitualSuggestion>> = {
  low: {
    bucket: 'low',
    primaryPractice: 'Banimento com pemba de chão (Varredura da casa + oração de Obaluaiê)',
    alternatives: [
      'Banho de descarrego com ervas (Guiné, Arruda, Erva-Santa-Maria)',
      'Meditação raiz: 21 respirações no chakra 1 (Muladhara)',
      'Defumação com alecrim + sal grosso nos quatro cantos',
      'Oração de Ogum para abrir caminhos',
    ],
    sacredAnchor: 'Orixá Obaluaiê — regente da cura e da transformação da sombra',
    rationale:
      'Energia baixa pede aterramento + limpeza. Banimento devolve o chão antes de tudo.',
  },
  steady: {
    bucket: 'steady',
    primaryPractice: 'Meditação dos chakras (7 chakras, 7 respirações cada)',
    alternatives: [
      'Leitura de Odu do dia (ciclo Merindilogun)',
      'Tiragem de 3 cartas Ciganas para o dia',
      'Diário de intenções + revisão da Mesa Real',
      'Banho de ervas suaves (Alecrim + Camomila)',
    ],
    sacredAnchor: 'Equilíbrio entre os 16 Odus — meio do camino (Obará / Odi)',
    rationale:
      'Energia estável é o melhor momento para aprofundar — sem urgência, sem queda.',
  },
  high: {
    bucket: 'high',
    primaryPractice: 'Roda de gratidão + oferenda simples aos Orixás regentes do Odu do dia',
    alternatives: [
      'Tiragem completa da Mesa Real (36 cartas)',
      'Prática de expansão (yoga flow + respiração kapalbhati)',
      'Escrever 7 gratidões concretas no diário',
      'Compartilhar uma leitura com um praticante mais novo',
    ],
    sacredAnchor: 'Orixá Oxalá — regente da criação e da luz que expande',
    rationale:
      'Energia alta quer CIRCULAÇÃO. Se ficar parada vira ansiedade; se for canalizada, vira oferenda.',
  },
  peak: {
    bucket: 'peak',
    primaryPractice: 'Oração de Oxalá + meditação do chakra coronário (Sahasrara)',
    alternatives: [
      'Cerimônia de gratidão aos 16 Odus em sequência',
      'Tiragem completa da Mesa Real + estudo dos cruzamentos por casa',
      'Ato de serviço: oferecer leitura gratuita para alguém',
      'Banho de flores brancas + perfume alfazema',
    ],
    sacredAnchor: 'Ofun / Ofurufu — completude e benção universal',
    rationale:
      'Energia peak é rara e sagrada — não esgote, irradie. Encerrar o ciclo com oferenda.',
  },
};

/**
 * Look up the ritual suggestion for a given bucket.
 * Pure function: same input → same output, no side effects, no IO.
 */
export function suggestRitualForEnergy(bucket: EnergyBucket): RitualSuggestion {
  return RITUAL_TABLE[bucket];
}

/**
 * Convenience — pass a numeric score, get the ritual for that bucket.
 */
export function suggestRitualForScore(score: number): RitualSuggestion {
  return suggestRitualForEnergy(classifyBucket(score));
}

// ───────────────────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────────────────

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

// Re-export for callers that want the type — avoids `import type { … }`.
export type { EnergyBucket, UserId, Checkin, DateKey };
