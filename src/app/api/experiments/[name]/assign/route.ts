// ============================================================================
// POST /api/experiments/[name]/assign — Atribui variante (Wave 20)
// ============================================================================
// Body:
//   { userId: string, variants: [{ name, weight, payload? }] }
//
// Retorna:
//   { data: { experiment, variant, hash, percentile } }
//
// Quando o cliente quiser apenas a variante calculada server-side (ex:
// hydration-safe), chama este endpoint. Para uso client-side direto,
// prefira import { assignVariant } de @/lib/feature-flags/experiments.
//
// Cache: no-store (decisão por request).
// ============================================================================

import { z } from 'zod';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { assignVariant, trackExposure } from '@/lib/feature-flags/experiments';

export const dynamic = 'force-dynamic';

const VariantSchema = z.object({
  name: z.string().min(1).max(64),
  weight: z.number().min(0).max(100),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const AssignSchema = z.object({
  userId: z.string().min(1).max(128),
  variants: z.array(VariantSchema).min(1).max(8),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    if (!name || name.length > 128) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Nome do experimento inválido');
    }

    const body = await request.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return fail(400, ErrorCode.VALIDATION_ERROR, 'Body inválido', parsed.error.issues);
    }

    const { userId, variants } = parsed.data;
    const assignment = assignVariant(userId, name, variants);

    // Log de exposição (server-side, antes de retornar)
    trackExposure(userId, assignment);

    return ok(assignment, { cache: { noStore: true } });
  } catch (err) {
    return handleError(err);
  }
}
