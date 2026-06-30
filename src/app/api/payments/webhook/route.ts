// ============================================================================
// POST /api/payments/webhook — Receber eventos Stripe (idempotente)
// ============================================================================
// Wave 30. Endpoint público (sem auth) que recebe eventos da Stripe.
//
// SEGURANÇA (8 regras éticas Akasha):
//   1) SEMPRE verificar signature (whsec_...)
//   2) SEMPRE ler raw body (Stripe usa formato raw, NÃO JSON parseado)
//   3) SEMPRE dedupe via ProcessedStripeEvent
//   4) Retornar 200 rápido; erros devem dar 500 para retry da Stripe
//   5) NUNCA logar PAN / dados sensíveis
//   6) Rate limit aplicado via Next middleware
//   7) Idempotency key por event.id (não por timestamp)
//   8) Audit log de cada evento processado
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import {
  verifyWebhookSignature,
  handleStripeWebhookEvent,
} from '@/lib/payments/stripe';
import {
  WebhookHandlers,
  isEventProcessed,
  markEventProcessed,
} from '@/lib/payments/marketplace-service';

export const dynamic = 'force-dynamic';
// IMPORTANTE: desabilitar body parsing automático do Next para manter raw body
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. Lê raw body (signature verifica contra raw bytes)
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('stripe-signature');

    if (!signatureHeader) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Header stripe-signature ausente');
    }

    // 2. Verifica signature
    const verification = await verifyWebhookSignature(rawBody, signatureHeader);
    if (!verification.valid) {
      return fail(400, ErrorCode.BAD_REQUEST, `Signature inválida: ${verification.reason}`);
    }
    const event = verification.event;

    // 3. Processa idempotentemente
    const outcome = await handleStripeWebhookEvent(event, {
      isAlreadyProcessed,
      markProcessed: (id, type) =>
        markEventProcessed(id, type, event.livemode),
      onPaymentSucceeded: WebhookHandlers.onPaymentSucceeded,
      onPaymentFailed: WebhookHandlers.onPaymentFailed,
      onPaymentCanceled: async (pi) => {
        // Tratar cancelamento como update de status
        const prismaMod = await import('@/lib/payments/marketplace-service');
        await prismaMod.WebhookHandlers.onPaymentFailed(pi);
      },
      onChargeRefunded: WebhookHandlers.onChargeRefunded,
      onDisputeCreated: WebhookHandlers.onDisputeCreated,
      onDisputeClosed: WebhookHandlers.onDisputeClosed,
      onAccountUpdated: WebhookHandlers.onAccountUpdated,
      onPayoutPaid: WebhookHandlers.onPayoutPaid,
      onPayoutFailed: WebhookHandlers.onPayoutFailed,
    });

    return ok({
      received: true,
      eventId: outcome.eventId,
      handled: outcome.handled,
      reason: 'handled' in outcome && outcome.handled === false ? outcome.reason : undefined,
    });
  } catch (err) {
    console.error('[webhook] erro:', (err as Error).message);
    // Retornar 500 faz Stripe reentregar (retry exponencial até 3 dias)
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro processando webhook');
  }
}