// ============================================================================
// ZOD SCHEMAS — SEARCH & DISCOVERY (Onda 12, 2026-06-27)
// ============================================================================
// Schemas compartilhados entre API routes (/api/search, /api/search/suggestions)
// e o client (useSearch, <SearchBar/>).
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Tipos de busca
// ============================================================================

export const SearchTypeSchema = z.enum([
  'all',
  'posts',
  'articles',
  'users',      // mapeia para SpiritualProfile (perfis públicos)
  'groups',
  'tags',       // tags agregadas (post.tradition, post.topic, article.tags)
]);
export type SearchType = z.infer<typeof SearchTypeSchema>;

// ============================================================================
// Ordenação
// ============================================================================

export const SearchSortSchema = z.enum(['relevance', 'recent', 'popular']);
export type SearchSort = z.infer<typeof SearchSortSchema>;

// ============================================================================
// Evidence level + article type (Wave 18 — filtros ricos)
// ============================================================================

export const EvidenceLevelFilterSchema = z.enum(['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH']);
export type EvidenceLevelFilter = z.infer<typeof EvidenceLevelFilterSchema>;

export const ArticleFormatFilterSchema = z.enum([
  'SCIENTIFIC_PAPER',
  'MAGAZINE_ARTICLE',
  'BOOK',
  'VIDEO',
  'PODCAST',
  'ESSAY',
]);
export type ArticleFormatFilter = z.infer<typeof ArticleFormatFilterSchema>;

// ============================================================================
// GET /api/search — busca completa com paginação cursor
// ============================================================================
// Wave 18: filtros expandidos — level (evidence), format (article type),
// author, dateFrom/dateTo (alias semântico), hasAudio/hasVideo.
// ============================================================================

export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Query obrigatória').max(200, 'Query muito longa'),
  type: SearchTypeSchema.optional().default('all'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  // Filtros canônicos
  tradition: z.string().max(50).optional(),         // post.tradition ou article.tradition
  tag: z.string().max(80).optional(),               // post.topic ou article.tags[] contém
  level: EvidenceLevelFilterSchema.optional(),      // article.evidenceLevel
  format: ArticleFormatFilterSchema.optional(),    // article.type
  author: z.string().max(120).optional(),           // article.authors[] contém
  // Janela temporal (Wave 18 — alias semântico; mantém compat com from/to)
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  // Filtros booleanos (Wave 18)
  hasAudio: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  hasVideo: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  sort: SearchSortSchema.optional().default('relevance'),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// ============================================================================
// GET /api/search/suggestions — autocomplete
// ============================================================================

export const SuggestionQuerySchema = z.object({
  q: z.string().min(1, 'Query obrigatória').max(80, 'Query muito longa'),
  limit: z.coerce.number().int().min(1).max(10).optional().default(8),
});
export type SuggestionQuery = z.infer<typeof SuggestionQuerySchema>;

// ============================================================================
// GET /tags/[tag] — página de tag
// ============================================================================

export const TagPageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  type: z.enum(['all', 'posts', 'articles', 'people']).optional().default('all'),
});
export type TagPageQuery = z.infer<typeof TagPageQuerySchema>;
