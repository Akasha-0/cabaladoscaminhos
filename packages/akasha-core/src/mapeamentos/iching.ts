/**
 * @akasha/core — Mapeamentos: I Ching → Primitivos Akáshicos
 *
 * Mapeamento canônico dos 64 hexagramas do I Ching (Wilhelm/Baynes 1976)
 * para contribuições de primitivos do sistema Akáshicos.
 *
 * Cada hexagrama recebe 1–3 PrimitiveContributions baseadas na sua
 * geometria trigramática (trigrama superior × inferior) e no seu
 * significado arquetípico Wilhelm/Baynes.
 *
 * A intensidade e polaridade são ajustadas em runtime por getIChingContribution()
 * consoante o nível de expressão (shadow | gift | siddhi).
 *
 * Dados raiz em iching-base.ts; lógica de síntese em iching-contribution.ts.
 */
import { ICHING_PRIMITIVES } from './iching-base';

// ─── Re-export da API de síntese ─────────────────────────────────────────────
export { getIChingContribution } from './iching-contribution';
