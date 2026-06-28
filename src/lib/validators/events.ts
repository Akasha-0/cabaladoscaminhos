// ============================================================================
// ZOD SCHEMAS — EVENTS (Círculos de Partilha Online, Wave 13)
// ============================================================================
// Validação em runtime compartilhada entre API routes e (via reuso) os
// hooks do client.
// ============================================================================

import { z } from 'zod';

// ============================================================================
// CREATE EVENT
// ============================================================================

export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Título muito curto (mínimo 3)')
    .max(120, 'Título muito longo (máx 120)'),
  description: z
    .string()
    .min(10, 'Descrição muito curta (mínimo 10)')
    .max(4000, 'Descrição muito longa (máx 4000)'),
  tradition: z
    .string()
    .min(2, 'Tradição muito curta')
    .max(50, 'Tradição muito longa'),
  // ISO 8601 — Next.js route handler parseia string → Date
  startsAt: z
    .string()
    .datetime({ message: 'startsAt deve ser ISO 8601 (ex: 2026-07-01T19:00:00Z)' })
    .refine(
      (s) => new Date(s).getTime() > Date.now() - 60 * 1000,
      'startsAt deve estar no futuro'
    ),
  durationMin: z
    .number()
    .int()
    .min(5, 'Duração mínima 5 min')
    .max(720, 'Duração máxima 720 min (12h)')
    .optional()
    .default(60),
  maxParticipants: z
    .number()
    .int()
    .min(0, 'maxParticipants não pode ser negativo')
    .max(10000, 'maxParticipants muito alto')
    .optional()
    .default(0),
  isPublic: z.boolean().optional().default(true),
  meetingUrl: z
    .string()
    .url('meetingUrl inválida')
    .max(500)
    .optional()
    .nullable(),
  groupId: z.string().max(60).optional().nullable(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

// ============================================================================
// LIST EVENTS (query)
// ============================================================================

export const EventListQuerySchema = z.object({
  tradition: z.string().max(50).optional(),
  // Quando true, filtra apenas eventos futuros (padrão)
  upcoming: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? true : v === 'true')),
  isPublic: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  hostId: z.string().max(60).optional(),
  groupId: z.string().max(60).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export type EventListQuery = z.infer<typeof EventListQuerySchema>;

// ============================================================================
// JOIN / LEAVE (path param validado no route; body vazio)
// ============================================================================

export const EventIdParamSchema = z.object({
  id: z.string().min(8).max(60),
});

export type EventIdParam = z.infer<typeof EventIdParamSchema>;