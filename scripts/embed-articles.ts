#!/usr/bin/env tsx
 
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

import { config } from 'dotenv';
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
    select: { id: true, slug: true, title: true, references: true, source: true },
  });

  if (articles.length === 0) {
    console.error('Nenhum artigo encontrado com os slugs fornecidos.');
    process.exit(1);
  }

  console.log(`✅ Encontrados ${articles.length} artigos:`);
  for (const a of articles) {
    const refsCount = Array.isArray(a.references) ? a.references.length : 0;
    console.log(`   - ${a.slug} (${refsCount} citations)`);
  }

  // Wave 11 (Iyá): enriquece o texto de embedding com citations + relatedArticles
  // para que a busca semântica considere o contexto editorial (autor, DOI, links)
  for (const article of articles) {
    if (!Array.isArray(article.references) || article.references.length === 0) continue;

    // Extrai metadata editorial (Wave 11+)
    let editorialMeta: { citations?: string[]; relatedArticles?: string[] } = {};
    if (typeof article.source === 'string' && article.source.startsWith('{')) {
      try {
        editorialMeta = JSON.parse(article.source);
      } catch {
        // ignore parse errors
      }
    }

    const citations = editorialMeta.citations ?? article.references.map((r: unknown) => {
      const ref = r as { url?: string; title?: string };
      return ref.url ?? '';
    }).filter(Boolean);

    if (citations.length === 0) continue;

    // Constrói um "summary enriquecido" com citations para indexação
    // (não persistimos — só usamos para gerar embedding com contexto)
    const enrichedText = `\n\nCITATIONS (${citations.length}):\n${citations.join('\n')}`;

    // Sobrescreve embedding com texto enriquecido (chamada adicional)
    try {
      const { generateEmbedding } = await import('../src/lib/ai/embeddings');
      const embedding = await generateEmbedding(
        `${article.title}\n\n${enrichedText}`.slice(0, 8000),
      );
      const vectorStr = `[${embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Article" SET embedding = $1::vector WHERE id = $2`,
        vectorStr,
        article.id,
      );
      console.log(`   ✓ ${article.slug}: embedding enriquecido com ${citations.length} citations`);
    } catch (err) {
      console.warn(`   ⚠ ${article.slug}: falhou enrichment (${err instanceof Error ? err.message : err})`);
    }
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