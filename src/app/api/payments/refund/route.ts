// ============================================================================
// POST /api/payments/refund — Reembolsar pagamento (full ou partial)
// ============================================================================
// Wave 30. Permite refund full ou partial. Em caso de dispute aberta,
// bloqueia novo refund (deixar Stripe resolver).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { RefundSchema } from '@/lib/validators/payments';
import {
  refundMarketplacePayment,
  PaymentError,
} from '@/lib/payments/marketplace-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = RefundSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const refund = await refundMarketplacePayment(
        parsed.data.paymentId,
        viewer.id,
        {
          amount: parsed.data.amount,
          reason: parsed.data.reason,
        }
      );

      return ok({
        refundId: refund.id,
        paymentIntentId: refund.paymentIntentId,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        message: 'Reembolso processado (pode levar 5–10 dias úteis)',
      });
    } catch (err) {
      if (err instanceof PaymentError) {
        return fail(err.httpStatus, ErrorCode.BAD_REQUEST, err.message, {
          code: err.code,
        });
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}