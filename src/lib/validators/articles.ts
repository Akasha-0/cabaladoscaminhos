// ============================================================================
// ZOD SCHEMAS — ARTICLES (Biblioteca Akasha) + Follow + Read Progress
// ============================================================================
// Wave 21 (2026-06-28) — P0 Critical Fix: 4 APIs faltantes.
// Schemas compartilhados entre API routes e o client.
// ============================================================================

import { z } from 'zod';

// ============================================================================
// ARTICLES — GET /api/articles
// ============================================================================
// Filtros ricos: query (full-text + trgm), tradição, evidence level,
// formato (type), autor, paginação cursor.
// ============================================================================

export const ArticleListSortSchema = z.enum([
  'recent',
  'popular',
  'most-viewed',
  'most-bookmarked',
  'most-cited',
]);
export type ArticleListSort = z.infer<typeof ArticleListSortSchema>;

export const ArticleListQuerySchema = z.object({
  // Query livre (full-text + pg_trgm via Wave 18 searchVector)
  q: z.string().max(200).optional(),

  // Filtros canônicos
  tradition: z.string().max(50).optional(),
  tag: z.string().max(80).optional(),         // match em tags[]
  level: z.enum(['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  format: z
    .enum(['SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'VIDEO', 'PODCAST', 'ESSAY'])
    .optional(),
  author: z.string().max(120).optional(),       // LIKE em authors[]

  // Janela temporal (createdAt)
  yearFrom: z.coerce.number().int().min(1500).max(new Date().getFullYear() + 1).optional(),
  yearTo: z.coerce.number().int().min(1500).max(new Date().getFullYear() + 1).optional(),

  // Paginação
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),

  // Ordenação (default: recent)
  sort: ArticleListSortSchema.optional().default('recent'),
});

export type ArticleListQuery = z.infer<typeof ArticleListQuerySchema>;

// ============================================================================
// ARTICLES — POST /api/articles/[slug]/read-progress
// ============================================================================
// Salva progresso pessoal de leitura. Idempotente via upsert.
// ============================================================================

export const ReadProgressSchema = z.object({
  // 0..100 (clamp na API). Monotônico crescente.
  percentRead: z.number().min(0).max(100),
  // Posição livre (ex: índice do parágrafo, scroll offset, etc)
  lastPosition: z.string().max(200).optional().nullable(),
});

export type ReadProgressInput = z.infer<typeof ReadProgressSchema>;

// ============================================================================
// FOLLOWERS / FOLLOWING — GET /api/users/[id]/followers, /following
// ============================================================================

export const FollowListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export type FollowListQuery = z.infer<typeof FollowListQuerySchema>;