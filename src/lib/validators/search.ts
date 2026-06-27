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
// GET /api/search — busca completa com paginação cursor
// ============================================================================

export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Query obrigatória').max(200, 'Query muito longa'),
  type: SearchTypeSchema.optional().default('all'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  // Filtros
  tradition: z.string().max(50).optional(),         // post.tradition ou article.tradition
  tag: z.string().max(80).optional(),               // post.topic ou article.tags[] contém
  sort: SearchSortSchema.optional().default('relevance'),
  // Janela temporal (opcional)
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
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
