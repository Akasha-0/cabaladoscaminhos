// ============================================================================
// ZOD SCHEMAS — FLAGS / MODERATION
// ============================================================================
// Validação compartilhada entre API routes e formulários client.
// ============================================================================

import { z } from 'zod';

export const FlagTargetTypeSchema = z.enum(['POST', 'COMMENT', 'USER', 'GROUP']);
export const FlagReasonSchema = z.enum(['SPAM', 'HARASSMENT', 'MISINFO', 'OTHER']);
export const FlagStatusSchema = z.enum(['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED']);

export const CreateFlagSchema = z.object({
  targetType: FlagTargetTypeSchema,
  targetId: z.string().min(1).max(60),
  reason: FlagReasonSchema,
  description: z
    .string()
    .max(500, 'Descrição muito longa (máx 500 caracteres)')
    .optional()
    .nullable(),
});

export type CreateFlagInput = z.infer<typeof CreateFlagSchema>;

export const FlagListQuerySchema = z.object({
  status: FlagStatusSchema.optional(),
  targetType: FlagTargetTypeSchema.optional(),
  reason: FlagReasonSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});

export type FlagListQuery = z.infer<typeof FlagListQuerySchema>;

export const FlagActionSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'delete']),
  // Opcional: nota interna do admin (não exibida ao reporter)
  note: z.string().max(1000).optional().nullable(),
});

export type FlagActionInput = z.infer<typeof FlagActionSchema>;
