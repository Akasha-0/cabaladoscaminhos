// ============================================================================
// SEARCH ENGINE — Postgres full-text search + trigram
// ============================================================================
// Implementa busca unificada em Post, Article, Group, SpiritualProfile.
//
// Estratégia:
//   1. Query em `tsquery` (portuguese) para match principal
//   2. Fallback em `pg_trgm` (similarity) quando query tem <3 chars ou
//      full-text não retorna nada — autocomplete/fuzzy
//   3. Ranking:
//      A (content/title/name) = weight 1.0
//      B (summary/tags)        = weight 0.4
//      C (other)               = weight 0.2
//      + boost por recência   = exp(-age_days/30)
//      + boost por popularidade = log(1 + likesCount)
//   4. Highlighting: ts_headline gera <mark>...</mark> em torno do match
//   5. Cursor pagination: base64({score, id}) — chave estável para relevância
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SearchQuery, SuggestionQuery, SearchSort, SearchType } from '@/lib/validators/search';

// ============================================================================
// Tipos públicos (DTO da API)
// ============================================================================

export interface SearchHitPost {
  type: 'post';
  id: string;
  title: string | null;       // posts não têm title — usamos preview do content
  preview: string;            // text com <mark>...</mark>
  content: string;            // content original sem mark
  authorId: string;
  authorName: string;
  tradition: string | null;
  topic: string | null;
  groupSlug: string | null;
  groupName: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  score: number;
  url: string;
}

export interface SearchHitArticle {
  type: 'article';
  id: string;
  slug: string;
  title: string;
  preview: string;
  summary: string;
  authors: string[];
  year: number;
  doi: string | null;
  tags: string[];
  tradition: string | null;
  evidenceLevel: string;
  viewCount: number;
  bookmarkCount: number;
  citations: number;
  createdAt: string;
  score: number;
  url: string;
}

export interface SearchHitGroup {
  type: 'group';
  id: string;
  slug: string;
  name: string;
  preview: string;
  description: string;
  tradition: string;
  membersCount: number;
  postsCount: number;
  createdAt: string;
  score: number;
  url: string;
}

export interface SearchHitUser {
  type: 'user';
  id: string;
  userId: string;
  displayName: string;
  handle: string;
  preview: string;
  bio: string | null;
  signoSolar: string | null;
  oduNascimento: string | null;
  orixaRegente: string | null;
  caminhoDeVida: number | null;
  createdAt: string;
  score: number;
  url: string;
}

export interface SearchHitTag {
  type: 'tag';
  tag: string;
  kind: 'tradition' | 'topic' | 'article_tag';
  count: number;
  score: number;
  url: string;
}

export type SearchHit =
  | SearchHitPost
  | SearchHitArticle
  | SearchHitGroup
  | SearchHitUser
  | SearchHitTag;

export interface SearchResults {
  query: string;
  type: SearchType;
  hits: SearchHit[];
  facets: {
    posts: number;
    articles: number;
    groups: number;
    users: number;
    tags: number;
    total: number;
  };
  nextCursor: string | null;
  took_ms: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Converte query do usuário em tsquery normalizado.
 * Estratégia:
 *   - converte pra lowercase
 *   - troca espaços por `:*` (prefix match em cada termo) — busca "começa com"
 *   - caracteres perigosos viram espaços
 *   - juntamos com AND (&) entre termos
 *
 * Ex: "meditação ansiedade" → "meditação:* & ansiedade:*"
 */
function buildTsQuery(q: string): string {
  // Escapar caracteres especiais do tsquery
  const sanitized = q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos para busca mais permissiva
    .replace(/[\\()&|:!<>]/g, ' ')
    .trim();

  if (!sanitized) return "''";

  const terms = sanitized
    .split(/\s+/)
    .filter((t) => t.length >= 1)
    .map((t) => `${t.replace(/'/g, "''")}:*`);

  return terms.join(' & ');
}

/**
 * Highlight: ts_headline produz texto com <mark>...</mark> ao redor dos matches.
 * Limitamos a ~200 chars para preview.
 */
function buildHeadline(
  tsvectorCol: string,
  textCol: string,
  tsquery: string,
  maxWords = 35,
  minWords = 15,
): Prisma.Sql {
  return Prisma.sql`ts_headline(
    'portuguese',
    ${Prisma.raw(textCol)},
    to_tsquery('portuguese', ${tsquery}),
    'MaxWords=${maxWords}, MinWords=${minWords}, StartSel=<mark>, StopSel=</mark>'
  )`;
}

/**
 * Cursor: base64({score, id, type})
 * Decodificar via decodeCursor.
 */
interface CursorData {
  score: number;
  id: string;
  type: SearchType;
}

export function encodeCursor(c: CursorData): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

export function decodeCursor(raw: string): CursorData | null {
  try {
    const json = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (
      typeof json?.score !== 'number' ||
      typeof json?.id !== 'string' ||
      typeof json?.type !== 'string'
    ) {
      return null;
    }
    return { score: json.score, id: json.id, type: json.type };
  } catch {
    return null;
  }
}

/**
 * Sanitiza o snippet de highlight — remove espaços duplos, quebras e limita tamanho.
 */
function cleanSnippet(s: string, max = 220): string {
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/**
 * Calcula a pontuação final (consistente entre as queries).
 * Quanto MAIOR, mais relevante.
 *
 * Componentes:
 *   - rank base do ts_rank (já com pesos A/B/C)
 *   - boost de recência: exp(-age_days / 60)
 *   - boost de popularidade: log(1 + likesCount) * 0.1
 */
function buildScoreExpr(
  tsvectorCol: string,
  likesCol = '0',
  createdAtCol = 'NOW()',
): Prisma.Sql {
  return Prisma.sql`
    (
      ts_rank(${Prisma.raw(tsvectorCol)}, to_tsquery('portuguese', ${buildTsQuery('') || "''"}))
      + exp(-EXTRACT(EPOCH FROM (NOW() - ${Prisma.raw(createdAtCol)})) / (60 * 86400))
      + 0.1 * LN(1 + ${Prisma.raw(likesCol)})
    )
  `;
}

/**
 * Ranking customizado sem repetir a tsquery — usado quando queremos o score
 * junto da query.
 */
function rankExpr(tsvectorCol: string, tsquery: string, createdAtCol: string, likesCol: string): Prisma.Sql {
  return Prisma.sql`
    (
      ts_rank_cd(${Prisma.raw(tsvectorCol)}, to_tsquery('portuguese', ${tsquery}))
      + exp(-EXTRACT(EPOCH FROM (NOW() - ${Prisma.raw(createdAtCol)})) / (60 * 86400))
      + 0.1 * LN(1 + ${Prisma.raw(likesCol)})
    )
  `;
}

// ============================================================================
// QUERIES — uma por modelo
// ============================================================================

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

async function searchPosts(q: string, tsquery: string, opts: {
  limit: number;
  cursor: CursorData | null;
  tradition?: string;
  tag?: string; // topic
  sort: SearchSort;
}): Promise<{ hits: SearchHitPost[]; count: number }> {
  const where: Prisma.Sql[] = [Prisma.sql`p."deletedAt" IS NULL`];
  if (opts.tradition) where.push(Prisma.sql`p.tradition = ${opts.tradition}`);
  if (opts.tag) where.push(Prisma.sql`p.topic = ${opts.tag}`);
  if (opts.cursor) {
    // relevance cursor: score menor ou id menor (tie-breaker)
    where.push(Prisma.sql`((${rankExpr('p."searchVector"', tsquery, 'p."createdAt"', 'p."likesCount"')}), p.id) < (${opts.cursor.score}, ${opts.cursor.id})`);
  }

  const orderBy =
    opts.sort === 'recent'
      ? Prisma.sql`p."createdAt" DESC`
      : opts.sort === 'popular'
      ? Prisma.sql`p."likesCount" DESC, p."createdAt" DESC`
      : Prisma.sql`(${rankExpr('p."searchVector"', tsquery, 'p."createdAt"', 'p."likesCount"')}) DESC, p.id DESC`;

  const sql = Prisma.sql`
    SELECT
      p.id,
      p.content,
      p."authorId",
      p.tradition,
      p.topic,
      p."likesCount",
      p."commentsCount",
      p."createdAt",
      p."groupId",
      g.slug  AS "groupSlug",
      g.name  AS "groupName",
      ts_headline(
        'portuguese',
        p.content,
        to_tsquery('portuguese', ${tsquery}),
        'MaxWords=35, MinWords=15, StartSel=<mark>, StopSel=</mark>'
      ) AS preview,
      (ts_rank_cd(p."searchVector", to_tsquery('portuguese', ${tsquery}))
        + exp(-EXTRACT(EPOCH FROM (NOW() - p."createdAt")) / (60 * 86400))
        + 0.1 * LN(1 + p."likesCount")) AS score
    FROM posts p
    LEFT JOIN groups g ON g.id = p."groupId"
    WHERE p."searchVector" @@ to_tsquery('portuguese', ${tsquery})
      AND ${Prisma.join(where, ' AND ')}
    ORDER BY ${orderBy}
    LIMIT ${opts.limit + 1}
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    content: string;
    authorId: string;
    tradition: string | null;
    topic: string | null;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    groupId: string | null;
    groupSlug: string | null;
    groupName: string | null;
    preview: string;
    score: number;
  }>>(sql);

  const hasMore = rows.length > opts.limit;
  const slice = hasMore ? rows.slice(0, opts.limit) : rows;

  return {
    hits: slice.map((r) => ({
      type: 'post' as const,
      id: r.id,
      title: null,
      preview: cleanSnippet(r.preview),
      content: r.content,
      authorId: r.authorId,
      authorName: `Membro ${r.authorId.slice(-4)}`,
      tradition: r.tradition,
      topic: r.topic,
      groupSlug: r.groupSlug,
      groupName: r.groupName,
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      createdAt: r.createdAt.toISOString(),
      score: Number(r.score),
      url: `/post/${r.id}`,
    })),
    count: slice.length,
  };
}

async function searchArticles(q: string, tsquery: string, opts: {
  limit: number;
  cursor: CursorData | null;
  tradition?: string;
  tag?: string;
  sort: SearchSort;
}): Promise<{ hits: SearchHitArticle[]; count: number }> {
  const where: Prisma.Sql[] = [];
  if (opts.tradition) where.push(Prisma.sql`a.tradition = ${opts.tradition}`);
  if (opts.tag) where.push(Prisma.sql`${opts.tag} = ANY(a.tags)`);
  if (opts.cursor) {
    where.push(Prisma.sql`((${rankExpr('a."searchVector"', tsquery, 'a."createdAt"', 'a."likesCount"')}), a.id) < (${opts.cursor.score}, ${opts.cursor.id})`);
  }

  const orderBy =
    opts.sort === 'recent'
      ? Prisma.sql`a."createdAt" DESC`
      : opts.sort === 'popular'
      ? Prisma.sql`(a."viewCount" + 2*a."bookmarkCount" + 3*a.citations) DESC, a."createdAt" DESC`
      : Prisma.sql`(${rankExpr('a."searchVector"', tsquery, 'a."createdAt"', 'a."likesCount"')}) DESC, a.id DESC`;

  const sql = Prisma.sql`
    SELECT
      a.id,
      a.slug,
      a.title,
      a.summary,
      a.authors,
      a.year,
      a.doi,
      a.tags,
      a.tradition,
      a."evidenceLevel",
      a."viewCount",
      a."bookmarkCount",
      a.citations,
      a."createdAt",
      ts_headline(
        'portuguese',
        coalesce(a.title, '') || ' — ' || coalesce(a.summary, ''),
        to_tsquery('portuguese', ${tsquery}),
        'MaxWords=35, MinWords=15, StartSel=<mark>, StopSel=</mark>'
      ) AS preview,
      (ts_rank_cd(a."searchVector", to_tsquery('portuguese', ${tsquery}))
        + exp(-EXTRACT(EPOCH FROM (NOW() - a."createdAt")) / (60 * 86400))
        + 0.05 * LN(1 + a."viewCount" + a."bookmarkCount" + a.citations)) AS score
    FROM articles a
    WHERE a."searchVector" @@ to_tsquery('portuguese', ${tsquery})
      ${where.length > 0 ? Prisma.sql`AND ${Prisma.join(where, ' AND ')}` : Prisma.empty}
    ORDER BY ${orderBy}
    LIMIT ${opts.limit + 1}
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    authors: string[];
    year: number;
    doi: string | null;
    tags: string[];
    tradition: string | null;
    evidenceLevel: string;
    viewCount: number;
    bookmarkCount: number;
    citations: number;
    createdAt: Date;
    preview: string;
    score: number;
  }>>(sql);

  const hasMore = rows.length > opts.limit;
  const slice = hasMore ? rows.slice(0, opts.limit) : rows;

  return {
    hits: slice.map((r) => ({
      type: 'article' as const,
      id: r.id,
      slug: r.slug,
      title: r.title,
      preview: cleanSnippet(r.preview),
      summary: r.summary,
      authors: r.authors,
      year: r.year,
      doi: r.doi,
      tags: r.tags,
      tradition: r.tradition,
      evidenceLevel: r.evidenceLevel,
      viewCount: r.viewCount,
      bookmarkCount: r.bookmarkCount,
      citations: r.citations,
      createdAt: r.createdAt.toISOString(),
      score: Number(r.score),
      url: `/library/${r.slug}`,
    })),
    count: slice.length,
  };
}

async function searchGroups(q: string, tsquery: string, opts: {
  limit: number;
  cursor: CursorData | null;
  sort: SearchSort;
}): Promise<{ hits: SearchHitGroup[]; count: number }> {
  const where: Prisma.Sql[] = [Prisma.sql`g."isPublic" = true`];
  if (opts.cursor) {
    where.push(Prisma.sql`((${rankExpr('g."searchVector"', tsquery, 'g."createdAt"', 'g."membersCount"')}), g.id) < (${opts.cursor.score}, ${opts.cursor.id})`);
  }

  const orderBy =
    opts.sort === 'recent'
      ? Prisma.sql`g."createdAt" DESC`
      : opts.sort === 'popular'
      ? Prisma.sql`g."membersCount" DESC, g."createdAt" DESC`
      : Prisma.sql`(${rankExpr('g."searchVector"', tsquery, 'g."createdAt"', 'g."membersCount"')}) DESC, g.id DESC`;

  const sql = Prisma.sql`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.description,
      g.tradition,
      g."membersCount",
      g."postsCount",
      g."createdAt",
      ts_headline(
        'portuguese',
        coalesce(g.name, '') || ' — ' || coalesce(g.description, ''),
        to_tsquery('portuguese', ${tsquery}),
        'MaxWords=30, MinWords=10, StartSel=<mark>, StopSel=</mark>'
      ) AS preview,
      (ts_rank_cd(g."searchVector", to_tsquery('portuguese', ${tsquery}))
        + exp(-EXTRACT(EPOCH FROM (NOW() - g."createdAt")) / (60 * 86400))
        + 0.05 * LN(1 + g."membersCount")) AS score
    FROM groups g
    WHERE g."searchVector" @@ to_tsquery('portuguese', ${tsquery})
      AND ${Prisma.join(where, ' AND ')}
    ORDER BY ${orderBy}
    LIMIT ${opts.limit + 1}
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    tradition: string;
    membersCount: number;
    postsCount: number;
    createdAt: Date;
    preview: string;
    score: number;
  }>>(sql);

  const hasMore = rows.length > opts.limit;
  const slice = hasMore ? rows.slice(0, opts.limit) : rows;

  return {
    hits: slice.map((r) => ({
      type: 'group' as const,
      id: r.id,
      slug: r.slug,
      name: r.name,
      preview: cleanSnippet(r.preview),
      description: r.description,
      tradition: r.tradition,
      membersCount: r.membersCount,
      postsCount: r.postsCount,
      createdAt: r.createdAt.toISOString(),
      score: Number(r.score),
      url: `/groups/${r.slug}`,
    })),
    count: slice.length,
  };
}

async function searchUsers(q: string, tsquery: string, opts: {
  limit: number;
  cursor: CursorData | null;
  sort: SearchSort;
}): Promise<{ hits: SearchHitUser[]; count: number }> {
  const where: Prisma.Sql[] = [
    Prisma.sql`sp.visibility IN ('PUBLIC', 'COMMUNITY')`,
  ];
  if (opts.cursor) {
    where.push(Prisma.sql`((${rankExpr('sp."searchVector"', tsquery, 'sp."createdAt"', '0')}), sp.id) < (${opts.cursor.score}, ${opts.cursor.id})`);
  }

  const orderBy =
    opts.sort === 'recent'
      ? Prisma.sql`sp."createdAt" DESC`
      : Prisma.sql`(${rankExpr('sp."searchVector"', tsquery, 'sp."createdAt"', '0')}) DESC, sp.id DESC`;

  const sql = Prisma.sql`
    SELECT
      sp.id,
      sp."userId",
      sp."birthName" AS "displayName",
      sp.bio,
      sp."signoSolar",
      sp."oduNascimento",
      sp."orixaRegente",
      sp."caminhoDeVida",
      sp."createdAt",
      ts_headline(
        'portuguese',
        coalesce(sp."birthName", '') || coalesce(' — ' || sp.bio, ''),
        to_tsquery('portuguese', ${tsquery}),
        'MaxWords=25, MinWords=8, StartSel=<mark>, StopSel=</mark>'
      ) AS preview,
      (ts_rank_cd(sp."searchVector", to_tsquery('portuguese', ${tsquery}))
        + exp(-EXTRACT(EPOCH FROM (NOW() - sp."createdAt")) / (60 * 86400))) AS score
    FROM spiritual_profiles sp
    WHERE sp."searchVector" @@ to_tsquery('portuguese', ${tsquery})
      AND ${Prisma.join(where, ' AND ')}
    ORDER BY ${orderBy}
    LIMIT ${opts.limit + 1}
  `;

  const rows = await prisma.$queryRaw<Array<{
    id: string;
    userId: string;
    displayName: string;
    bio: string | null;
    signoSolar: string | null;
    oduNascimento: string | null;
    orixaRegente: string | null;
    caminhoDeVida: number | null;
    createdAt: Date;
    preview: string;
    score: number;
  }>>(sql);

  const hasMore = rows.length > opts.limit;
  const slice = hasMore ? rows.slice(0, opts.limit) : rows;

  return {
    hits: slice.map((r) => ({
      type: 'user' as const,
      id: r.id,
      userId: r.userId,
      displayName: r.displayName,
      handle: r.userId,
      preview: cleanSnippet(r.preview),
      bio: r.bio,
      signoSolar: r.signoSolar,
      oduNascimento: r.oduNascimento,
      orixaRegente: r.orixaRegente,
      caminhoDeVida: r.caminhoDeVida,
      createdAt: r.createdAt.toISOString(),
      score: Number(r.score),
      url: `/u/${r.userId}`,
    })),
    count: slice.length,
  };
}

/**
 * Tags agregadas — busca nas tabelas post.tradition, post.topic, article.tags.
 * Não usa tsvector — usa trigram (similarity).
 */
async function searchTags(q: string, opts: {
  limit: number;
}): Promise<SearchHitTag[]> {
  const sql = Prisma.sql`
    WITH tag_union AS (
      SELECT tradition AS tag, 'tradition'::text AS kind FROM posts WHERE deletedAt IS NULL AND tradition IS NOT NULL
      UNION ALL
      SELECT topic AS tag, 'topic'::text AS kind FROM posts WHERE deletedAt IS NULL AND topic IS NOT NULL
      UNION ALL
      SELECT unnest(tags) AS tag, 'article_tag'::text AS kind FROM articles WHERE tags IS NOT NULL
    ),
    counts AS (
      SELECT tag, kind, COUNT(*) AS count
      FROM tag_union
      GROUP BY tag, kind
    )
    SELECT
      tag,
      kind,
      count,
      similarity(tag, ${q}) AS sim
    FROM counts
    WHERE tag % ${q} OR LOWER(tag) LIKE LOWER(${`%${q}%`})
    ORDER BY GREATEST(similarity(tag, ${q}), CASE WHEN LOWER(tag) LIKE LOWER(${`%${q}%`}) THEN 0.4 ELSE 0 END) DESC,
             count DESC
    LIMIT ${opts.limit}
  `;

  const rows = await prisma.$queryRaw<Array<{
    tag: string;
    kind: 'tradition' | 'topic' | 'article_tag';
    count: bigint;
    sim: number;
  }>>(sql);

  return rows.map((r) => ({
    type: 'tag' as const,
    tag: r.tag,
    kind: r.kind,
    count: Number(r.count),
    score: Number(r.sim),
    url: r.kind === 'article_tag'
      ? `/tags/${encodeURIComponent(r.tag)}`
      : `/explore?tag=${encodeURIComponent(r.tag)}`,
  }));
}

// ============================================================================
// API principal
// ============================================================================

export async function search(query: SearchQuery): Promise<SearchResults> {
  const start = Date.now();
  const tsquery = buildTsQuery(query.q);
  const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const cursor = query.cursor ? decodeCursor(query.cursor) : null;

  const opts = {
    limit,
    cursor,
    tradition: query.tradition,
    tag: query.tag,
    sort: (query.sort ?? 'relevance') as SearchSort,
  };

  // Determina quais modelos consultar
  const wantPosts = query.type === 'all' || query.type === 'posts';
  const wantArticles = query.type === 'all' || query.type === 'articles';
  const wantGroups = query.type === 'all' || query.type === 'groups';
  const wantUsers = query.type === 'all' || query.type === 'users';
  const wantTags = query.type === 'all' || query.type === 'tags';

  // Para type=tags, não usamos tsquery (tags usam trigram puro)
  if (query.type === 'tags') {
    const tags = await searchTags(query.q, { limit });
    return {
      query: query.q,
      type: query.type,
      hits: tags,
      facets: { posts: 0, articles: 0, groups: 0, users: 0, tags: tags.length, total: tags.length },
      nextCursor: null,
      took_ms: Date.now() - start,
    };
  }

  // Roda todas as queries em paralelo (modelos independentes)
  const [postsResult, articlesResult, groupsResult, usersResult] = await Promise.all([
    wantPosts ? searchPosts(query.q, tsquery, opts).catch((e) => {
      console.warn('[search] posts query failed:', e);
      return { hits: [] as SearchHitPost[], count: 0 };
    }) : Promise.resolve({ hits: [] as SearchHitPost[], count: 0 }),
    wantArticles ? searchArticles(query.q, tsquery, opts).catch((e) => {
      console.warn('[search] articles query failed:', e);
      return { hits: [] as SearchHitArticle[], count: 0 };
    }) : Promise.resolve({ hits: [] as SearchHitArticle[], count: 0 }),
    wantGroups ? searchGroups(query.q, tsquery, opts).catch((e) => {
      console.warn('[search] groups query failed:', e);
      return { hits: [] as SearchHitGroup[], count: 0 };
    }) : Promise.resolve({ hits: [] as SearchHitGroup[], count: 0 }),
    wantUsers ? searchUsers(query.q, tsquery, opts).catch((e) => {
      console.warn('[search] users query failed:', e);
      return { hits: [] as SearchHitUser[], count: 0 };
    }) : Promise.resolve({ hits: [] as SearchHitUser[], count: 0 }),
  ]);

  // Tags: sempre rodam em paralelo (limit pequeno, é barato)
  const tags = wantTags ? await searchTags(query.q, { limit: 10 }).catch((e) => {
    console.warn('[search] tags query failed:', e);
    return [];
  }) : [];

  // Merge hits — intercalando por score global
  // Quando type='all', cada modelo tem sua própria quota (mesma limit).
  // Para 'all', pegamos o top N total ordenado por score.
  const allHits: SearchHit[] = [
    ...postsResult.hits,
    ...articlesResult.hits,
    ...groupsResult.hits,
    ...usersResult.hits,
    ...tags,
  ];

  // Ordena por score desc
  allHits.sort((a, b) => b.score - a.score);

  // Aplica limit e gera cursor
  const hasMore = allHits.length > limit;
  const slice = hasMore ? allHits.slice(0, limit) : allHits;
  const nextCursor = hasMore && slice.length > 0
    ? encodeCursor({
        score: slice[slice.length - 1]!.score,
        id: slice[slice.length - 1]!.id,
        type: query.type,
      })
    : null;

  return {
    query: query.q,
    type: query.type,
    hits: slice,
    facets: {
      posts: postsResult.count,
      articles: articlesResult.count,
      groups: groupsResult.count,
      users: usersResult.count,
      tags: tags.length,
      total: slice.length,
    },
    nextCursor,
    took_ms: Date.now() - start,
  };
}

// ============================================================================
// AUTOCOMPLETE — versão resumida
// ============================================================================

export interface Suggestion {
  type: 'post' | 'article' | 'group' | 'user' | 'tag';
  id: string;
  label: string;     // texto principal
  sublabel?: string; // linha secundária
  url: string;
  score: number;
}

export interface SuggestionsResult {
  query: string;
  suggestions: Suggestion[];
  took_ms: number;
}

export async function suggestions(query: SuggestionQuery): Promise<SuggestionsResult> {
  const start = Date.now();
  const tsquery = buildTsQuery(query.q);
  const limit = Math.min(Math.max(query.limit ?? 8, 1), 10);

  // Combina 4 fontes: posts, articles, groups, tags
  const [postsR, articlesR, groupsR, tagsR] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string; content: string; score: number }>>(Prisma.sql`
      SELECT id, content,
        ts_rank_cd("searchVector", to_tsquery('portuguese', ${tsquery})) AS score
      FROM posts
      WHERE "searchVector" @@ to_tsquery('portuguese', ${tsquery})
        AND "deletedAt" IS NULL
      ORDER BY score DESC LIMIT 3
    `).catch(() => [] as Array<{ id: string; content: string; score: number }>),
    prisma.$queryRaw<Array<{ id: string; title: string; score: number }>>(Prisma.sql`
      SELECT id, title,
        ts_rank_cd("searchVector", to_tsquery('portuguese', ${tsquery})) AS score
      FROM articles
      WHERE "searchVector" @@ to_tsquery('portuguese', ${tsquery})
      ORDER BY score DESC LIMIT 3
    `).catch(() => [] as Array<{ id: string; title: string; score: number }>),
    prisma.$queryRaw<Array<{ id: string; name: string; slug: string; score: number }>>(Prisma.sql`
      SELECT id, name, slug,
        ts_rank_cd("searchVector", to_tsquery('portuguese', ${tsquery})) AS score
      FROM groups
      WHERE "searchVector" @@ to_tsquery('portuguese', ${tsquery})
        AND "isPublic" = true
      ORDER BY score DESC LIMIT 2
    `).catch(() => [] as Array<{ id: string; name: string; slug: string; score: number }>),
    searchTags(query.q, { limit: 3 }).catch(() => [] as SearchHitTag[]),
  ]);

  const suggestions: Suggestion[] = [
    ...postsR.map((r) => ({
      type: 'post' as const,
      id: r.id,
      label: r.content.slice(0, 60) + (r.content.length > 60 ? '…' : ''),
      sublabel: 'Post',
      url: `/post/${r.id}`,
      score: Number(r.score),
    })),
    ...articlesR.map((r) => ({
      type: 'article' as const,
      id: r.id,
      label: r.title,
      sublabel: 'Artigo',
      url: `/library/${r.id}`,
      score: Number(r.score),
    })),
    ...groupsR.map((r) => ({
      type: 'group' as const,
      id: r.id,
      label: r.name,
      sublabel: 'Grupo',
      url: `/groups/${r.slug}`,
      score: Number(r.score),
    })),
    ...tagsR.map((t) => ({
      type: 'tag' as const,
      id: t.tag,
      label: `#${t.tag}`,
      sublabel: `${t.count} ${t.count === 1 ? 'resultado' : 'resultados'}`,
      url: t.url,
      score: t.score,
    })),
  ];

  // Ordena por score, limita
  suggestions.sort((a, b) => b.score - a.score);
  const top = suggestions.slice(0, limit);

  return {
    query: query.q,
    suggestions: top,
    took_ms: Date.now() - start,
  };
}
