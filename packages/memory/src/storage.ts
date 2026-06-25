/**
 * Storage — CRUD Prisma para `ConsolidatedInsight`.
 *
 * Decisão de design: a package @akasha/memory NÃO tem dependência
 * direta em @prisma/client (mantém puramente TypeScript-puro, testável
 * sem DB). A integração com Prisma fica via uma interface `Storage`
 * injetada. Isso permite:
 *   1. Tests unitários do consolidator.ts SEM precisar de DB.
 *   2. Implementações alternativas (in-memory para tests, pg nativo
 *      para bulk insert em cron, etc).
 *
 * A implementação `PrismaStorage` (em apps/akasha-portal) faz o
 * mapeamento Prisma → nossa interface. O consolidator recebe
 * `storage: Storage` por injeção.
 */

import type {
  ConsolidatedInsightRecord,
  PilarCounts,
  ConsolidateOutput,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────
// Interface pública
// ─────────────────────────────────────────────────────────────────────

/**
 * Record retornado por `listTop()`. Equivalente ao `ConsolidatedInsight`
 * do schema Prisma, mas sem dependência de @prisma/client.
 */
export interface StoredInsight {
  id: string;
  userId: string;
  workspaceId: string;
  theme: string;
  content: string;
  sources: unknown; // Json — parsed object, depende do payload original
  pilarCounts: PilarCounts;
  confidence: number;
  anchorMonth: Date;
  generatedBy: string;
  createdAt: Date;
}

/**
 * Storage abstrato. Implementações concretas vivem fora deste package
 * para manter @akasha/memory livre de deps de runtime.
 */
export interface Storage {
  /**
   * Substitui todos os insights do (userId, workspaceId, anchorMonth)
   * pelos novos records. Idempotente — re-rodar no mesmo mês sobrescreve.
   */
  replaceForAnchor(args: {
    userId: string;
    workspaceId: string;
    anchorMonth: Date;
    records: ReadonlyArray<ConsolidatedInsightRecord>;
  }): Promise<{ inserted: number }>;

  /** Top-N insights do (userId, workspaceId), ordenado por recência. */
  listTop(args: {
    userId: string;
    workspaceId: string;
    limit: number;
  }): Promise<StoredInsight[]>;
}

// ─────────────────────────────────────────────────────────────────────
// In-memory implementation (default p/ tests e p/ cron MVP)
// ─────────────────────────────────────────────────────────────────────

/**
 * Implementação in-memory. NÃO persiste entre restarts. Usada por:
 *   - Testes do consolidator (não precisam de DB).
 *   - Cron MVP se, em ambiente dev, PrismaClient não estiver disponível
 *     (graceful degradation).
 */
export class InMemoryStorage implements Storage {
  private rows: StoredInsight[] = [];
  private counter = 0;

  // eslint-disable-next-line @typescript-eslint/require-await
  async replaceForAnchor(args: {
    userId: string;
    workspaceId: string;
    anchorMonth: Date;
    records: ReadonlyArray<ConsolidatedInsightRecord>;
  }): Promise<{ inserted: number }> {
    const { userId, workspaceId, anchorMonth, records } = args;
    const now = new Date();

    // Remove insights existentes para o mesmo anchor
    this.rows = this.rows.filter(
      (r) =>
        !(
          r.userId === userId &&
          r.workspaceId === workspaceId &&
          r.anchorMonth.getTime() === anchorMonth.getTime()
        )
    );

    let inserted = 0;
    for (const rec of records) {
      this.counter += 1;
      const row: StoredInsight = {
        id: `mem-${this.counter}`,
        userId: rec.userId,
        workspaceId: rec.workspaceId,
        theme: rec.theme,
        content: rec.content,
        sources: rec.sources,
        pilarCounts: rec.pilarCounts,
        confidence: rec.confidence,
        anchorMonth: rec.anchorMonth,
        generatedBy: rec.generatedBy,
        createdAt: now,
      };
      this.rows.push(row);
      inserted++;
    }
    return { inserted };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listTop(args: {
    userId: string;
    workspaceId: string;
    limit: number;
  }): Promise<StoredInsight[]> {
    const { userId, workspaceId, limit } = args;
    return this.rows
      .filter((r) => r.userId === userId && r.workspaceId === workspaceId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Helpers para testes — não fazem parte da interface Storage.
  clear(): void {
    this.rows = [];
    this.counter = 0;
  }

  all(): ReadonlyArray<StoredInsight> {
    return this.rows;
  }
}

/**
 * Helper para construir uma ConsolidateOutput a partir dos records
 * + métricas. Usado pelo consolidator.ts e pelos callers (cron/route).
 */
export function buildConsolidateOutput(args: {
  userId: string;
  workspaceId: string;
  anchorMonth: Date;
  sourcesRead: number;
  records: ReadonlyArray<ConsolidatedInsightRecord>;
  inserted: number;
}): ConsolidateOutput {
  return {
    userId: args.userId,
    workspaceId: args.workspaceId,
    anchorMonth: args.anchorMonth.toISOString(),
    sourcesRead: args.sourcesRead,
    clustersCreated: args.records.length,
    insights: [...args.records],
  };
}
