/**
 * @akasha/core — I Ching Base Data
 *
 * Tabela raiz dos 64 hexagramas do I Ching (Wilhelm/Baynes 1976).
 * Cada entrada contém os primitivos Akáshicos ativados pelo hexagrama
 * com intensidade base e polaridade "neutra" (nível gift).
 *
 * Este ficheiro contém apenas dados. A lógica de síntese (ajuste por nível
 * shadow|gift|siddhi) vive em iching-contribution.ts.
 *
 * Usar getIChingContribution() para PrimitiveContributions ajustadas.
 */
import type { PrimitiveContribution } from './types';
import { compileIChingPrimitives } from './synthesis-engine/iching-primitives';
export type { HexagramaBase } from './synthesis-engine/iching-base-data';
export { BASE } from './synthesis-engine/iching-base-data';
import { BASE } from './synthesis-engine/iching-base-data';

// ─── Tabela compilada: ICHING_PRIMITIVES ────────────────────────────────────
/**
 * Tabela de mapeamento de cada hexagrama I Ching (1–64) para as suas
 * contribuições de primitivos Akáshicos no nível gift (linha de base).
 *
 * Cada entrada é um array de 1–3 PrimitiveContribution com intensidade
 * base 7–10 e polaridade 'luz' ou 'ambas'.
 *
 * Usar getIChingContribution() para obter versões ajustadas por nível.
 */
export const ICHING_PRIMITIVES: Record<number, PrimitiveContribution[]> =
  compileIChingPrimitives(BASE);
