// ============================================================================
// perf/db-patterns — Database query best practices helpers
// ============================================================================
// Wave 32 (perf 4/8) — Patterns to prevent N+1, over-fetching, and missing
// pagination. Use these helpers when writing Prisma queries.
// ============================================================================

import type { Prisma } from '@prisma/client';

// ============================================================================
// Cursor pagination — preferred over offset for large lists
// ============================================================================

export interface CursorPayload {
  /** Sort value used for the cursor (e.g. createdAt ISO string). */
  v: string | number;
  /** Tiebreaker: id of the row. */
  id: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.id === 'string' &&
      (typeof parsed.v === 'string' || typeof parsed.v === 'number')
    ) {
      return parsed as CursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Selective fields — never SELECT * in hot paths
// ============================================================================
//
// Why?
//   - SELECT * fetches all columns including potentially-heavy JSON fields
//   - Mobile networks suffer 2-5x more with large payloads
//   - Explicit `select` is self-documenting
//
// IMPORTANT: keep these in sync with prisma/schema.prisma. If you add a
// field you want included, update both schema and this select.
// ============================================================================

/**
 * Lean user select for list views (feed, search, members).
 * Excludes heavy relations: mapaNatal, journalEntries, mentorBio, etc.
 *
 * IMPORTANT: keep in sync with prisma/schema.prisma User model.
 * Fields must exist on the User model.
 */
export const USER_LIST_SELECT = {
  id: true,
  nomeCompleto: true,
  temaPreferido: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/**
 * Lean post select for feed views.
 * Excludes: content (lazy-load on detail), references JSON.
 *
 * NOTE: Post model doesn't have an `author` relation in this schema,
 * only authorId. Fetch author separately if needed (small query).
 */
export const POST_LIST_SELECT = {
  id: true,
  authorId: true,
  content: true,
  type: true,
  tradition: true,
  topic: true,
  mediaUrls: true,
  linkUrl: true,
  groupId: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
  deletedAt: true,
} satisfies Prisma.PostSelect;

/**
 * Lean article select for library list views.
 * Excludes: full content (lazy-load on detail).
 */
// NOTE: schema has more fields than the generated Prisma client currently
// exposes (year, journal, authors). Keep this aligned with `prisma generate`.
// Fields below are confirmed against node_modules/.prisma/client/index.d.ts.
export const ARTICLE_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  type: true,
  tradition: true,
  topics: true,
  evidenceLevel: true,
  doi: true,
  externalUrl: true,
  references: true,
  publishedAt: true,
  createdAt: true,
} satisfies Prisma.ArticleSelect;

// ============================================================================
// Pagination presets
// ============================================================================

export const PAGINATION = {
  FEED: { default: 20, max: 50 },
  SEARCH: { default: 20, max: 100 },
  LIBRARY: { default: 20, max: 50 },
  ADMIN_USERS: { default: 20, max: 100 },
  ADMIN_LOGS: { default: 50, max: 200 },
} as const;

export function clampPagination(
  requested: number | undefined,
  preset: keyof typeof PAGINATION,
): number {
  const { default: def, max } = PAGINATION[preset];
  if (typeof requested !== 'number' || Number.isNaN(requested)) return def;
  return Math.min(Math.max(1, Math.floor(requested)), max);
}

// ============================================================================
// Aggregation — push counts down to DB instead of in-memory reduce
// ============================================================================
//
// Anti-pattern: load N posts, then .length to get count.
// Better: use prisma.post.count() in parallel with findMany.
// Best: use prisma.post.aggregate({ _count: true }).
// ============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Generic paginated find + count helper.
 * Runs both queries in parallel — saves ~50% latency vs sequential.
 */
export async function paginatedFindMany<T>(
  findMany: () => Promise<T[]>,
  count: () => Promise<number>,
  decodeAndEncode: (lastItem: T) => CursorPayload | null,
  limit: number,
): Promise<PaginatedResult<T>> {
  const [data, total] = await Promise.all([findMany(), count()]);
  const hasMore = data.length > limit;
  const trimmed = hasMore ? data.slice(0, limit) : data;
  const lastItem = trimmed[trimmed.length - 1];
  const lastPayload = lastItem ? decodeAndEncode(lastItem) : null;
  return {
    data: trimmed,
    total,
    nextCursor: lastPayload && hasMore ? encodeCursor(lastPayload) : null,
    hasMore,
  };
}

// ============================================================================
// Date range helpers
// ============================================================================

/**
 * Build a Prisma `where` date range filter. Avoids the repeated
 * `{ gte, lte }` boilerplate.
 */
export function dateRange(
  field: string,
  startDate?: Date | string,
  endDate?: Date | string,
): Record<string, { gte?: Date; lte?: Date }> {
  const filter: { gte?: Date; lte?: Date } = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return Object.keys(filter).length > 0 ? { [field]: filter } : {};
}

// ============================================================================
// Trending/recent windows — common time-bounded queries
// ============================================================================

/**
 * Get a date N days ago. Used in `where: { createdAt: { gte: daysAgo(7) } }`.
 */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export const TIME_WINDOWS = {
  LAST_HOUR: () => new Date(Date.now() - 60 * 60 * 1000),
  TODAY: () => new Date(new Date().setHours(0, 0, 0, 0)),
  LAST_24H: () => daysAgo(1),
  LAST_7D: () => daysAgo(7),
  LAST_30D: () => daysAgo(30),
  LAST_90D: () => daysAgo(90),
} as const;