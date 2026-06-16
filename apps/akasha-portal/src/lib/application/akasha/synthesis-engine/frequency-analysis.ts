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
    if (a.frequency === 'gift') giftCount += 1;
    giftCount += (a.intensity - 1) * 0.3;
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
