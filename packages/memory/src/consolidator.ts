/**
 * Consolidator — orquestra o pipeline de destilação.
 *
 *   consolidate(userId, since)
 *     → 1. Lê sources antigas (> since) via Storage/loader injetado
 *     → 2. Destila em clusters via `distillClusters()` (heurística)
 *     → 3. Persiste via `storage.replaceForAnchor()` (idempotente)
 *     → 4. Retorna ConsolidateOutput com métricas
 *
 * Esta é a função chamada pelo cron semanal `/api/cron/consolidate-memory`.
 * É 100% determinística: mesmos inputs → mesmo output.
 */

import { distillClusters } from './distillation.js';
import type {
  ConsolidateInput,
  ConsolidateOutput,
  ConsolidatedInsightRecord,
  ConsolidationSource,
} from './types.js';
import {
  buildConsolidateOutput,
  InMemoryStorage,
  type Storage,
} from './storage.js';

// ─────────────────────────────────────────────────────────────────────
// Loader abstraction
// ─────────────────────────────────────────────────────────────────────

/**
 * Loader é uma função que retorna as memórias brutas para um usuário
 * num período. Injetada no consolidator para desacoplar de Prisma.
 *
 * O caller (cron route) implementa lendo SessaoChunk + Discovery +
 * NotasConsulente do Prisma. Tests usam fixtures in-memory.
 */
export type SourceLoader = (
  args: { userId: string; since: Date }
) => Promise<ReadonlyArray<ConsolidationSource>>;

// ─────────────────────────────────────────────────────────────────────
// Default loader (in-memory, vazio)
// ─────────────────────────────────────────────────────────────────────

/** Loader vazio para tests ou quando caller injeta o seu próprio. */
export const emptyLoader: SourceLoader = async () => [];

// ─────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────

/**
 * Consolida memórias antigas em insights. Idempotente por
 * (userId, workspaceId, anchorMonth).
 *
 * @param input    Parâmetros de consolidação.
 * @param storage  Storage injetado (default InMemoryStorage).
 * @param loader   Loader de sources injetado (default emptyLoader).
 *
 * Comportamento:
 *   - Se `sources.length === 0` → não cria clusters, retorna output vazio.
 *   - Se < `minClusterSize` memórias no pilar mais frequente → não
 *     cria clusters (heurística: cluster com <3 é ruído).
 *   - Senão: distila top-N clusters e persiste (substituindo os antigos
 *     para o mesmo anchor).
 */
export async function consolidate(
  input: ConsolidateInput,
  storage: Storage = new InMemoryStorage(),
  loader: SourceLoader = emptyLoader
): Promise<ConsolidateOutput> {
  const anchorMonth = normalizeAnchor(input.anchorMonth ?? firstOfMonth(input.since));

  // 1. Carregar sources do período
  const sources = await loader({ userId: input.userId, since: input.since });

  // 2. Destilar clusters (pode retornar [] se muito poucas sources)
  const clusters = distillClusters(sources, {
    ...(input.minClusterSize !== undefined ? { minClusterSize: input.minClusterSize } : {}),
    ...(input.maxClusters !== undefined ? { maxClusters: input.maxClusters } : {}),
  });

  // 3. Mapear clusters → records
  const records: ConsolidatedInsightRecord[] = clusters.map((c) => ({
    userId: input.userId,
    workspaceId: input.workspaceId,
    theme: c.theme,
    content: c.content,
    sources: c.sources,
    pilarCounts: c.pilarCounts,
    confidence: c.confidence,
    anchorMonth,
    generatedBy: 'heuristic-v1',
  }));

  // 4. Persistir (idempotente)
  const result = await storage.replaceForAnchor({
    userId: input.userId,
    workspaceId: input.workspaceId,
    anchorMonth,
    records,
  });

  // 5. Output com métricas
  return buildConsolidateOutput({
    userId: input.userId,
    workspaceId: input.workspaceId,
    anchorMonth,
    sourcesRead: sources.length,
    records,
    inserted: result.inserted,
  });
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Normaliza um anchorMonth: zera horas/minutos/segundos/millis e força
 * UTC. Garante que (anchorMonth1.getTime() === anchorMonth2.getTime())
 * para o mesmo "mês conceitual".
 */
export function normalizeAnchor(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  out.setUTCDate(1);
  return out;
}

/** Primeiro dia do mês UTC de uma data (normalizado). */
export function firstOfMonth(d: Date): Date {
  return normalizeAnchor(d);
}
