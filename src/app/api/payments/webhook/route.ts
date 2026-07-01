// ============================================================================
// POST /api/payments/webhook — Receber eventos Stripe (idempotente + audit)
// ============================================================================
// Wave 33 (2026-07-01). Endpoint público (sem auth) que recebe eventos da
// Stripe.
//
// SEGURANÇA (8 regras éticas Akasha — W30-6 + W33):
//   1) SEMPRE verificar signature (whsec_...) ANTES de qualquer side-effect
//   2) SEMPRE ler raw body (Stripe usa formato raw, NÃO JSON parseado)
//   3) SEMPRE dedupe via ProcessedStripeEvent (idempotência)
//   4) SEMPRE persistir WebhookEvent (audit log LGPD Art. 37)
//   5) Retornar 200 rápido; erros transient devem dar 500 para retry Stripe
//   6) NUNCA logar PAN / PII cru — usar maskEmail/maskPhone/maskName
//   7) Rate limit aplicado via Next middleware
//   8) Idempotency key por event.id (não por timestamp)
//
// DIFERENÇA ENTRE ProcessedStripeEvent vs WebhookEvent:
//   - ProcessedStripeEvent: dedupe (UNIQUE eventId, sem payload)
//   - WebhookEvent: audit completo (payload + PII-stripped metadata)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import {
  verifyWebhookSignature,
  handleStripeWebhookEvent,
  StripeEvent,
} from '@/lib/payments/stripe';
import {
  WebhookHandlers,
  isEventProcessed,
  markEventProcessed,
  persistWebhookEvent,
} from '@/lib/payments/marketplace-service';
import { stripPiiFromStripePayload } from '@/lib/payments/webhook-log';
import { SubscriptionWebhookHandlers } from '@/lib/billing/subscription-service';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const dynamic = 'force-dynamic';
// IMPORTANTE: desabilitar body parsing automático do Next para manter raw body
export const runtime = 'nodejs';

// ============================================================================
// POST /api/payments/webhook
// ============================================================================

export async function POST(request: NextRequest) {
  const start = Date.now();
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
      // Loga falha sem PII (não temos event ainda — signature inválida)
      console.warn(
        `[webhook] signature inválida: reason=${verification.reason}`
      );
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        `Signature inválida: ${verification.reason}`
      );
    }

    const event: StripeEvent = verification.event;

    // 3. Checagem idempotência — se já processado, retorna 200 sem side-effects
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      // Persistir como duplicate (audit trail) e responder 200 idempotente
      await persistWebhookEvent({
        stripeId: event.id,
        type: event.type,
        apiVersion: event.api_version,
        livemode: event.livemode,
        processed: true,
        duplicate: true,
        payload: event,
        metadata: stripPiiFromStripePayload(event),
        durationMs: Date.now() - start,
        accountId: event.account ?? null,
      });
      console.info(
        `[webhook] duplicate event stripeId=${event.id} type=${event.type} livemode=${event.livemode}`
      );
      return ok({
        received: true,
        eventId: event.id,
        duplicate: true,
        handled: true,
      });
    }

    // 4. Processa evento (idempotente internamente)
    const outcome = await handleStripeWebhookEvent(event, {
      isAlreadyProcessed: isEventProcessed,
      markProcessed: (id, type) =>
        markEventProcessed(id, type, event.livemode),
      onPaymentSucceeded: WebhookHandlers.onPaymentSucceeded,
      onPaymentFailed: WebhookHandlers.onPaymentFailed,
      onPaymentCanceled: async (pi) => {
        // Tratar cancelamento como update de status
        await WebhookHandlers.onPaymentFailed(pi);
      },
      onChargeRefunded: WebhookHandlers.onChargeRefunded,
      onDisputeCreated: WebhookHandlers.onDisputeCreated,
      onDisputeClosed: WebhookHandlers.onDisputeClosed,
      onAccountUpdated: WebhookHandlers.onAccountUpdated,
      onPayoutPaid: WebhookHandlers.onPayoutPaid,
      onPayoutFailed: WebhookHandlers.onPayoutFailed,
      // Subscription lifecycle handlers (Wave 37)
      onSubscriptionCreated: (sub) =>
        SubscriptionWebhookHandlers['customer.subscription.created'](
          { subscription: sub, prisma: getBillingPrisma() }
        ),
      onSubscriptionUpdated: (sub) =>
        SubscriptionWebhookHandlers['customer.subscription.updated'](
          { subscription: sub, prisma: getBillingPrisma() }
        ),
      onSubscriptionDeleted: (sub) =>
        SubscriptionWebhookHandlers['customer.subscription.deleted'](
          { subscription: sub, prisma: getBillingPrisma() }
        ),
      onInvoicePaymentSucceeded: (invoice) =>
        SubscriptionWebhookHandlers['invoice.payment_succeeded'](
          { invoice, prisma: getBillingPrisma() }
        ),
      onInvoicePaymentFailed: (invoice) =>
        SubscriptionWebhookHandlers['invoice.payment_failed'](
          { invoice, prisma: getBillingPrisma() }
        ),
      onTrialWillEnd: (sub) =>
        SubscriptionWebhookHandlers['customer.subscription.trial_will_end'](
          { subscription: sub, prisma: getBillingPrisma() }
        ),
    });

    // 5. Persist audit trail
    const handled =
      'handled' in outcome && outcome.handled === false ? false : true;
    const reason =
      'handled' in outcome && outcome.handled === false
        ? outcome.reason
        : undefined;

    await persistWebhookEvent({
      stripeId: outcome.eventId,
      type: event.type,
      apiVersion: event.api_version,
      livemode: event.livemode,
      processed: handled,
      duplicate: false,
      payload: event,
      metadata: stripPiiFromStripePayload(event),
      error: handled ? undefined : `not_handled:${reason ?? 'unknown'}`,
      durationMs: Date.now() - start,
      accountId: event.account ?? null,
    });

    console.info(
      `[webhook] processed event stripeId=${outcome.eventId} type=${event.type} handled=${handled} durationMs=${Date.now() - start}`
    );

    return ok({
      received: true,
      eventId: outcome.eventId,
      duplicate: false,
      handled,
      reason: handled ? undefined : reason,
    });
  } catch (err) {
    console.error('[webhook] erro:', (err as Error).message);
    // Retornar 500 faz Stripe reentregar (retry exponencial até 3 dias)
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro processando webhook');
  }
}