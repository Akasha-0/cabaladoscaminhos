/**
 * @akasha/core — I Ching Contribution Engine
 *
 * Lógica de síntese: mapear hexagramas I Ching (1–64) a PrimitiveContributions
 * e ajustar intensidade/polaridade por nível de expressão.
 *
 * Exported:
 *   getIChingContribution(hexagrama, level) → PrimitiveContribution[]
 *
 * A tabela raiz ICHING_PRIMITIVES vive em iching.ts (dados versionados).
 */
import type { Polaridade, PrimitiveContribution } from './types';
import { ICHING_PRIMITIVES } from './iching';

// ─── Helper de ajuste por nível ─────────────────────────────────────────────

/**
 * Ajusta intensidade e polaridade de cada PrimitiveContribution
 * consoante o nível de expressão do pilar.
 *
 * Regras:
 * - **shadow**  → intensidade −2 (mín 5), polaridade → 'sombra'
 * - **gift**    → intensidade inalterada,    polaridade inalterada (linha de base)
 * - **siddhi**  → intensidade +1 (máx 10), polaridade → 'ambas'
 */
function ajustarNivel(
  contribs: PrimitiveContribution[],
  level: 'shadow' | 'gift' | 'siddhi'
): PrimitiveContribution[] {
  return contribs.map((c) => {
    if (level === 'shadow') {
      return {
        ...c,
        intensidade: Math.max(5, c.intensidade - 2),
        polaridade: 'sombra' as Polaridade,
      };
    }
    if (level === 'siddhi') {
      return {
        ...c,
        intensidade: Math.min(10, c.intensidade + 1),
        polaridade: 'ambas' as Polaridade,
      };
    }
    return c; // gift: inalterado
  });
}

// ─── API principal ───────────────────────────────────────────────────────────

/**
 * Retorna as PrimitiveContributions de um hexagrama I Ching,
 * filtradas e ajustadas ao nível de expressão.
 *
 * @param hexagrama  - Número do hexagrama (1–64)
 * @param level      - Nível de expressão: shadow | gift | siddhi
 * @returns Array de PrimitiveContribution ajustadas. Array vazio se hexagrama inválido.
 *
 * @example
 *   getIChingContribution(1, 'siddhi')
 *   // → [{ primitivo: 'Poder', intensidade: 10, polaridade: 'ambas', fonte: '…' }, …]
 */
export function getIChingContribution(
  hexagrama: number,
  level: 'shadow' | 'gift' | 'siddhi'
): PrimitiveContribution[] {
  if (hexagrama < 1 || hexagrama > 64 || !Number.isInteger(hexagrama)) {
    return [];
  }
  const base = ICHING_PRIMITIVES[hexagrama];
  if (!base) return [];
  return ajustarNivel(base, level);
}
