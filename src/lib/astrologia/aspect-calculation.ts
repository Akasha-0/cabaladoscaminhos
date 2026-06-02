// fallow-ignore-file unused-file
import type { AspectoTipo, PosicaoPlaneta } from './tipos';

interface AspectDefinition {
  tipo: AspectoTipo;
  angulo: number;
  orbMax: number;
}

const ASPECTOS: AspectDefinition[] = [
  { tipo: 'conjunção', angulo: 0, orbMax: 10 },
  { tipo: 'sextil', angulo: 60, orbMax: 6 },
  { tipo: 'quadratura', angulo: 90, orbMax: 8 },
  { tipo: 'trino', angulo: 120, orbMax: 8 },
  { tipo: 'oposição', angulo: 180, orbMax: 10 },
];

export interface AspectCalculationResult {
  tipo: AspectoTipo | null;
  orbito: number;
  orbExato: number;
  percentualOrb: number;
  forca: 'alto' | 'medio' | 'baixo';
  aplicativo: boolean;
  diferencaAngular: number;
}

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

function computeOrbExato(diff: number, angulo: number): number {
  return Math.abs(diff - angulo);
}

function computeForca(orbExato: number, orbMax: number): 'alto' | 'medio' | 'baixo' {
  const ratio = orbExato / orbMax;
  if (ratio <= 0.25) return 'alto';
  if (ratio <= 0.5) return 'medio';
  return 'baixo';
}

function determineAplicativo(p1: PosicaoPlaneta, p2: PosicaoPlaneta): boolean {
  return p1.velocidade > p2.velocidade;
}

export function calculateAspect(p1: PosicaoPlaneta, p2: PosicaoPlaneta): AspectCalculationResult {
  const diff = Math.abs(normalizeDiff(p1.longitude - p2.longitude));

  let melhorAspecto: AspectDefinition | null = null;
  let menorOrb = Infinity;

  for (const aspecto of ASPECTOS) {
    const orb = Math.abs(diff - aspecto.angulo);
    if (orb <= aspecto.orbMax && orb < menorOrb) {
      menorOrb = orb;
      melhorAspecto = aspecto;
    }
  }

  if (!melhorAspecto) {
    return {
      tipo: null,
      orbito: diff,
      orbExato: diff,
      percentualOrb: 0,
      forca: 'baixo',
      aplicativo: determineAplicativo(p1, p2),
      diferencaAngular: diff,
    };
  }

  const orbExato = computeOrbExato(diff, melhorAspecto.tipo === 'conjunção' ? 0 : diff);
  const percentualOrb = 1 - orbExato / melhorAspecto.orbMax;

  return {
    tipo: melhorAspecto.tipo,
    orbito: menorOrb,
    orbExato,
    percentualOrb: Math.max(0, Math.min(1, percentualOrb)),
    forca: computeForca(orbExato, melhorAspecto.orbMax),
    aplicativo: determineAplicativo(p1, p2),
    diferencaAngular: diff,
  };
}
