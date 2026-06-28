// ============================================================================
// PATCH /api/flags/[name] — Admin: atualiza uma flag (Wave 20)
// ============================================================================
// Body (todos opcionais):
//   { enabled?: boolean, rolloutPercent?: number,
//     addToWhitelist?: string, removeFromWhitelist?: string }
//
// Auth: admin only (requireAdmin — Wave 25 fix, substituiu NODE_ENV gate).
//
// Audit: updatedBy vem do body ou do cookie userId (futuro: do JWT).
// ============================================================================

import { cookies } from 'next/headers';
import { z } from 'zod';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { isValidFlagKey } from '@/lib/feature-flags/flags';
import { upsertFlag } from '@/lib/feature-flags/storage';

export const dynamic = 'force-dynamic';

const PatchSchema = z
  .object({
    enabled: z.boolean().nullable().optional(),
    rolloutPercent: z.number().int().min(0).max(100).optional(),
    addToWhitelist: z.string().min(1).max(128).optional(),
    removeFromWhitelist: z.string().min(1).max(128).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.enabled !== undefined ||
      data.rolloutPercent !== undefined ||
      data.addToWhitelist !== undefined ||
      data.removeFromWhitelist !== undefined,
    { message: 'Nenhum campo para atualizar' }
  );

export async function PATCH(
  request: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Admin required (${session.reason})`,
        403
      );
    }

    const { name } = await context.params;
    if (!isValidFlagKey(name)) {
      return fail(404, ErrorCode.NOT_FOUND, `Flag '${name}' não existe no registry`);
    }

    const body = await request.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return fail(400, ErrorCode.VALIDATION_ERROR, 'Body inválido', parsed.error.issues);
    }

    const cookieStore = await cookies();
    const updatedBy = cookieStore.get('userId')?.value ?? 'admin';

    const state = await upsertFlag(name, { ...parsed.data, updatedBy });

    return ok(
      { name, ...state },
      { cache: { noStore: true } }
    );
  } catch (err) {
    return handleError(err);
  }
}
