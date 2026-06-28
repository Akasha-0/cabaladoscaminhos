// ============================================================================
// ZOD SCHEMAS — MENTORSHIP 1-on-1 (Onda 13, 2026-06-27)
// ============================================================================

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const MentorshipStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'COMPLETED',
]);

export const MentorshipTraditionSchema = z.string().min(2).max(50);

// ============================================================================
// LIST AVAILABLE MENTORS (query)
// ============================================================================

export const ListMentorsQuerySchema = z.object({
  tradition: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type ListMentorsQuery = z.infer<typeof ListMentorsQuerySchema>;

// ============================================================================
// REQUEST MENTORSHIP
// ============================================================================

export const RequestMentorshipSchema = z.object({
  mentorId: z.string().min(3).max(60),
  tradition: MentorshipTraditionSchema,
  message: z.string().max(1000).optional().nullable(),
});

export type RequestMentorshipInput = z.infer<typeof RequestMentorshipSchema>;

// ============================================================================
// END MENTORSHIP
// ============================================================================

export const EndMentorshipSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export type EndMentorshipInput = z.infer<typeof EndMentorshipSchema>;

// ============================================================================
// SEND MESSAGE
// ============================================================================

export const SendMentorshipMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem vazia')
    .max(4000, 'Mensagem muito longa (máx 4000)'),
});

export type SendMentorshipMessageInput = z.infer<
  typeof SendMentorshipMessageSchema
>;

// ============================================================================
// LIST MY MENTORSHIPS (query)
// ============================================================================

export const ListMyMentorshipsQuerySchema = z.object({
  status: MentorshipStatusSchema.optional(),
});

export type ListMyMentorshipsQuery = z.infer<
  typeof ListMyMentorshipsQuerySchema
>;