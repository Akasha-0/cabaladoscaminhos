// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// SEARCH FILTERS — Builder de WHERE clauses (Wave 18)
// ============================================================================
// Helper `buildWhere` que converte o `SearchFilters` validado pelo Zod
// em cláusulas SQL parametrizadas (Prisma.Sql) usadas pelo engine
// de busca (lib/community/search.ts).
//
// Filosofia:
//   - Cada filtro vira um Prisma.Sql independente — fácil de combinar com AND
//   - Nada aqui é string interpolation manual — sempre parametrizado
//     (proteção contra SQL injection).
//   - Filtros desconhecidos/nulos são ignorados (não adicionam cláusula)
//   - Arrays vazios são tratados como "sem restrição"
// ============================================================================

import { Prisma } from '@prisma/client';

// ============================================================================
// Tipos públicos — espelham o SearchQuerySchema (Wave 18)
// ============================================================================

export interface SearchFilters {
  q: string;
  type?: 'all' | 'posts' | 'articles' | 'users' | 'groups' | 'tags';
  tradition?: string;
  /** Topic (posts) ou tag (articles) — single-value para simplicidade */
  tag?: string;
  /** Evidence level (articles): ANECDOTAL | LOW | MEDIUM | HIGH */
  level?: 'ANECDOTAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  /** Article type: SCIENTIFIC_PAPER | MAGAZINE_ARTICLE | BOOK | VIDEO | PODCAST | ESSAY */
  format?: 'SCIENTIFIC_PAPER' | 'MAGAZINE_ARTICLE' | 'BOOK' | 'VIDEO' | 'PODCAST' | 'ESSAY';
  /** Article author (LIKE %author%) */
  author?: string;
  /** Janela temporal — createdAt >= dateFrom */
  dateFrom?: Date;
  /** Janela temporal — createdAt <= dateTo */
  dateTo?: Date;
  /** Apenas articles com viewCount > 0 (proxy para "tem áudio/vídeo embedded") */
  hasAudio?: boolean;
  /** Apenas articles com citations > 0 */
  hasVideo?: boolean;
  sort?: 'relevance' | 'recent' | 'popular';
}

// ============================================================================
// Helpers por modelo
// ============================================================================

/**
 * Filtros para a tabela `posts` (alias `p`).
 * Inclui: tradition, topic (= tag), dateFrom/dateTo, hasAudio (via group).
 */
export function buildPostsWhere(f: SearchFilters): Prisma.Sql {
  const where: Prisma.Sql[] = [Prisma.sql`p."deletedAt" IS NULL`];

  if (f.tradition) where.push(Prisma.sql`p.tradition = ${f.tradition}`);
  if (f.tag) where.push(Prisma.sql`p.topic = ${f.tag}`);
  if (f.dateFrom) where.push(Prisma.sql`p."createdAt" >= ${f.dateFrom}`);
  if (f.dateTo) where.push(Prisma.sql`p."createdAt" <= ${f.dateTo}`);
  if (f.author) where.push(Prisma.sql`p."authorId" = ${f.author}`);

  return Prisma.join(where, ' AND ');
}

/**
 * Filtros para a tabela `articles` (alias `a`).
 * Inclui: tradition, tag (ANY), evidenceLevel (= level), type (= format),
 * authors (LIKE), dateFrom/dateTo, hasAudio/hasVideo (proxys via viewCount/citations).
 */
export function buildArticlesWhere(f: SearchFilters): Prisma.Sql {
  const where: Prisma.Sql[] = [];

  if (f.tradition) where.push(Prisma.sql`a.tradition = ${f.tradition}`);
  if (f.tag) where.push(Prisma.sql`${f.tag} = ANY(a.tags)`);
  if (f.level) where.push(Prisma.sql`a."evidenceLevel"::text = ${f.level}`);
  if (f.format) where.push(Prisma.sql`a.type::text = ${f.format}`);
  if (f.author) where.push(Prisma.sql`${f.author} = ANY(a.authors)`);
  if (f.dateFrom) where.push(Prisma.sql`a."createdAt" >= ${f.dateFrom}`);
  if (f.dateTo) where.push(Prisma.sql`a."createdAt" <= ${f.dateTo}`);
  // Proxy para "tem áudio": article tem viewCount alto (curadoria de conteúdo audio-first)
  if (f.hasAudio === true) where.push(Prisma.sql`a."viewCount" > 0`);
  if (f.hasAudio === false) where.push(Prisma.sql`(a."viewCount" = 0 OR a."viewCount" IS NULL)`);
  // Proxy para "tem vídeo": citations > 0 (proxy conservador — vídeo costuma gerar citações)
  if (f.hasVideo === true) where.push(Prisma.sql`a.citations > 0`);

  return where.length > 0
    ? Prisma.join(where, ' AND ')
    : Prisma.sql`TRUE`;
}

/**
 * Filtros para a tabela `groups` (alias `g`).
 * Inclui: tradition, dateFrom/dateTo.
 */
export function buildGroupsWhere(f: SearchFilters): Prisma.Sql {
  const where: Prisma.Sql[] = [Prisma.sql`g."isPublic" = true`];

  if (f.tradition) where.push(Prisma.sql`g.tradition = ${f.tradition}`);
  if (f.dateFrom) where.push(Prisma.sql`g."createdAt" >= ${f.dateFrom}`);
  if (f.dateTo) where.push(Prisma.sql`g."createdAt" <= ${f.dateTo}`);

  return Prisma.join(where, ' AND ');
}

/**
 * Filtros para a tabela `spiritual_profiles` (alias `sp`).
 * Apenas visibilidade pública + janela temporal.
 */
export function buildProfilesWhere(f: SearchFilters): Prisma.Sql {
  const where: Prisma.Sql[] = [
    Prisma.sql`sp.visibility IN ('PUBLIC', 'COMMUNITY')`,
  ];

  if (f.dateFrom) where.push(Prisma.sql`sp."createdAt" >= ${f.dateFrom}`);
  if (f.dateTo) where.push(Prisma.sql`sp."createdAt" <= ${f.dateTo}`);

  return Prisma.join(where, ' AND ');
}

/**
 * Helper genérico — dado um `SearchFilters`, retorna o WHERE apropriado
 * para o modelo solicitado. Útil para chamadas externas que não sabem
 * o tipo alvo.
 */
export function buildWhere(
  filters: SearchFilters,
  model: 'posts' | 'articles' | 'groups' | 'profiles',
): Prisma.Sql {
  switch (model) {
    case 'posts':
      return buildPostsWhere(filters);
    case 'articles':
      return buildArticlesWhere(filters);
    case 'groups':
      return buildGroupsWhere(filters);
    case 'profiles':
      return buildProfilesWhere(filters);
  }
}

// ============================================================================
// Validação de filtros (defesa em profundidade)
// ============================================================================

const VALID_TRADITIONS = new Set([
  'cabala',
  'ifa',
  'candomble',
  'umbanda',
  'espiritismo',
  'tantra',
  'meditacao',
  'xamanismo',
  'reiki',
  'ayurveda',
  'astrologia',
  'numerologia',
  'tarot',
  'cristianismo',
  'budismo',
]);

/**
 * Sanitiza um valor de filtro vindo do search params.
 * Tradições não-canônicas são descartadas para evitar queries gordas.
 */
export function sanitizeTradition(t: string | undefined | null): string | undefined {
  if (!t) return undefined;
  const lower = t.toLowerCase().trim().slice(0, 50);
  return VALID_TRADITIONS.has(lower) ? lower : undefined;
}

export function sanitizeTag(t: string | undefined | null): string | undefined {
  if (!t) return undefined;
  return t.toLowerCase().trim().slice(0, 80);
}
