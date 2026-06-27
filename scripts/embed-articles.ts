#!/usr/bin/env tsx
/* eslint-disable no-console */
// ============================================================================
// Akasha Portal — Embed Articles (popula pgvector embedding)
// ============================================================================
// Gera embeddings OpenAI text-embedding-3-small e persiste em
// Article.embedding (pgvector). Habilita busca por similaridade
// (search_similar_articles function).
//
// Uso:
//   pnpm embed:articles                  # todos os artigos
//   pnpm embed:articles --all            # idem
//   pnpm embed:articles <slug1> <slug2>  # slugs específicos
//   pnpm embed:articles --tradition=cabala
//
// Requisitos:
//   - OPENAI_API_KEY em .env.local
//   - Prisma migrations aplicadas (pgvector enable)
//
// Refs:
//   - src/lib/ai/embeddings.ts (helpers)
//   - prisma/migrations/20260627_000000_pgvector_enable/migration.sql
// ============================================================================

import { config } from dotenv;
import { prisma } from '../src/lib/prisma';
import { embedArticlesBatch } from '../src/lib/ai/embeddings';

config({ path: '.env.local' });

async function getTargetSlugs(args: string[]): Promise<string[]> {
  // --all
  if (args.includes('--all')) {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    return articles.map((a) => a.slug);
  }

  // --tradition=X
  const traditionArg = args.find((a) => a.startsWith('--tradition='));
  if (traditionArg) {
    const tradition = traditionArg.split('=')[1];
    if (!tradition) {
      console.error('Faltou valor em --tradition=');
      process.exit(1);
    }
    const articles = await prisma.article.findMany({
      where: { tradition, publishedAt: { not: null } },
      select: { slug: true },
    });
    return articles.map((a) => a.slug);
  }

  // slugs como args posicionais
  if (args.length > 0) {
    return args;
  }

  console.error('Uso: pnpm embed:articles [--all | --tradition=X | <slug1> <slug2> ...]');
  process.exit(1);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY nao configurada. Defina em .env.local.');
    process.exit(1);
  }

  const slugs = await getTargetSlugs(process.argv.slice(2));
  console.log(`🔮 Gerando embeddings para ${slugs.length} artigos...`);

  // Buscar IDs pelos slugs
  const articles = await prisma.article.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, title: true },
  });

  if (articles.length === 0) {
    console.error('Nenhum artigo encontrado com os slugs fornecidos.');
    process.exit(1);
  }

  console.log(`✅ Encontrados ${articles.length} artigos:`);
  for (const a of articles) {
    console.log(`   - ${a.slug}`);
  }

  const ids = articles.map((a) => a.id);
  const result = await embedArticlesBatch(ids);

  console.log(`\n📊 Resultado:`);
  console.log(`   - succeeded: ${result.succeeded}`);
  console.log(`   - failed: ${result.failed.length}`);

  if (result.failed.length > 0) {
    console.log('\n❌ Falhas:');
    for (const f of result.failed) {
      console.log(`   - ${f.id}: ${f.error}`);
    }
  }

  console.log('\n✨ Embeddings persistidas em Article.embedding (pgvector vector(1536))');
  console.log('   Busca por similaridade disponivel via search_similar_articles() SQL function');
}

main()
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });