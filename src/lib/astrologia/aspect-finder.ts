import type { Aspecto, AspectoTipo, PosicaoPlaneta } from './tipos';

const ASPECTOS: { tipo: AspectoTipo; angulo: number; orbMax: number; nature: import('./tipos').AspectoNature }[] = [
  { tipo: 'conjunção', angulo: 0, orbMax: 10, nature: 'neutral' },
  { tipo: 'sextil', angulo: 60, orbMax: 6, nature: 'harmony' },
  { tipo: 'quadratura', angulo: 90, orbMax: 8, nature: 'tension' },
  { tipo: 'trino', angulo: 120, orbMax: 8, nature: 'harmony' },
  { tipo: 'oposição', angulo: 180, orbMax: 10, nature: 'tension' },
];

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

export function findAspects(positions: PosicaoPlaneta[]): Aspecto[] {
  const aspectos: Aspecto[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      for (const aspecto of ASPECTOS) {
        const diff = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
        const orb = Math.abs(diff - aspecto.angulo);

        if (orb <= aspecto.orbMax) {
          aspectos.push({
            planeta1: p1.planeta,
            planeta2: p2.planeta,
            tipo: aspecto.tipo,
            orb,
            aplicativo: p1.velocidade > p2.velocidade,
            nature: aspecto.nature,
          });
        }
      }
    }
  }

  return aspectos;
}