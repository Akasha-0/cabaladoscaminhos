// ============================================================================
// POST /api/admin/ai-review/[id]/decide — Wave 36 (2026-07-01)
// ============================================================================// Recebe decisão de curador sobre uma conversa Akasha.
//
// Body (form-data):
//   decision : GOOD | NEEDS_IMPROVEMENT | UNSAFE | REFUSED_CORRECTLY
//   notes    : string (opcional)
//
// Side effects:
//   - Marca item como decided (status = decision)
//   - Se UNSAFE: dispara alerta para Iyá (email, dashboard)
//   - Se GOOD: adiciona ao fine-tune candidate set
//   - Se NEEDS_IMPROVEMENT: adiciona ao negative examples set
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { submitReviewDecision } from '@/lib/ai/eval/review-service';

export const runtime = 'nodejs';

const DecisionSchema = z.object({
  decision: z.enum(['GOOD', 'NEEDS_IMPROVEMENT', 'UNSAFE', 'REFUSED_CORRECTLY']),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.UNAUTHORIZED, 'Acesso restrito a admins', 401);
    }

    const formData = await request.formData();
    const parsed = DecisionSchema.safeParse({
      decision: formData.get('decision'),
      notes: formData.get('notes') ?? undefined,
    });
    if (!parsed.success) {
      return fail(
        ErrorCode.VALIDATION_ERROR,
        'Decisão inválida',
        400,
        fromZodError(parsed.error),
      );
    }

    const result = await submitReviewDecision(
      params.id,
      parsed.data.decision,
      session.userId ?? 'unknown',
      parsed.data.notes,
    );

    // Redirect back to review queue
    const referer = request.headers.get('referer');
    const redirectUrl = referer ?? '/admin/ai-review';
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    return handleError(err);
  }
}
