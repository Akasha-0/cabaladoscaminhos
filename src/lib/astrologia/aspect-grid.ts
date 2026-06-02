// fallow-ignore-file unused-file
 import type { Aspecto, AspectoTipo, PosicaoPlaneta } from './tipos';

export interface AspectGridCell {
  exists: boolean;
  tipo: AspectoTipo | null;
  orb: number;
  strength: number;
  aplicativo: boolean;
}

export interface AspectGrid {
  positions: PosicaoPlaneta[];
  grid: AspectGridCell[][];
  aspects: Aspecto[];
  planetaIndices: Map<string, number>;
}

const ASPECTOS: { tipo: AspectoTipo; angulo: number; orbMax: number; forcaBase: number }[] = [
  { tipo: 'conjunção', angulo: 0, orbMax: 10, forcaBase: 100 },
  { tipo: 'sextil', angulo: 60, orbMax: 6, forcaBase: 60 },
  { tipo: 'quadratura', angulo: 90, orbMax: 8, forcaBase: 80 },
  { tipo: 'trino', angulo: 120, orbMax: 8, forcaBase: 70 },
  { tipo: 'oposição', angulo: 180, orbMax: 10, forcaBase: 90 },
];

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

function calculateOrb(diferenca: number, angulo: number): number {
  return Math.abs(normalizeDiff(diferenca - angulo));
}

function calculateStrength(orb: number, orbMax: number, forcaBase: number, aplicativo: boolean): number {
  const orbRatio = 1 - orb / orbMax;
  const orbStrength = orbRatio * forcaBase;

  let modalityMultiplier = 1.0;
  if (aplicativo) {
    modalityMultiplier = 1.15;
  }

  return Math.min(100, Math.round(orbStrength * modalityMultiplier));
}

function selectBestAspect(
  p1: PosicaoPlaneta,
  p2: PosicaoPlaneta
): { tipo: AspectoTipo; orb: number; strength: number; aplicativo: boolean } | null {
  let best: { tipo: AspectoTipo; orb: number; strength: number; aplicativo: boolean } | null = null;

  for (const aspecto of ASPECTOS) {
    const diferenca = p1.longitude - p2.longitude;
    const orb = calculateOrb(diferenca, aspecto.angulo);

    if (orb <= aspecto.orbMax) {
      const aplicativo = p1.velocidade > p2.velocidade;
      const strength = calculateStrength(orb, aspecto.orbMax, aspecto.forcaBase, aplicativo);

      if (!best || strength > best.strength) {
        best = { tipo: aspecto.tipo, orb, strength, aplicativo };
      }
    }
  }

  return best;
}

export function generateAspectGrid(positions: PosicaoPlaneta[]): AspectGrid {
  const n = positions.length;
  const grid: AspectGridCell[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, (): AspectGridCell => ({
      exists: false,
      tipo: null,
      orb: 0,
      strength: 0,
      aplicativo: false,
    }))
  );

  const aspects: Aspecto[] = [];
  const planetaIndices = new Map<string, number>();
  positions.forEach((pos, idx) => {
    planetaIndices.set(pos.planeta, idx);
  });

  for (let i = 0; i < n; i++) {
    grid[i][i] = {
      exists: false,
      tipo: null,
      orb: 0,
      strength: 0,
      aplicativo: false,
    };
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      const best = selectBestAspect(p1, p2);

      if (best) {
        const cell: AspectGridCell = {
          exists: true,
          tipo: best.tipo,
          orb: best.orb,
          strength: best.strength,
          aplicativo: best.aplicativo,
        };

        grid[i][j] = cell;
        grid[j][i] = { ...cell };

        aspects.push({
          planeta1: p1.planeta,
          planeta2: p2.planeta,
          tipo: best.tipo,
          orb: best.orb,
          aplicativo: best.aplicativo,
        });
      }
    }
  }

  return { positions, grid, aspects, planetaIndices };
}

export function getAspectBetween(
  grid: AspectGrid,
  planeta1: string,
  planeta2: string
): AspectGridCell | null {
  const idx1 = grid.planetaIndices.get(planeta1);
  const idx2 = grid.planetaIndices.get(planeta2);

  if (idx1 === undefined || idx2 === undefined) {
    return null;
  }

  return grid.grid[idx1][idx2];
}

export function getAspectsByType(grid: AspectGrid, tipo: AspectoTipo): Aspecto[] {
  return grid.aspects.filter(a => a.tipo === tipo);
}

export function getStrongAspects(grid: AspectGrid, minStrength: number = 70): Aspecto[] {
  const strengthMap = new Map<string, number>();

  for (const aspect of grid.aspects) {
    const p1 = aspect.planeta1;
    const p2 = aspect.planeta2;
    const idx1 = grid.planetaIndices.get(p1)!;
    const idx2 = grid.planetaIndices.get(p2)!;
    strengthMap.set(`${p1}-${p2}`, grid.grid[idx1][idx2].strength);
  }

  return grid.aspects.filter(a => {
    const key1 = `${a.planeta1}-${a.planeta2}`;
    const key2 = `${a.planeta2}-${a.planeta1}`;
    return (strengthMap.get(key1) ?? 0) >= minStrength || (strengthMap.get(key2) ?? 0) >= minStrength;
  });
}