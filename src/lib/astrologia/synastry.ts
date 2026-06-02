/**
 * Synastry Comparison Module
 * Compares two birth charts and calculates compatibility scores.
 */

import type { MapaNatal, AspectoTipo, Planeta, PosicaoPlaneta } from './tipos';

export interface SynastryAspect {
  planet1: Planeta;
  planet2: Planeta;
  planet1In: string;
  planet2In: string;
  type: AspectoTipo;
  orb: number;
  strength: number;
}

export interface SynastryScore {
  total: number;
  harmony: number;
  tension: number;
  overall: 'excelente' | 'bom' | 'neutro' | 'desafiante' | 'conflituoso';
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  scores: SynastryScore;
  summary: string;
}

const ASPECT_PATTERNS: { type: AspectoTipo; angle: number; orbMax: number; weight: number }[] = [
  { type: 'conjunção', angle: 0, orbMax: 10, weight: 10 },
  { type: 'sextil', angle: 60, orbMax: 6, weight: 6 },
  { type: 'quadratura', angle: 90, orbMax: 8, weight: 8 },
  { type: 'trino', angle: 120, orbMax: 8, weight: 9 },
  { type: 'oposição', angle: 180, orbMax: 10, weight: 7 },
];

const PLANET_WEIGHTS: Record<Planeta, number> = {
  sol: 10,
  lua: 9,
  mercurio: 6,
  venus: 8,
  marte: 7,
  jupiter: 6,
  saturno: 5,
  urano: 4,
  netuno: 3,
  plutao: 3,
  node_norte: 4,
  node_sul: 4,
  quiron: 3,
};

function getPlanets(chart: MapaNatal): PosicaoPlaneta[] {
  const planets: PosicaoPlaneta[] = [
    chart.planeta.sol,
    chart.planeta.lua,
    chart.planeta.mercurio,
    chart.planeta.venus,
    chart.planeta.marte,
    chart.planeta.jupiter,
    chart.planeta.saturno,
    chart.planeta.urano,
    chart.planeta.netuno,
    chart.planeta.plutao,
  ];
  if (chart.nodes) {
    planets.push(chart.nodes.norte, chart.nodes.sul);
  }
  return planets;
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function getAngleDiff(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeAngle(lon1) - normalizeAngle(lon2));
  return diff > 180 ? 360 - diff : diff;
}

function calculateOrb(diff: number, targetAngle: number): number {
  return Math.abs(diff - targetAngle);
}

function getAspectStrength(orb: number, orbMax: number): number {
  const ratio = 1 - orb / orbMax;
  return Math.max(0, Math.min(1, ratio));
}

// fallow-ignore-next-line complexity
export function calculateSynastry(chart1: MapaNatal, chart2: MapaNatal): SynastryResult {
  const planets1 = getPlanets(chart1);
  const planets2 = getPlanets(chart2);
  const aspects: SynastryAspect[] = [];

  let harmonyScore = 0;
  let tensionScore = 0;

  for (const p1 of planets1) {
    for (const p2 of planets2) {
      if (p1.planeta === p2.planeta) continue;

      const diff = getAngleDiff(p1.longitude, p2.longitude);

      for (const pattern of ASPECT_PATTERNS) {
        const orb = calculateOrb(diff, pattern.angle);

        if (orb <= pattern.orbMax) {
          const strength = getAspectStrength(orb, pattern.orbMax);
          const p1Weight = PLANET_WEIGHTS[p1.planeta] ?? 5;
          const p2Weight = PLANET_WEIGHTS[p2.planeta] ?? 5;
          const score = pattern.weight * strength * ((p1Weight + p2Weight) / 2);

          const aspect: SynastryAspect = {
            planet1: p1.planeta,
            planet2: p2.planeta,
            planet1In: p1.signo,
            planet2In: p2.signo,
            type: pattern.type,
            orb,
            strength,
          };

          aspects.push(aspect);

          if (pattern.type === 'trino' || pattern.type === 'sextil') {
            harmonyScore += score;
          } else if (pattern.type === 'quadratura' || pattern.type === 'oposição') {
            tensionScore += score;
          } else {
            harmonyScore += score * 0.5;
          }
        }
      }
    }
  }

  const totalHarmony = Math.round(harmonyScore);
  const totalTension = Math.round(tensionScore);
  const total = totalHarmony + totalTension;
  const harmonyPercent = total > 0 ? (totalHarmony / total) * 100 : 50;

  let overall: SynastryScore['overall'];
  if (harmonyPercent >= 70) {
    overall = 'excelente';
  } else if (harmonyPercent >= 55) {
    overall = 'bom';
  } else if (harmonyPercent >= 45) {
    overall = 'neutro';
  } else if (harmonyPercent >= 30) {
    overall = 'desafiante';
  } else {
    overall = 'conflituoso';
  }

  const scores: SynastryScore = {
    total: Math.round(total),
    harmony: totalHarmony,
    tension: totalTension,
    overall,
  };

  const summary = generateSummary(scores, aspects);

  return { aspects, scores, summary };
}

function generateSummary(scores: SynastryScore, aspects: SynastryAspect[]): string {
  const { overall, harmony, tension } = scores;

  const majorAspects = aspects.filter(a => a.type === 'conjunção' || a.type === 'oposição');
  const trines = aspects.filter(a => a.type === 'trino');
  const squares = aspects.filter(a => a.type === 'quadratura');

  let summary = `Compatibility analysis shows an ${overall} relationship. `;
  summary += `Harmony score: ${harmony}, Tension score: ${tension}. `;

  if (majorAspects.length > 0) {
    summary += `Notable connections include ${majorAspects.length} major aspect(s). `;
  }
  if (trines.length > 0) {
    summary += `Found ${trines.length} harmonious trine(s). `;
  }
  if (squares.length > 0) {
    summary += `${squares.length} challenging square(s) detected.`;
  }

  return summary.trim();
}
