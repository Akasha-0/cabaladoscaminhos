// ============================================================================
// POSTS SCHEMAS — Validação Zod para inputs da API de posts
// ============================================================================
// Schemas compartilhados por rotas API, server actions e testes. Mantemos
// a fonte da verdade em um único arquivo.
// ============================================================================

import { z } from 'zod';

/** Tipos válidos para posts — espelha PostType do Prisma. */
export const postTypeSchema = z.enum([
  'TEXT',
  'LINK',
  'ARTICLE',
  'QUESTION',
  'EXPERIENCE',
  'PRACTICE',
]);
export type PostTypeInput = z.infer<typeof postTypeSchema>;

/** Tradições válidas. Mantemos como string livre com regex. */
export const traditionSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens');

/** Slug de tópico (mesmas regras). */
export const topicSchema = traditionSchema;

/** Slug de grupo. */
export const groupSlugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/);

/** Schema para uma referência científica. */
export const referenceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url().optional(),
  doi: z.string().max(200).optional(),
  year: z.number().int().gte(1800).lte(2100).optional(),
});
export type ReferenceInput = z.infer<typeof referenceSchema>;

/** Schema para criação de post (POST /api/posts). */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Conteúdo obrigatório')
    .max(5000, 'Máximo 5000 caracteres'),
  type: postTypeSchema.default('TEXT'),
  tradition: traditionSchema.optional(),
  topic: topicSchema.optional(),
  groupSlug: groupSlugSchema.optional(),
  linkUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).max(8).optional(),
  references: z.array(referenceSchema).max(10).optional(),
  mentions: z.array(z.string().regex(/^@[a-z0-9-]+$/)).max(10).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

/** Schema para update parcial (PATCH /api/posts/[id]). */
export const updatePostSchema = z
  .object({
    content: z.string().min(1).max(5000).optional(),
    type: postTypeSchema.optional(),
    tradition: traditionSchema.nullable().optional(),
    topic: topicSchema.nullable().optional(),
    linkUrl: z.string().url().nullable().optional(),
    mediaUrls: z.array(z.string().url()).max(8).optional(),
    references: z.array(referenceSchema).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser enviado para atualização',
  });
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

/** Query schema para GET /api/posts (cursor pagination + filtros). */
export const listPostsQuerySchema = z.object({
  cursor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T.*_.*$/, 'Cursor inválido')
    .optional(),
  limit: z
    .coerce.number()
    .int()
    .min(1)
    .max(50)
    .default(20),
  tradition: traditionSchema.optional(),
  topic: topicSchema.optional(),
  groupSlug: groupSlugSchema.optional(),
  authorId: z.string().optional(),
  /** 'feed' | 'trending' | 'recent' — default 'recent' */
  filter: z.enum(['feed', 'trending', 'recent']).default('recent'),
});
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

/** Schema para criação de comentário (POST /api/posts/[id]/comments). */
export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/** Query schema para GET comments. */
export const listCommentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
