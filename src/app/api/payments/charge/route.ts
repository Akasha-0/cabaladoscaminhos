// ============================================================================
// POST /api/payments/charge — Criar PaymentIntent (escrow) para leitura
// ============================================================================
// Wave 30. Cliente cria pagamento; dinheiro fica em escrow na plataforma até
// sessão ser confirmada (RELEASE) ou cancelada (REFUND).
//
// IMPORTANTE: este endpoint retorna APENAS o clientSecret para o frontend
// usar Stripe Elements. O PAN nunca toca nosso servidor.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import {
  CreateChargeSchema,
  calcPlatformFee,
  calcAffiliateFee,
} from '@/lib/validators/payments';
import { createMarketplaceCharge, PaymentError } from '@/lib/payments/marketplace-service';

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

    const parsed = CreateChargeSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    // Auto-calcula platformFee se cliente não passou (ou passou 0)
    let platformFee = parsed.data.platformFee;
    if (platformFee === 0) {
      platformFee = calcPlatformFee(parsed.data.amount);
    }

    // Affiliate fee é derivado
    const affiliateFee = parsed.data.affiliateId
      ? calcAffiliateFee(parsed.data.amount)
      : 0;

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '';
    const userAgent = request.headers.get('user-agent') ?? '';

    try {
      const result = await createMarketplaceCharge({
        readerId: parsed.data.readerId,
        clientId: viewer.id,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        platformFee,
        serviceType: parsed.data.serviceType,
        orderId: parsed.data.orderId,
        affiliateId: parsed.data.affiliateId,
        description: parsed.data.description,
        ip,
        userAgent,
      });

      return ok(
        {
          paymentId: result.paymentId,
          clientSecret: result.clientSecret,
          stripePaymentIntentId: result.stripePaymentIntentId,
          amount: result.amount,
          currency: result.currency,
          platformFee: result.platformFee,
          netAmount: result.netAmount,
          affiliateFee,
          status: result.status,
        },
        { status: 201, meta: { affiliateFee } }
      );
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