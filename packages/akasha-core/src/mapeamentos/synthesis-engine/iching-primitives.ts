/**
 * @akasha/core — I Ching Primitives Engine
 *
 * Lógica de transformação da tabela BASE (dados crus dos 64 hexagramas)
 * para a tabela compilada ICHING_PRIMITIVES (PrimitiveContribution[]).
 *
 * Cada hexagrama 1–64 é mapeado para 1–3 PrimitiveContribution com
 * intensidade base 7–10 e polaridade 'luz' ou 'ambas' (nível gift).
 *
 * Usar getIChingContribution() (iching-contribution.ts) para versões
 * ajustadas por nível shadow|gift|siddhi.
 */
import type { Polaridade } from '../types';
import type { PrimitiveContribution } from '../types';
import type { HexagramaBase } from '../iching-base';

type HexagramaBaseMap = Record<number, HexagramaBase>;

/**
 * Compila a tabela BASE de hexagramas crus numa tabela indexada
 * por número de hexagrama (1–64), contendo PrimitiveContribution[]
 * no nível gift (linha de base).
 *
 * @param base — tabela BASE de iching-base.ts
 * @returns Record<numero_hexagrama, PrimitiveContribution[]>
 */
export function compileIChingPrimitives(
  base: HexagramaBaseMap,
): Record<number, PrimitiveContribution[]> {
  return Object.fromEntries(
    Object.entries(base).map(([num, data]) => [
      Number(num),
      data.primitivos.map(({ primitivo, intensidade, polaridade, fonte }) => ({
        primitivo: primitivo as PrimitiveContribution['primitivo'],
        intensidade,
        polaridade: polaridade as Polaridade,
        fonte,
      })),
    ]),
  ) as Record<number, PrimitiveContribution[]>;
}
