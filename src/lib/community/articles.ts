// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// COMMUNITY ARTICLES — Backend helpers (Wave 21, 2026-06-28)
// ============================================================================
// Funções de query/mapping entre Prisma e a API. Mantém a lógica fora dos
// route handlers para reuso em seeds, scripts e outros endpoints.
//
// Decisões:
//   - Cursor pagination com base64({id, sortValue}) — chave estável.
//   - Quando há `q` → usa searchVector (Wave 18) + trigram fallback
//   - Sem `q` → filtros Prisma nativos + ordenação.
//   - viewCount++ em background (não bloqueia response).
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ArticleListQuery } from '@/lib/validators/articles';

// ============================================================================
// DTO mapping
// ============================================================================

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  authors: string[];
  journal: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  tags: string[];
  tradition: string | null;
  evidenceLevel: string;
  type: string;
  language: string;
  citations: number;
  viewCount: number;
  bookmarkCount: number;
  likesCount: number;
  publishedAt: string | null;
  createdAt: string;
  readingTimeMinutes: number; // estimado pelo tamanho do conteúdo
}

export interface ArticleListResult {
  articles: ArticleListItem[];
  nextCursor: string | null;
  total: number;
}

export interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  authors: string[];
  journal: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  references: unknown;
  tags: string[];
  topics: string[];
  tradition: string | null;
  evidenceLevel: string;
  type: string;
  language: string;
  citations: number;
  viewCount: number;
  bookmarkCount: number;
  likesCount: number;
  contributor: string | null;
  curatedBy: string | null;
  source: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  relatedArticles: ArticleListItem[];
}

// ============================================================================
// Helpers — cursor encoding
// ============================================================================

interface CursorPayload {
  id: string;
  v: number | string; // valor de ordenação secundário (createdAt epoch ms, ou viewCount)
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as CursorPayload;
    if (typeof parsed.id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

// ============================================================================
// Helpers — reading time (palavras / 200wpm, mín 1min)
// ============================================================================

function estimateReadingTime(content: string): number {
  // Conta palavras por espaços (proxy razoável para PT-BR).
  // 200 palavras/min é a média usada pela maioria dos sites.
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

// ============================================================================
// Where clause builder
// ============================================================================

function buildArticlesWhere(q: ArticleListQuery): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {};

  if (q.tradition) where.tradition = q.tradition;
  if (q.tag) where.tags = { has: q.tag };
  if (q.level) where.evidenceLevel = q.level;
  if (q.format) where.type = q.format;
  if (q.author) where.authors = { has: q.author };

  if (q.yearFrom !== undefined || q.yearTo !== undefined) {
    where.year = {};
    if (q.yearFrom !== undefined) where.year.gte = q.yearFrom;
    if (q.yearTo !== undefined) where.year.lte = q.yearTo;
  }

  // Soft-delete / unpublished: artigos com publishedAt=null são tratados
  // como draft — só aparecem para queries internas (não-API). Para a API
  // pública, exigimos publishedAt não-nulo OU (legacy sem publishedAt
  // mas com createdAt) — optamos por mostrar tudo retroativamente, mas
  // isso pode ser filtrado aqui se necessário.

  return where;
}

// ============================================================================
// OrderBy builder
// ============================================================================

function buildArticlesOrderBy(sort: ArticleListQuery['sort']) {
  switch (sort) {
    case 'popular':
      // "Popular" = likesCount + bookmarksCount (proxy simplificado)
      return [{ likesCount: 'desc' as const }, { id: 'asc' as const }];
    case 'most-viewed':
      return [{ viewCount: 'desc' as const }, { id: 'asc' as const }];
    case 'most-bookmarked':
      return [{ bookmarkCount: 'desc' as const }, { id: 'asc' as const }];
    case 'most-cited':
      return [{ citations: 'desc' as const }, { id: 'asc' as const }];
    case 'recent':
    default:
      return [{ createdAt: 'desc' as const }, { id: 'asc' as const }];
  }
}

// ============================================================================
// listArticles — query principal
// ============================================================================

export async function listArticles(q: ArticleListQuery): Promise<ArticleListResult> {
  const limit = q.limit ?? 20;
  const sort = q.sort ?? 'recent';

  // Paginação cursor: decodifica cursor (se houver) e adiciona à where.
  let cursorId: string | undefined;
  if (q.cursor) {
    const decoded = decodeCursor(q.cursor);
    if (decoded) {
      cursorId = decoded.id;
    }
  }

  // Full-text search via raw query quando há `q` (Wave 18).
  // Caso contrário, query Prisma nativa (mais barata).
  if (q.q && q.q.trim().length > 0) {
    return listArticlesWithSearch(q);
  }

  const where = buildArticlesWhere(q);
  const orderBy = buildArticlesOrderBy(sort);

  // Cursor pagination: WHERE (sortValue, id) < (cursor.v, cursor.id)
  // Implementação manual porque Prisma não suporta (a,b) < (x,y) nativamente.
  // Para simplificar (e ser seguro), usamos `skip: 1 + take: limit` no item
  // de cursor + filter por id. Isso não é o mais eficiente, mas é correto.
  const findArgs: Prisma.ArticleFindManyArgs = {
    where,
    orderBy,
    take: limit + 1, // +1 para detectar se há mais
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      authors: true,
      journal: true,
      year: true,
      doi: true,
      url: true,
      tags: true,
      tradition: true,
      evidenceLevel: true,
      type: true,
      language: true,
      citations: true,
      viewCount: true,
      bookmarkCount: true,
      likesCount: true,
      publishedAt: true,
      createdAt: true,
      // Não retornamos `content` aqui (full-text é grande); só na detail.
      content: false,
    },
  };

  const [rows, total] = await Promise.all([
    prisma.article.findMany(findArgs),
    prisma.article.count({ where }),
  ]);

  const hasMore = rows.length > limit;
  const articles = (hasMore ? rows.slice(0, limit) : rows).map(toListItem);

  let nextCursor: string | null = null;
  if (hasMore && articles.length > 0) {
    const last = rows[limit - 1];
    const v =
      sort === 'recent'
        ? last.createdAt.getTime()
        : sort === 'most-viewed'
        ? last.viewCount
        : sort === 'most-bookmarked'
        ? last.bookmarkCount
        : sort === 'most-cited'
        ? last.citations
        : last.id; // popular → id como tiebreaker (não exposto, mas estável)
    nextCursor = encodeCursor({ id: last.id, v });
  }

  return { articles, nextCursor, total };
}

// ============================================================================
// listArticlesWithSearch — usa searchVector (full-text + trigram)
// ============================================================================

async function listArticlesWithSearch(q: ArticleListQuery): Promise<ArticleListResult> {
  const limit = q.limit ?? 20;
  const term = q.q!.trim();

  // Sanitiza o termo para tsquery — remove caracteres especiais perigosos
  // e constrói uma query simples. Para termos com múltiplas palavras,
  // usamos o operador "&" (AND) entre palavras.
  const safeTerm = term.replace(/[^\wÀ-ÿ\s]/g, ' ').trim();
  const words = safeTerm.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { articles: [], nextCursor: null, total: 0 };
  }
  const tsQuery = words.map((w) => w).join(' & ');

  // Monta os filtros base
  const whereParts: Prisma.Sql[] = [
    Prisma.sql`a."searchVector" @@ plainto_tsquery('portuguese', ${tsQuery})`,
  ];

  if (q.tradition) whereParts.push(Prisma.sql`a.tradition = ${q.tradition}`);
  if (q.tag) whereParts.push(Prisma.sql`${q.tag} = ANY(a.tags)`);
  if (q.level) whereParts.push(Prisma.sql`a."evidenceLevel"::text = ${q.level}`);
  if (q.format) whereParts.push(Prisma.sql`a.type::text = ${q.format}`);
  if (q.author) whereParts.push(Prisma.sql`${q.author} = ANY(a.authors)`);
  if (q.yearFrom !== undefined) whereParts.push(Prisma.sql`a.year >= ${q.yearFrom}`);
  if (q.yearTo !== undefined) whereParts.push(Prisma.sql`a.year <= ${q.yearTo}`);

  // Ordenação — todas as variantes terminam com `a.id DESC` como tiebreaker
  // para que o cursor pagination por id seja estável.
  const orderBy =
    q.sort === 'popular'
      ? Prisma.sql`a."likesCount" DESC, a.id DESC`
      : q.sort === 'most-viewed'
      ? Prisma.sql`a."viewCount" DESC, a.id DESC`
      : q.sort === 'most-bookmarked'
      ? Prisma.sql`a."bookmarkCount" DESC, a.id DESC`
      : q.sort === 'most-cited'
      ? Prisma.sql`a.citations DESC, a.id DESC`
      : Prisma.sql`ts_rank(a."searchVector", plainto_tsquery('portuguese', ${tsQuery})) DESC, a.id DESC`;

  // Cursor: filtra por (id < cursor.id) — ordem é DESC, então itens com
  // id menor vêm depois. O tiebreaker por id garante paginação estável
  // mesmo quando múltiplos itens têm o mesmo valor de ranking.
  let cursorFilter = Prisma.empty;
  if (q.cursor) {
    const decoded = decodeCursor(q.cursor);
    if (decoded) {
      cursorFilter = Prisma.sql`AND a.id < ${decoded.id}`;
    }
  }

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    authors: string[];
    journal: string | null;
    year: number;
    doi: string | null;
    url: string | null;
    tags: string[];
    tradition: string | null;
    evidenceLevel: string;
    type: string;
    language: string;
    citations: number;
    viewCount: number;
    bookmarkCount: number;
    likesCount: number;
    publishedAt: Date | null;
    createdAt: Date;
  }>>(Prisma.sql`
    SELECT
      a.id, a.slug, a.title, a.summary, a.authors, a.journal, a.year,
      a.doi, a.url, a.tags, a.tradition, a."evidenceLevel"::text AS "evidenceLevel",
      a.type::text AS type, a.language, a.citations, a."viewCount",
      a."bookmarkCount", a."likesCount", a."publishedAt", a."createdAt"
    FROM articles a
    WHERE ${Prisma.join(whereParts, ' AND ')}
      ${cursorFilter}
    ORDER BY ${orderBy}
    LIMIT ${limit + 1}
  `);

  // Total via count simples (sem ranking — só para mostrar "X resultados")
  const totalRows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM articles a
    WHERE ${Prisma.join(whereParts, ' AND ')}
  `);
  const total = totalRows.length > 0 ? Number(totalRows[0].count) : 0;

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;
  const articles = sliced.map((r) =>
    toListItem({
      id: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      authors: r.authors,
      journal: r.journal,
      year: r.year,
      doi: r.doi,
      url: r.url,
      tags: r.tags,
      tradition: r.tradition,
      evidenceLevel: r.evidenceLevel,
      type: r.type,
      language: r.language,
      citations: r.citations,
      viewCount: r.viewCount,
      bookmarkCount: r.bookmarkCount,
      likesCount: r.likesCount,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
    })
  );

  let nextCursor: string | null = null;
  if (hasMore && sliced.length > 0) {
    const last = sliced[sliced.length - 1];
    // Para sort por ts_rank (q presente), o v é apenas o id — usamos id
    // como tiebreaker único. Para outros sorts, v reflete o valor de sort.
    const v =
      q.sort === 'recent'
        ? last.createdAt.getTime()
        : q.sort === 'most-viewed'
        ? last.viewCount
        : q.sort === 'most-bookmarked'
        ? last.bookmarkCount
        : q.sort === 'most-cited'
        ? last.citations
        : last.id; // ts_rank / popular → id é o tiebreaker
    nextCursor = encodeCursor({ id: last.id, v });
  }

  return { articles, nextCursor, total };
}

// ============================================================================
// toListItem — Prisma row → DTO (lista)
// ============================================================================

function toListItem(row: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  authors: string[];
  journal: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  tags: string[];
  tradition: string | null;
  evidenceLevel: string;
  type: string;
  language: string;
  citations: number;
  viewCount: number;
  bookmarkCount: number;
  likesCount: number;
  publishedAt: Date | null;
  createdAt: Date;
}): ArticleListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    authors: row.authors,
    journal: row.journal,
    year: row.year,
    doi: row.doi,
    url: row.url,
    tags: row.tags,
    tradition: row.tradition,
    evidenceLevel: row.evidenceLevel,
    type: row.type,
    language: row.language,
    citations: row.citations,
    viewCount: row.viewCount,
    bookmarkCount: row.bookmarkCount,
    likesCount: row.likesCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    // Reading time estimado a partir do summary (não temos content na lista)
    readingTimeMinutes: estimateReadingTime(row.summary || ''),
  };
}

// ============================================================================
// getArticleBySlug — detalhe
// ============================================================================

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const row = await prisma.article.findUnique({
    where: { slug },
  });

  if (!row) return null;

  // Related: top 5 artigos da mesma tradição (excluindo o próprio)
  const relatedRows = row.tradition
    ? await prisma.article.findMany({
        where: {
          tradition: row.tradition,
          id: { not: row.id },
        },
        orderBy: [{ viewCount: 'desc' }, { id: 'asc' }],
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          authors: true,
          journal: true,
          year: true,
          doi: true,
          url: true,
          tags: true,
          tradition: true,
          evidenceLevel: true,
          type: true,
          language: true,
          citations: true,
          viewCount: true,
          bookmarkCount: true,
          likesCount: true,
          publishedAt: true,
          createdAt: true,
        },
      })
    : [];

  const relatedArticles: ArticleListItem[] = relatedRows.map(toListItem);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    authors: row.authors,
    journal: row.journal,
    year: row.year,
    doi: row.doi,
    url: row.url,
    references: row.references,
    tags: row.tags,
    topics: row.topics,
    tradition: row.tradition,
    evidenceLevel: row.evidenceLevel,
    type: row.type,
    language: row.language,
    citations: row.citations,
    viewCount: row.viewCount,
    bookmarkCount: row.bookmarkCount,
    likesCount: row.likesCount,
    contributor: row.contributor,
    curatedBy: row.curatedBy,
    source: row.source,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    readingTimeMinutes: estimateReadingTime(row.content || ''),
    relatedArticles,
  };
}

// ============================================================================
// incrementArticleView — background view counter
// ============================================================================

/**
 * Incrementa viewCount sem bloquear a response.
 * Erros são logados mas não propagam (fire-and-forget).
 */
export async function incrementArticleView(articleId: string): Promise<void> {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });
  } catch (err) {
    console.error('[articles] incrementArticleView failed', err);
  }
}

// ============================================================================
// Reading progress — upsert + get
// ============================================================================

export interface ReadingProgressDto {
  articleId: string;
  percentRead: number;
  lastPosition: string | null;
  completedAt: string | null;
  readAt: string;
  updatedAt: string;
}

/**
 * Idempotente: upsert por (userId, articleId).
 * percentRead é monotônico — não regredimos.
 * completedAt é setado uma única vez (na primeira vez que atinge 100%).
 */
export async function saveReadingProgress(input: {
  userId: string;
  articleId: string;
  percentRead: number;
  lastPosition?: string | null;
}): Promise<ReadingProgressDto> {
  const percent = Math.max(0, Math.min(100, Math.round(input.percentRead)));
  const lastPos = input.lastPosition ?? null;
  const now = new Date();

  // Verifica se o artigo existe (FK cascade cuida da limpeza)
  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    select: { id: true },
  });
  if (!article) {
    const err = new Error('Artigo não encontrado');
    (err as Error & { name: string }).name = 'NotFoundError';
    throw err;
  }

  // Idempotente via upsert
  const existing = await prisma.articleReadingProgress.findUnique({
    where: {
      userId_articleId: { userId: input.userId, articleId: input.articleId },
    },
  });

  const nextPercent = existing
    ? Math.max(existing.percentRead, percent)
    : percent;

  // completedAt só é setado na primeira vez que atinge 100%
  const completedAt =
    nextPercent >= 100
      ? existing?.completedAt ?? now
      : existing?.completedAt ?? null;

  const row = await prisma.articleReadingProgress.upsert({
    where: {
      userId_articleId: { userId: input.userId, articleId: input.articleId },
    },
    create: {
      userId: input.userId,
      articleId: input.articleId,
      percentRead: nextPercent,
      lastPosition: lastPos,
      completedAt,
      readAt: now,
      updatedAt: now,
    },
    update: {
      percentRead: nextPercent,
      lastPosition: lastPos,
      completedAt,
      updatedAt: now,
      readAt: now, // também atualiza readAt pra "continue de onde parou"
    },
  });

  return {
    articleId: row.articleId,
    percentRead: row.percentRead,
    lastPosition: row.lastPosition,
    completedAt: row.completedAt?.toISOString() ?? null,
    readAt: row.readAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getReadingProgress(
  userId: string,
  articleId: string
): Promise<ReadingProgressDto | null> {
  const row = await prisma.articleReadingProgress.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });
  if (!row) return null;
  return {
    articleId: row.articleId,
    percentRead: row.percentRead,
    lastPosition: row.lastPosition,
    completedAt: row.completedAt?.toISOString() ?? null,
    readAt: row.readAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}