// ============================================================================
// ZOD SCHEMAS — POSTS / COMMENTS / LIKES
// ============================================================================
// Validação em runtime compartilhada entre API routes, server actions e
// (via reuso) os hooks do client.
// ============================================================================

import { z } from 'zod';

export const PostTypeSchema = z.enum([
  'TEXT',
  'LINK',
  'ARTICLE',
  'QUESTION',
  'EXPERIENCE',
  'PRACTICE',
]);

export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Conteúdo não pode estar vazio')
    .max(4000, 'Conteúdo muito longo (máx 4000 caracteres)'),
  type: PostTypeSchema.optional().default('TEXT'),
  tradition: z.string().max(50).optional().nullable(),
  topic: z.string().max(80).optional().nullable(),
  groupSlug: z.string().max(50).optional().nullable(),
  mediaUrls: z.array(z.string().url()).max(8).optional(),
  references: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        url: z.string().url().optional(),
        doi: z.string().max(120).optional(),
        year: z.number().int().min(1500).max(new Date().getFullYear() + 1).optional(),
      })
    )
    .max(10)
    .optional(),
  mentions: z.array(z.string().max(50)).max(10).optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = CreatePostSchema.partial().extend({
  content: z.string().min(1).max(4000).optional(),
});

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const FeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  tradition: z.string().max(50).optional(),
  topic: z.string().max(80).optional(),
  authorId: z.string().max(60).optional(),
  groupSlug: z.string().max(50).optional(),
  filter: z.enum(['all', 'seguindo', 'grupos', 'tendencias', 'para-voce']).optional(),
});

export type FeedQuery = z.infer<typeof FeedQuerySchema>;

// ============================================================================
// COMMENTS
// ============================================================================

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário vazio')
    .max(2000, 'Comentário muito longo (máx 2000)'),
  parentId: z.string().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const CommentQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  parentId: z.string().optional().nullable(),
});

export type CommentQuery = z.infer<typeof CommentQuerySchema>;