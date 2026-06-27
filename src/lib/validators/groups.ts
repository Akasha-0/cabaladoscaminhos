// ============================================================================
// ZOD SCHEMAS — GROUPS, MEMBERSHIPS, INVITES
// ============================================================================
// Validação em runtime compartilhada entre API routes, server actions e
// (via reuso) os hooks do client.
// ============================================================================

import { z } from 'zod';

// ============================================================================
// ENUMS espelhando o Prisma
// ============================================================================

export const GroupRoleSchema = z.enum(['MEMBER', 'MODERATOR', 'ADMIN']);

export const GroupInviteStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'REVOKED',
]);

// ============================================================================
// CREATE GROUP
// ============================================================================

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}$/;

export const CreateGroupSchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug muito curto')
    .max(50, 'Slug muito longo')
    .regex(
      SLUG_PATTERN,
      'Slug deve ter apenas letras minúsculas, números e hífens (sem espaços)'
    ),
  name: z
    .string()
    .min(2, 'Nome muito curto')
    .max(80, 'Nome muito longo (máx 80)'),
  description: z
    .string()
    .min(10, 'Descrição muito curta (mínimo 10 caracteres)')
    .max(500, 'Descrição muito longa (máx 500)'),
  longDescription: z
    .string()
    .max(4000, 'Descrição longa muito longa (máx 4000)')
    .optional()
    .nullable(),
  rules: z
    .array(z.string().min(3).max(200))
    .max(10, 'Máximo de 10 regras')
    .optional()
    .default([]),
  iconUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  tradition: z
    .string()
    .min(2, 'Tradição muito curta')
    .max(50, 'Tradição muito longa'),
  isPublic: z.boolean().optional().default(true),
  requireApproval: z.boolean().optional().default(false),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

// ============================================================================
// UPDATE GROUP (todos campos opcionais)
// ============================================================================

export const UpdateGroupSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().min(10).max(500).optional(),
  longDescription: z.string().max(4000).optional().nullable(),
  rules: z.array(z.string().min(3).max(200)).max(10).optional(),
  iconUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  tradition: z.string().min(2).max(50).optional(),
  isPublic: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
});

export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;

// ============================================================================
// LIST GROUPS (query)
// ============================================================================

export const GroupListQuerySchema = z.object({
  tradition: z.string().max(50).optional(),
  isPublic: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  mine: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export type GroupListQuery = z.infer<typeof GroupListQuerySchema>;

// ============================================================================
// MEMBERSHIP — invite / role change / leave
// ============================================================================

export const CreateInviteSchema = z.object({
  inviteeUserId: z.string().max(60).optional().nullable(),
  inviteeEmail: z
    .string()
    .email('Email inválido')
    .max(160)
    .optional()
    .nullable(),
}).refine(
  (d) => Boolean(d.inviteeUserId) !== Boolean(d.inviteeEmail),
  { message: 'Informe inviteeUserId OU inviteeEmail (apenas um)' }
);

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(8).max(80),
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: GroupRoleSchema,
});

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

// ============================================================================
// RE-EXPORTS convenientes
// ============================================================================

export { GroupRoleSchema as RoleSchema };
