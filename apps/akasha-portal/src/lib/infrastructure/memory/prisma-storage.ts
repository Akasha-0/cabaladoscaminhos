/**
 * PrismaStorage — adapter de Prisma para o Storage abstrato do
 * pacote @akasha/memory.
 *
 * Wave 31.5 — Long-term Memory Distillation.
 *
 * Mantém a separação:
 *   - @akasha/memory é puro TypeScript (sem deps runtime).
 *   - Aqui, em apps/akasha-portal, instanciamos o PrismaClient e
 *     implementamos a interface `Storage` do package.
 *
 * Substitui todos os ConsolidatedInsight do (userId, workspaceId,
 * anchorMonth) pelos novos — idempotente.
 *
 * NOTA sobre tipagem: NÃO importamos `PrismaClient` diretamente.
 * Em vez disso, tipamos o client como `unknown` e fazemos casts
 * estruturais (`prisma as PrismaLike`). Isso porque em algumas
 * environments (CI, typecheck isolado) o cliente Prisma gerado
 * pode não ter o model novo ainda (`ConsolidatedInsight`). O cast
 * mantém o typecheck verde e o runtime correto após `prisma generate`.
 */

import type {
  Storage,
  StoredInsight,
  ConsolidatedInsightRecord,
  ConsolidateOutput,
  ConsolidationSource,
} from '@akasha/memory';
import { buildConsolidateOutput } from '@akasha/memory';

/**
 * Forma mínima do PrismaClient que usamos. Tipagem estrutural para
 * sobreviver a re-generations do schema. Não usamos PrismaClient
 * diretamente porque ele só existe após `prisma generate`.
 */
interface PrismaLike {
  consolidatedInsight: {
    deleteMany: (args: {
      where: { userId: string; workspaceId: string; anchorMonth: Date };
    }) => Promise<unknown>;
    createMany: (args: {
      data: Array<Record<string, unknown>>;
    }) => Promise<{ count: number }>;
    findMany: (args: {
      where: { userId: string; workspaceId: string };
      orderBy: { createdAt: 'desc' };
      take: number;
    }) => Promise<Array<Record<string, unknown>>>;
  };
  sessaoChunk: {
    findMany: (args: Record<string, unknown>) => Promise<
      Array<{
        id: string;
        sessaoId: string;
        titulo: string | null;
        conteudo: string | null;
        createdAt: Date;
        sessao: {
          userId: string;
          workspaceId: string;
          tipo: string;
        };
      }>
    >;
  };
}

export class PrismaStorage implements Storage {
  constructor(private readonly prisma: PrismaLike) {}

  async replaceForAnchor(args: {
    userId: string;
    workspaceId: string;
    anchorMonth: Date;
    records: ReadonlyArray<ConsolidatedInsightRecord>;
  }): Promise<{ inserted: number }> {
    const { userId, workspaceId, anchorMonth, records } = args;

    // Idempotência: apaga insights antigos do mesmo anchor
    await this.prisma.consolidatedInsight.deleteMany({
      where: { userId, workspaceId, anchorMonth },
    });

    if (records.length === 0) return { inserted: 0 };

    // Bulk insert (createMany é eficiente — sem callbacks individuais)
    const data = records.map((r) => ({
      userId: r.userId,
      workspaceId: r.workspaceId,
      theme: r.theme,
      content: r.content,
      sources: r.sources as unknown as object, // Prisma aceita objeto JSON
      pillarCounts: r.pilarCounts as unknown as object,
      confidence: r.confidence,
      anchorMonth: r.anchorMonth,
      generatedBy: r.generatedBy,
    }));

    const created = await this.prisma.consolidatedInsight.createMany({ data });
    return { inserted: created.count };
  }

  async listTop(args: {
    userId: string;
    workspaceId: string;
    limit: number;
  }): Promise<StoredInsight[]> {
    const rows = await this.prisma.consolidatedInsight.findMany({
      where: { userId: args.userId, workspaceId: args.workspaceId },
      orderBy: { createdAt: 'desc' },
      take: args.limit,
    });

    return rows.map((r) => ({
      id: r['id'] as string,
      userId: r['userId'] as string,
      workspaceId: r['workspaceId'] as string,
      theme: r['theme'] as string,
      content: r['content'] as string,
      sources: r['sources'],
      pilarCounts: r['pillarCounts'] as StoredInsight['pilarCounts'],
      confidence: r['confidence'] as number,
      anchorMonth: r['anchorMonth'] as Date,
      generatedBy: r['generatedBy'] as string,
      createdAt: r['createdAt'] as Date,
    }));
  }
}

// ─────────────────────────────────────────────────────────────────────
// SourceLoader — Prisma → ConsolidationSource
// ─────────────────────────────────────────────────────────────────────

/**
 * Lê as memórias antigas (> since) do Prisma e converte para
 * ConsolidationSource. Por enquanto lemos APENAS SessaoChunk —
 * fonte canônica de memória de sessão no schema atual. Quando o
 * model `Discovery` for criado (wave futura), basta adicionar aqui.
 *
 * Fontes lidas:
 *   - SessaoChunk (vinculado a Sessao do userId)
 *   - Filtrado por createdAt < since (memórias > 30 dias)
 */
export function makePrismaSourceLoader(prisma: PrismaLike) {
  return async ({
    userId,
    since,
  }: {
    userId: string;
    since: Date;
  }): Promise<ReadonlyArray<ConsolidationSource>> => {
    const chunks = await prisma.sessaoChunk.findMany({
      where: {
        sessao: { userId },
        createdAt: { lt: since },
      },
      include: {
        sessao: {
          select: {
            userId: true,
            workspaceId: true,
            tipo: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 1000, // sane bound para o MVP
    });

    return chunks.map((c) => ({
      type: 'sessao_chunk',
      id: c.id,
      title: c.titulo ?? `Sessão ${c.sessaoId.slice(-8)}`,
      content: c.conteudo ?? '',
      createdAt: c.createdAt,
    }));
  };
}

// ─────────────────────────────────────────────────────────────────────
// consolidateForUser — helper usado pelas API routes
// ─────────────────────────────────────────────────────────────────────

/**
 * Wrapper de alto nível: carrega sources + destila + persiste.
 * Retorna ConsolidateOutput com métricas.
 *
 * Aceita a `since` em Date. Se não fornecido, default = 30 dias atrás.
 */
export async function consolidateForUser(args: {
  prisma: PrismaLike;
  userId: string;
  workspaceId: string;
  since?: Date;
  minClusterSize?: number;
  maxClusters?: number;
}): Promise<ConsolidateOutput> {
  const { prisma, userId, workspaceId, since, minClusterSize, maxClusters } = args;

  const sinceDate = since ?? defaultSince();
  const anchorMonth = firstOfMonthUTC(sinceDate);

  const storage = new PrismaStorage(prisma);
  const loader = makePrismaSourceLoader(prisma);

  const sources = await loader({ userId, since: sinceDate });

  // Lazy import — mantém tree-shaking-friendly e evita ciclos
  const { distillClusters } = await import('@akasha/memory');

  const clusters = distillClusters(sources, {
    ...(minClusterSize !== undefined ? { minClusterSize } : {}),
    ...(maxClusters !== undefined ? { maxClusters } : {}),
  });

  const records: ConsolidatedInsightRecord[] = clusters.map((c) => ({
    userId,
    workspaceId,
    theme: c.theme,
    content: c.content,
    sources: c.sources,
    pilarCounts: c.pilarCounts,
    confidence: c.confidence,
    anchorMonth,
    generatedBy: 'heuristic-v1',
  }));

  const result = await storage.replaceForAnchor({
    userId,
    workspaceId,
    anchorMonth,
    records,
  });

  return buildConsolidateOutput({
    userId,
    workspaceId,
    anchorMonth,
    sourcesRead: sources.length,
    records,
    inserted: result.inserted,
  });
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Default since = 30 dias atrás. */
function defaultSince(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** 1º dia do mês UTC de uma data. */
function firstOfMonthUTC(d: Date): Date {
  const out = new Date(d);
  out.setUTCDate(1);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}