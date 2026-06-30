// ============================================================================
// POST /api/payments/release — Liberar pagamento ao reader (após sessão)
// ============================================================================
// Wave 30. Após a leitura/mentoria ser confirmada por ambas as partes,
// o cliente OU o reader chama este endpoint para marcar como RELEASED.
// Para destination charges, captura é automática no succeeded; aqui só
// sinalizamos "sessão OK, reader fica com o netAmount".
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { ReleasePaymentSchema } from '@/lib/validators/payments';
import {
  releaseMarketplacePayment,
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

    const parsed = ReleasePaymentSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const result = await releaseMarketplacePayment(
        parsed.data.paymentId,
        viewer.id,
        parsed.data.amount
      );

      return ok({
        paymentId: result.paymentId,
        status: result.status,
        amountCaptured: result.amountCaptured,
        message: 'Pagamento liberado para o reader',
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