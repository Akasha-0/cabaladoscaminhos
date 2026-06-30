// ============================================================================
// GET /api/payments/connect/status — Verificar status de onboarding do reader
// ============================================================================
// Wave 30. Usado pela UI para polling após reader voltar do Stripe hosted
// onboarding. Atualiza cache local + retorna status fresco da Stripe.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { getReaderConnectStatus } from '@/lib/payments/marketplace-service';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const status = await getReaderConnectStatus(viewer.id);

    if (!status) {
      return ok(
        {
          onboarded: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          requirements: {
            currentlyDue: [],
            pastDue: [],
            pendingVerification: [],
          },
        },
        { status: 200, meta: { message: 'Reader ainda não fez onboarding' } }
      );
    }

    return ok({
      onboarded: true,
      stripeAccountId: status.stripeAccountId,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirements: status.requirements,
      readyToReceive: status.chargesEnabled && status.payoutsEnabled,
    });
  } catch (err) {
    return handleError(err);
  }
}