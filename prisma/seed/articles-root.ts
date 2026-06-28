// ============================================================================
// Akasha Portal — Root Seed (Articles) — Wave 11 (2026-06-27)
// ============================================================================
// Orquestra todos os batches de artigos em ordem cronológica:
//
//   1. articles.ts          (Wave 9) — 20 artigos, 5 tradições
//   2. articles-expanded.ts (Wave 10a) — 30 artigos, 6 novas tradições
//   3. articles-batch-3.ts  (Wave 10b) — 20 artigos, 7 grupos temáticos
//   4. articles-batch-4.ts  (Wave 11) — 30 artigos, 16 tradições (Iyá)
//
// Total pós-Wave 11: 100 artigos
//
// Uso:
//   pnpm seed:articles:all         # roda todos os batches em sequência
//   pnpm seed:articles             # alias do articles-root
//
// Referências:
//   - prisma/seed/taxonomy.ts (hierarquia + tradições)
//   - docs/CONTENT-WAVE11.md (lista completa + gap analysis)
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Importa cada batch — cada um exporta ou executa sua própria main()
// Aqui usamos spawn sequencial via require() para manter compat com ESM tsx
async function runBatches() {
  const startTime = Date.now();

  console.log('🚀 Akasha Portal — Articles Root Seed (Wave 11)');
  console.log('==================================================');
  console.log('Total esperado: 100 artigos (4 batches)');
  console.log('==================================================\n');

  const before = await prisma.article.count();
  console.log(`📚 Artigos ANTES do seed: ${before}\n`);

  // Batch 1 (Wave 9)
  console.log('--- Batch 1: Wave 9 (20 artigos, 5 tradições) ---');
  await import('./articles');
  await new Promise((r) => setTimeout(r, 500)); // pequena pausa pra DB processar

  // Batch 2 (Wave 10a)
  console.log('\n--- Batch 2: Wave 10a (30 artigos, 6 novas tradições) ---');
  await import('./articles-expanded');
  await new Promise((r) => setTimeout(r, 500));

  // Batch 3 (Wave 10b)
  console.log('\n--- Batch 3: Wave 10b (20 artigos, 7 grupos temáticos) ---');
  await import('./articles-batch-3');
  await new Promise((r) => setTimeout(r, 500));

  // Batch 4 (Wave 11) — Iyá
  console.log('\n--- Batch 4: Wave 11 (30 artigos, 16 tradições) ---');
  await import('./articles-batch-4');

  const after = await prisma.article.count();
  const elapsed = Date.now() - startTime;

  console.log('\n==================================================');
  console.log(`✅ Seed concluído em ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`📚 Artigos DEPOIS do seed: ${after}`);
  console.log(`📈 Delta: ${after - before} (esperado: +100 se DB estava vazio)`);

  // Distribuição por tradição
  const distribution = await prisma.article.groupBy({
    by: ['tradition'],
    _count: { _all: true },
    where: { publishedAt: { not: null } },
    orderBy: { _count: { tradition: 'desc' } },
  });

  console.log('\n📊 Distribuição por tradição (pós-Wave 11):');
  for (const t of distribution) {
    const flag = t._count._all >= 5 ? '✅' : '⚠️';
    console.log(`   ${flag} ${(t.tradition ?? 'sem_tradition').padEnd(30)} ${t._count._all}`);
  }

  const totalTraditions = distribution.length;
  const traditionsWithFivePlus = distribution.filter((t) => t._count._all >= 5).length;

  console.log(`\n🎯 Total de tradições: ${totalTraditions}`);
  console.log(`🎯 Tradições com 5+ artigos: ${traditionsWithFivePlus}`);

  if (traditionsWithFivePlus >= 12) {
    console.log(`✅ Meta atingida (12+ tradições com 5+ cada).`);
  } else {
    console.log(`⚠️ Meta parcial (meta: 12, atual: ${traditionsWithFivePlus}).`);
  }

  // Próximas ondas sugeridas
  const low = distribution.filter((t) => (t._count._all ?? 0) < 5 && t.tradition);
  if (low.length > 0) {
    console.log('\n📌 Tradições com <5 artigos (sugestão para Wave 12):');
    for (const t of low) {
      console.log(`   - ${t.tradition}: ${t._count._all}`);
    }
  }
}

runBatches()
  .catch((err) => {
    console.error('❌ Root seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
