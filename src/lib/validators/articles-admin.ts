// ============================================================================
// ZOD SCHEMAS — ARTICLE ADMIN CRUD (Wave 29)
// ============================================================================
// Validação para criação e atualização de artigos pela curadoria.
// Schemas separados dos validators públicos (articles.ts) para isolar
// regras de admin (campos opcionais em PATCH, defaults em POST).
//
// Curadores: Iyá (Bibliotecária) + Akasha. Não inventar evidências —
// evidenceLevel é obrigatório e citations exige source URL.
// ============================================================================

import { z } from 'zod';

// Slug canônico — kebab-case, 3-120 chars, lowercase
const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'slug deve ser kebab-case (a-z, 0-9, hífens)');

// DOI canônico — formato 10.NNNN/anything (sem prefixo https://doi.org/)
const doiSchema = z
  .string()
  .regex(/^10\.\d{4,9}\/[^\s]+$/u, 'DOI deve começar com 10. e ter sufixo');

const urlSchema = z.string().url().max(500);

// ============================================================================
// ArticleCreateSchema — POST /api/articles
// ============================================================================

export const ArticleCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(5).max(300),
  summary: z.string().min(20).max(2000),
  content: z.string().min(50).max(500_000), // markdown PT-BR

  type: z
    .enum(['SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'VIDEO', 'PODCAST', 'ESSAY'])
    .default('SCIENTIFIC_PAPER'),

  evidenceLevel: z.enum(['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH']),

  tradition: z.string().max(50).nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  authors: z.array(z.string().min(1).max(120)).max(20).default([]),

  // Bibliographic (opcional, mas recomendado para SCIENTIFIC_PAPER)
  journal: z.string().max(200).nullable().optional(),
  year: z
    .number()
    .int()
    .min(1500)
    .max(new Date().getFullYear() + 1)
    .default(new Date().getFullYear()),
  doi: doiSchema.nullable().optional(),
  url: urlSchema.nullable().optional(),

  language: z.enum(['pt', 'en', 'es']).default('pt'),

  // Curadoria
  curatedBy: z.string().max(120).nullable().optional(),
  source: z.string().max(120).nullable().optional(),
  contributor: z.string().max(120).nullable().optional(),

  // Auditoria
  safetyNotes: z.string().max(2000).nullable().optional(),
  curatorNotes: z.string().max(2000).nullable().optional(),

  publishedAt: z.string().datetime().nullable().optional(),
});

export type ArticleCreateInput = z.infer<typeof ArticleCreateSchema>;

// ============================================================================
// ArticleUpdateSchema — PATCH /api/articles/[slug]
// ============================================================================

export const ArticleUpdateSchema = z
  .object({
    title: z.string().min(5).max(300).optional(),
    summary: z.string().min(20).max(2000).optional(),
    content: z.string().min(50).max(500_000).optional(),

    type: z
      .enum(['SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'VIDEO', 'PODCAST', 'ESSAY'])
      .optional(),

    evidenceLevel: z.enum(['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH']).optional(),

    tradition: z.string().max(50).nullable().optional(),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
    authors: z.array(z.string().min(1).max(120)).max(20).optional(),

    journal: z.string().max(200).nullable().optional(),
    year: z
      .number()
      .int()
      .min(1500)
      .max(new Date().getFullYear() + 1)
      .optional(),
    doi: doiSchema.nullable().optional(),
    url: urlSchema.nullable().optional(),

    language: z.enum(['pt', 'en', 'es']).optional(),

    curatedBy: z.string().max(120).nullable().optional(),
    source: z.string().max(120).nullable().optional(),

    safetyNotes: z.string().max(2000).nullable().optional(),
    curatorNotes: z.string().max(2000).nullable().optional(),

    publishedAt: z.string().datetime().nullable().optional(),
  })
  .strict(); // rejeita campos não-listados

export type ArticleUpdateInput = z.infer<typeof ArticleUpdateSchema>;

// ============================================================================
// ArticleDeleteSchema — DELETE /api/articles/[slug]
// ============================================================================

export const ArticleDeleteSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .default({});

export type ArticleDeleteInput = z.infer<typeof ArticleDeleteSchema>;