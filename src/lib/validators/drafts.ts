// ============================================================================
// ZOD SCHEMAS — DRAFTS (2026-06-27, Onda 14b)
// ============================================================================
// Validação runtime compartilhada pelos endpoints /api/drafts e o hook
// useAutoSave no client.
// ============================================================================

import { z } from 'zod';

export const DraftCreateSchema = z.object({
  // Quando vier `id`, o endpoint faz upsert (auto-save do mesmo draft)
  id: z.string().min(1).max(60).optional(),
  title: z.string().max(200).optional().nullable(),
  content: z.string().max(40_000, 'Rascunho muito longo (máx 40k)'),
  tradition: z.string().max(50).optional().nullable(),
  topic: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().max(40)).max(15).optional(),
});

export type DraftCreateInput = z.infer<typeof DraftCreateSchema>;

export const DraftUpdateSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().max(40_000).optional(),
  tradition: z.string().max(50).optional().nullable(),
  topic: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().max(40)).max(15).optional(),
});

export type DraftUpdateInput = z.infer<typeof DraftUpdateSchema>;
