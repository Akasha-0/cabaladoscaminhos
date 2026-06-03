import type { Aspecto, AspectoTipo, PosicaoPlaneta, AspectoNature } from '../tipos';
const ASPECTOS: { tipo: AspectoTipo; angulo: number; orbMax: number; nature: AspectoNature }[] = [
  { tipo: 'conjunção', angulo: 0, orbMax: 10, nature: 'neutral' },
  { tipo: 'sextil', angulo: 60, orbMax: 6, nature: 'harmony' },
  { tipo: 'quadratura', angulo: 90, orbMax: 8, nature: 'tension' },
  { tipo: 'trino', angulo: 120, orbMax: 8, nature: 'harmony' },
  { tipo: 'oposição', angulo: 180, orbMax: 10, nature: 'tension' },
];
export function calcularAspectos(posicoes: PosicaoPlaneta[]): Aspecto[] {
  const aspectos: Aspecto[] = [];
  for (let i = 0; i < posicoes.length; i++) {
    for (let j = i + 1; j < posicoes.length; j++) {
      const p1 = posicoes[i];
      const p2 = posicoes[j];
      for (const aspecto of ASPECTOS) {
        const diferenca = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
        const orb = Math.abs(diferenca - aspecto.angulo);
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
function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}