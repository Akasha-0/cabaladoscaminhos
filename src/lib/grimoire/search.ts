import { prisma } from '@/lib/prisma';

export interface GrimoireContext {
  entries: Array<{
    titulo: string;
    conteudo: string;
    categoria: string;
    metadata: Record<string, unknown>;
  }>;
  pillarsConsulted: string[];
}

export interface ChartContext {
  element?: string;       // elemento dominante astrológico
  oduId?: string;         // id do Odu de nascimento
  lifePath?: number;      // Caminho de Vida
  activeBodies?: number[]; // Corpos tântricos ativos (1-11)
  tensionBodies?: number[]; // Corpos em tensão
}

const FALLBACK_CATEGORIES = ['Botânica', 'Odus', 'Diagnóstico'];

export async function searchGrimoire(
  _question: string,
  chartCtx: ChartContext,
  limit = 5
): Promise<GrimoireContext> {
  try {
    const results: Array<{
      titulo?: string;
      conteudo: string;
      categoria: string;
      metadata: Record<string, unknown>;
      slug: string;
    }> = [];

    // 1. Filtro por metadados JSONB + texto baseado no chartCtx
    if (chartCtx.element) {
      const element = chartCtx.element;

      // Use raw query to filter by JSONB metadata field
      // Matches: metadata->>'elemento' = element OR metadata->'elementos' @> '["element"]'
      const byElement = await prisma.$queryRaw<
        Array<{ slug: string; categoria: string; conteudo: string; metadata: unknown }>
      >`
        SELECT slug, categoria, conteudo, metadata
        FROM grimoire_entries
        WHERE
          metadata->>'elemento' = ${element}
          OR metadata->'elementos' @> ${JSON.stringify([element])}::jsonb
        LIMIT ${limit}
      `;

      for (const row of byElement) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    if (chartCtx.oduId && results.length < limit) {
      const oduId = chartCtx.oduId;
      const remaining = limit - results.length;
      const existingSlugs = results.map((r) => r.slug);

      // Search by oduId in metadata or content ILIKE
      const byOdu = await prisma.$queryRaw<
        Array<{ slug: string; categoria: string; conteudo: string; metadata: unknown }>
      >`
        SELECT slug, categoria, conteudo, metadata
        FROM grimoire_entries
        WHERE slug != ALL(${existingSlugs}::text[])
          AND (
            metadata->>'oduId' = ${oduId}
            OR conteudo ILIKE ${'%' + oduId + '%'}
          )
        LIMIT ${remaining}
      `;

      for (const row of byOdu) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    // 2. Fallback por categoria se nenhum resultado ou ainda temos espaço
    if (results.length < limit) {
      const remaining = limit - results.length;
      const existingSlugs = results.map((r) => r.slug);

      const byCategory = await prisma.grimoireEntry.findMany({
        where: {
          categoria: { in: FALLBACK_CATEGORIES },
          slug: existingSlugs.length > 0 ? { notIn: existingSlugs } : undefined,
        },
        take: remaining,
        select: {
          slug: true,
          categoria: true,
          conteudo: true,
          metadata: true,
        },
      });

      for (const row of byCategory) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    // 3. Derive pillarsConsulted from unique categories found
    const pillarsConsulted = [...new Set(results.map((r) => r.categoria))];

    return {
      entries: results.map((r) => ({
        titulo: r.titulo ?? r.slug,
        conteudo: r.conteudo,
        categoria: r.categoria,
        metadata: r.metadata,
      })),
      pillarsConsulted,
    };
  } catch {
    // Gracefully handle empty grimoire or DB errors
    return { entries: [], pillarsConsulted: [] };
  }
}
