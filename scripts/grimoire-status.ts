/**
 * grimoire-status.ts
 *
 * Operabilidade do Grimório Digital: retorna contagem de entries com/sem
 * embedding pgvector, para validação operacional do pipeline Ollama.
 *
 * Uso:
 *   npm run grimoire:status
 *
 * Saída (JSON):
 *   {
 *     "total": 39,
 *     "withEmbedding": 30,
 *     "withoutEmbedding": 9,
 *     "byBiblioteca": { "ancestral": 15, "botanica": 6, "vibracional": 3, ... },
 *     "oldestUpdatedAt": "2026-05-01T...",
 *     "newestUpdatedAt": "2026-06-01T..."
 *   }
 */

import { prisma } from '../src/lib/prisma';

async function main() {
  const all = await prisma.grimoireEntry.findMany({
    select: {
      id: true,
      slug: true,
      biblioteca: true,
      updatedAt: true,
      embedding: true,
    },
  });

  const withEmbedding = all.filter((e) => e.embedding != null).length;
  const withoutEmbedding = all.length - withEmbedding;

  const byBiblioteca: Record<string, number> = {};
  for (const e of all) {
    byBiblioteca[e.biblioteca] = (byBiblioteca[e.biblioteca] ?? 0) + 1;
  }

  const sorted = [...all].sort(
    (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
  );
  const oldestUpdatedAt = sorted[0]?.updatedAt?.toISOString() ?? null;
  const newestUpdatedAt = sorted[sorted.length - 1]?.updatedAt?.toISOString() ?? null;

  const status = {
    total: all.length,
    withEmbedding,
    withoutEmbedding,
    byBiblioteca,
    oldestUpdatedAt,
    newestUpdatedAt,
  };

  console.log(JSON.stringify(status, null, 2));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('[grimoire:status] Fatal:', err);
  await prisma.$disconnect();
  process.exit(1);
});
