/**
 * synthesis-engine/frequency-analysis.ts
 *
 * Avaliação de frequência (Shadow / Gift / Siddhi) por área + cálculo do
 * perfil dominante e sequência ativa. Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AreaNarrative, FrequencyLevel } from './synthesis-types';

/**
 * Avalia a frequência (shadow/gift/siddhi) e intensidade (1-3) de uma área
 * usando heurística baseada em débitos cármicos, aspectos e mestres.
 */
export function assessAreaFrequency(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  _odu: OduBirth | null,
  _area: string
): { frequency: FrequencyLevel; intensity: 1 | 2 | 3 } {
  let shadowScore = 0;
  let giftScore = 0;

  if (kab?.karmicDebts?.length) shadowScore += kab.karmicDebts.length;
  if (kab?.challenges?.first) shadowScore += 1;
  if (kab?.challenges?.second) shadowScore += 1;

  const pluto = astro?.planets?.find(p => p.planet === 'Pluto' || p.planet === 'Plutão');
  if (pluto) shadowScore += 1;

  const saturn = astro?.planets?.find(p => p.planet === 'Saturn' || p.planet === 'Saturno');
  if (saturn) shadowScore += 1;

  if (kab?.lifePathMaster) giftScore += 2;
  if (tantra?.soul === 1 || tantra?.soul === 22) giftScore += 1;

  // ─── Siddhi path ────────────────────────────────────────────────────────────
  // Siddhi = absence of shadow signals + strong mastery/soul alignment.
  // Requires no karmic debt, no challenging aspects, no hard Pluto/Saturn aspects,
  // AND multiple mastery signals (lifePathMaster + soul ∈ {1, 22, 33}).
  const noShadow =
    !kab?.karmicDebts?.length &&
    !kab?.challenges?.first &&
    !kab?.challenges?.second &&
    !pluto &&
    !saturn;
  const soulMaster = tantra?.soul === 1 || tantra?.soul === 22 || tantra?.soul === 33;
  const hasMasterLifePath = !!kab?.lifePathMaster;

  if (noShadow && hasMasterLifePath && soulMaster) {
    return { frequency: 'siddhi', intensity: 3 };
  }
  if (noShadow && hasMasterLifePath) {
    return { frequency: 'siddhi', intensity: 2 };
  }

  // ─── Shadow / Gift paths ────────────────────────────────────────────────────
  if (shadowScore > giftScore && shadowScore >= 2) {
    return { frequency: 'shadow', intensity: Math.min(3, shadowScore) as 1 | 2 | 3 };
  }
  if (giftScore > shadowScore && giftScore >= 2) {
    return { frequency: 'gift', intensity: Math.min(3, giftScore) as 1 | 2 | 3 };
  }
  return { frequency: 'shadow', intensity: 1 };
}

export function deriveDominantFrequency(
  v: AreaNarrative,
  c: AreaNarrative,
  car: AreaNarrative,
  o: AreaNarrative,
  m: AreaNarrative,
  d: AreaNarrative
): FrequencyLevel {
  const areas = [v, c, car, o, m, d];
  const shadows = areas.filter(a => a.frequency === 'shadow').length;
  const gifts = areas.filter(a => a.frequency === 'gift').length;
  const siddhis = areas.filter(a => a.frequency === 'siddhi').length;
  // Siddhi wins if 3+ areas are at siddhi frequency
  if (siddhis >= 3) return 'siddhi';
  if (gifts > shadows) return 'gift';
  return 'shadow';
}


export function computeOverallScore(
  v: AreaNarrative,
  c: AreaNarrative,
  car: AreaNarrative,
  o: AreaNarrative,
  m: AreaNarrative,
  d: AreaNarrative
): number {
  const areas = [v, c, car, o, m, d];
  let giftCount = 0;
  areas.forEach(a => {
    if (a.frequency === 'siddhi') {
      giftCount += 1.5 + (a.intensity - 1) * 0.3;
    } else if (a.frequency === 'gift') {
      giftCount += 1 + (a.intensity - 1) * 0.3;
    }
    // shadow areas contribute nothing to the score
  });
  return Math.min(100, Math.round((giftCount / areas.length) * 100));
}

export function deriveActiveSequence(
  conexoes: AreaNarrative,
  missao: AreaNarrative,
  carreira: AreaNarrative
): 'vitality' | 'heart' | 'purpose' {
  const seq = [conexoes, missao, carreira].sort((a, b) => b.intensity - a.intensity)[0];
  if (seq === conexoes) return 'heart';
  if (seq === missao) return 'purpose';
  return 'vitality';
}
