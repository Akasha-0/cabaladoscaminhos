// ============================================================================
// Akasha Portal — Articles Seed (Wave 29, 2026-06-28)
// ============================================================================
// Idempotent seed script que lê articles-seed.json e faz upsert via Prisma.
//
// Mapeamento de evidências (JSON → Prisma EvidenceLevel enum):
//   META_ANALYSIS / SYSTEMATIC_REVIEW  → HIGH
//   RCT / COHORT                       → MEDIUM
//   CASE_REPORT                        → LOW
//   ARTICLE / ESSAY / POLICY           → ANECDOTAL (ou HIGH se for marco
//                                        regulatório, ex.: portaria SUS)
//
// Uso:
//   pnpm db:generate         # prisma generate (precisa rodar antes)
//   pnpm tsx prisma/seeds/seed-articles.ts
//   # ou adicione um script: "seed:articles:w29": "tsx prisma/seeds/seed-articles.ts"
//
// Idempotência:
//   - Upsert por `slug` (Article.slug é @unique)
//   - Se rodar 2x, apenas atualiza o que mudou; não duplica
//   - sourceHash é recalculado para detectar duplicatas cross-arquivo
//
// Referências:
//   - prisma/schema.prisma (model Article)
//   - prisma/seed/articles.ts (seed legado — 20 artigos, hardcoded)
//   - docs/EVIDENCE-SEED-W29.md (curadoria)
// ============================================================================

import { PrismaClient, ArticleType, EvidenceLevel } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Compatível com module: "esnext" do tsconfig — __dirname nativo não existe.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Tipos do JSON
// ----------------------------------------------------------------------------

interface SeedArticleJson {
  slug: string;
  title: string;
  summary: string;
  /** Sempre "SCIENTIFIC_PAPER" no seed atual (consistência com schema). */
  type?: string;
  /** META_ANALYSIS | SYSTEMATIC_REVIEW | RCT | COHORT | CASE_REPORT | ARTICLE | ESSAY */
  evidenceLevel: string;
  tradition: string;
  sourceName: string;
  sourceUrl: string;
  year: number;
  tags: string[];
  authors: string[];
  doi?: string | null;
  language: string;
  curatorNotes: string;
  safetyNotes: string;
}

interface SeedResult {
  slug: string;
  status: 'created' | 'updated' | 'skipped';
  evidenceLevel: EvidenceLevel;
}

// ----------------------------------------------------------------------------
// Mapeamento de evidence level (JSON legível → enum Prisma)
// ----------------------------------------------------------------------------

function mapEvidenceLevel(raw: string, title: string): EvidenceLevel {
  const t = title.toLowerCase();
  switch (raw.toUpperCase()) {
    case 'META_ANALYSIS':
    case 'SYSTEMATIC_REVIEW':
      return EvidenceLevel.HIGH;
    case 'RCT':
    case 'COHORT':
      return EvidenceLevel.MEDIUM;
    case 'CASE_REPORT':
      return EvidenceLevel.LOW;
    case 'ESSAY':
    case 'ARTICLE':
    default:
      // Marcos regulatórios do Ministério da Saúde contam como HIGH
      // mesmo quando classificados como ARTICLE pelo autor do JSON.
      if (t.includes('sus') || t.includes('pnpic') || t.includes('portaria')) {
        return EvidenceLevel.HIGH;
      }
      return EvidenceLevel.ANECDOTAL;
  }
}

function mapArticleType(raw: string | undefined): ArticleType {
  if (!raw) return ArticleType.SCIENTIFIC_PAPER;
  const v = raw.toUpperCase();
  if (v === 'SCIENTIFIC_PAPER') return ArticleType.SCIENTIFIC_PAPER;
  if (v === 'ESSAY') return ArticleType.ESSAY;
  if (v === 'MAGAZINE_ARTICLE') return ArticleType.MAGAZINE_ARTICLE;
  if (v === 'BOOK') return ArticleType.BOOK;
  if (v === 'VIDEO') return ArticleType.VIDEO;
  if (v === 'PODCAST') return ArticleType.PODCAST;
  // default seguro para artigos acadêmicos
  return ArticleType.SCIENTIFIC_PAPER;
}

// ----------------------------------------------------------------------------
// Hash de proveniência (para detectar duplicatas cross-arquivo)
// ----------------------------------------------------------------------------

function sourceHashOf(a: SeedArticleJson): string {
  // Hash baseado em doi + título + primeiro autor. Determinístico.
  const seed = [
    a.doi ?? '',
    a.title,
    a.authors[0] ?? '',
    String(a.year),
  ].join('|').toLowerCase().trim();
  return createHash('sha256').update(seed).digest('hex').slice(0, 16);
}

// ----------------------------------------------------------------------------
// Seed principal
// ----------------------------------------------------------------------------

async function main(): Promise<void> {
  const jsonPath = join(__dirname, 'articles-seed.json');
  console.log(`📖 Lendo ${jsonPath}`);
  const raw = readFileSync(jsonPath, 'utf-8');
  const articles = JSON.parse(raw) as SeedArticleJson[];

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error('articles-seed.json está vazio ou inválido');
  }
  console.log(`📚 Encontrados ${articles.length} artigos no JSON\n`);

  const results: SeedResult[] = [];

  for (const a of articles) {
    if (!a.slug || !a.title || !a.summary) {
      console.warn(`⚠️  Pulando entrada inválida: ${JSON.stringify(a).slice(0, 80)}…`);
      results.push({ slug: a.slug ?? '?', status: 'skipped', evidenceLevel: EvidenceLevel.ANECDOTAL });
      continue;
    }

    const evidenceLevel = mapEvidenceLevel(a.evidenceLevel, a.title);
    const articleType = mapArticleType(a.type);
    const sourceHash = sourceHashOf(a);

    // content: usa summary expandido (markdown simples) — o JSON pode evoluir
    // para carregar um campo `content` separado no futuro.
    const content = [
      `## Resumo`,
      ``,
      a.summary,
      ``,
      `## Notas da Curadoria`,
      ``,
      a.curatorNotes,
      ``,
      `## Notas de Segurança`,
      ``,
      a.safetyNotes,
      ``,
      `## Fonte`,
      ``,
      a.doi ? `- **DOI:** ${a.doi}\n` : '',
      `- **Origem:** ${a.sourceName}`,
      `- **URL:** ${a.sourceUrl}`,
      `- **Ano:** ${a.year}`,
      a.language ? `- **Idioma original:** ${a.language}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const existing = await prisma.article.findUnique({
      where: { slug: a.slug },
      select: { id: true, sourceHash: true },
    });

    const data = {
      title: a.title,
      summary: a.summary,
      content,
      authors: a.authors,
      journal: a.sourceName,
      year: a.year,
      doi: a.doi ?? null,
      url: a.sourceUrl,
      tags: a.tags,
      topics: a.tags, // alias legado (mantido em paralelo)
      tradition: a.tradition,
      evidenceLevel,
      language: a.language || 'en',
      type: articleType,
      body: content, // alias legado
      externalUrl: a.sourceUrl, // alias legado
      references: {
        source: a.sourceName,
        url: a.sourceUrl,
        doi: a.doi ?? null,
        year: a.year,
      } as object,
      curatedBy: 'iyá-curator-w29',
      source: a.doi ? `doi:${a.doi}` : `manual:${a.slug}`,
      sourceHash,
      publishedAt: new Date(`${a.year}-01-01T00:00:00Z`),
    };

    await prisma.article.upsert({
      where: { slug: a.slug },
      create: data,
      update: data,
    });

    const status: SeedResult['status'] = existing ? 'updated' : 'created';
    results.push({ slug: a.slug, status, evidenceLevel });

    const symbol = status === 'created' ? '✨' : '🔄';
    console.log(`${symbol} [${evidenceLevel}] ${a.slug} — ${a.title.slice(0, 60)}…`);
  }

  // Estatísticas
  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const byLevel = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.evidenceLevel] = (acc[r.evidenceLevel] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n✅ Seed concluído`);
  console.log(`   Criados:   ${created}`);
  console.log(`   Atualizados: ${updated}`);
  console.log(`   Pulados:   ${skipped}`);
  console.log(`   Por nível:`);
  for (const [level, n] of Object.entries(byLevel)) {
    console.log(`     ${level}: ${n}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });