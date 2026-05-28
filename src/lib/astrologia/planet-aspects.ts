/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Aspecto, AspectoTipo, PosicaoPlaneta, Planeta } from './tipos';
import { getAspectMeaning } from './aspect-meanings';
import { getSymbol } from './symbols';

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

const PLANETAS_ASPECTOS: Planeta[] = [
  'sol',
  'lua',
  'mercurio',
  'venus',
  'marte',
  'jupiter',
  'saturno',
  'urano',
  'netuno',
  'plutao',
];

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

export interface AspectWithSymbol {
  planeta1: Planeta;
  planeta2: Planeta;
  tipo: AspectoTipo;
  angulo: number;
  orb: number;
  orbExato: number;
  aplicativo: boolean;
  simbolo: string;
}

function calculateAspectAngle(p1: PosicaoPlaneta, p2: PosicaoPlaneta): number {
  const diff = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
  return diff;
}

function determineAplicativo(p1: PosicaoPlaneta, p2: PosicaoPlaneta): boolean {
  return p1.velocidade > p2.velocidade;
}

export interface GetAspectsOptions {
  includeNodes?: boolean;
  includeChiron?: boolean;
  strictOrb?: boolean;
}

function filterPositionsForAspects(
  positions: PosicaoPlaneta[],
  options: GetAspectsOptions
): PosicaoPlaneta[] {
  const restricted: Planeta[] = [];

  if (!options.includeNodes) {
    restricted.push('node_norte', 'node_sul');
  }

  if (!options.includeChiron) {
    restricted.push('quiron');
  }

  return positions.filter((p) => !restricted.includes(p.planeta));
}

function computeOrbExato(diff: number, angulo: number): number {
  return Math.abs(diff - angulo);
}

export function getAspects(
  positions: PosicaoPlaneta[],
  options: GetAspectsOptions = {}
): AspectWithSymbol[] {
  const filtered = filterPositionsForAspects(positions, options);
  const aspectos: AspectWithSymbol[] = [];

  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const p1 = filtered[i];
      const p2 = filtered[j];

      for (const aspecto of ASPECTOS) {
        const diff = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
        const orb = Math.abs(diff - aspecto.angulo);
        const orbMax = options.strictOrb ? aspecto.orbMax * 0.8 : aspecto.orbMax;

        if (orb <= orbMax) {
          aspectos.push({
            planeta1: p1.planeta,
            planeta2: p2.planeta,
            tipo: aspecto.tipo,
            angulo: aspecto.angulo,
            orb,
            orbExato: computeOrbExato(diff, aspecto.angulo),
            aplicativo: determineAplicativo(p1, p2),
            simbolo: getSymbol('aspect', aspecto.tipo),
          });
        }
      }
    }
  }

  aspectos.sort((a, b) => a.orb - b.orb);

  return aspectos;
}

export function getAspectsByPlanet(
  positions: PosicaoPlaneta[],
  planeta: Planeta,
  options?: GetAspectsOptions
): AspectWithSymbol[] {
  const aspectos = getAspects(positions, options);
  return aspectos.filter((a) => a.planeta1 === planeta || a.planeta2 === planeta);
}

export function getAspectsByType(
  positions: PosicaoPlaneta[],
  tipo: AspectoTipo,
  options?: GetAspectsOptions
): AspectWithSymbol[] {
  const aspectos = getAspects(positions, options);
  return aspectos.filter((a) => a.tipo === tipo);
}

export function getAspectStrength(aspect: AspectWithSymbol): 'alto' | 'medio' | 'baixo' {
  if (aspect.orb <= 2) return 'alto';
  if (aspect.orb <= 5) return 'medio';
  return 'baixo';
}

export function getAspectsForPlanet(
  positions: PosicaoPlaneta[],
  planeta: Planeta,
  options?: GetAspectsOptions
): Array<AspectWithSymbol & { significado: ReturnType<typeof getAspectMeaning> }> {
  const aspectos = getAspectsByPlanet(positions, planeta, options);
  return aspectos.map((a) => ({
    ...a,
    significado: getAspectMeaning(a.tipo),
  }));
}

export function getAspectGrid(positions: PosicaoPlaneta[]): number[][] {
  const filtered = filterPositionsForAspects(positions, { includeNodes: false, includeChiron: false });
  const n = filtered.length;
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p1 = filtered[i];
      const p2 = filtered[j];

      for (const aspecto of ASPECTOS) {
        const diff = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
        const orb = Math.abs(diff - aspecto.angulo);

        if (orb <= aspecto.orbMax) {
          const idx = ASPECTOS.indexOf(aspecto);
          grid[i][j] = idx;
          grid[j][i] = idx;
        }
      }
    }
  }

  return grid;
}

export function getAspectSummary(positions: PosicaoPlaneta[]): {
  total: number;
  harmonicos: number;
  tensos: number;
  neutros: number;
} {
  const aspectos = getAspects(positions);
  const harmonicos = aspectos.filter((a) => a.tipo === 'trino' || a.tipo === 'sextil').length;
  const tensos = aspectos.filter((a) => a.tipo === 'quadratura' || a.tipo === 'oposição').length;
  const neutros = aspectos.filter((a) => a.tipo === 'conjunção').length;

  return {
    total: aspectos.length,
    harmonicos,
    tensos,
    neutros,
  };
}