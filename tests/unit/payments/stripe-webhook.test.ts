/**
 * Unit Tests — Stripe Webhook Handler (Wave 33, 2026-07-01)
 *
 * Cobre src/app/api/payments/webhook/route.ts:
 *   - Valid signature → 200 (evento processado)
 *   - Invalid signature → 400 (rejeitado sem side-effect)
 *   - Duplicate event (idempotência) → 200 com flag duplicate=true
 *   - Unknown event type → 200 (acknowledged, not handled)
 *
 * Estratégia: mockar `verifyWebhookSignature`, `handleStripeWebhookEvent`,
 * `isEventProcessed`, `markEventProcessed`, `WebhookHandlers` e
 * `persistWebhookEvent`. Stripe REST + Prisma são mockados em todas as
 * camadas — nenhum IO real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'node:crypto';

// ============================================================================
// MOCKS — antes dos imports
// ============================================================================

// Set env antes dos imports
const WEBHOOK_SECRET = 'whsec_test_w33_at_least_32_chars_long_xxxxxxxxxxxx';
vi.stubEnv('STRIPE_WEBHOOK_SECRET', WEBHOOK_SECRET);

// Mock do stripe lib (verifyWebhookSignature + handleStripeWebhookEvent)
const mockVerifyWebhookSignature = vi.fn();
const mockHandleStripeWebhookEvent = vi.fn();
vi.mock('@/lib/payments/stripe', () => ({
  verifyWebhookSignature: mockVerifyWebhookSignature,
  handleStripeWebhookEvent: mockHandleStripeWebhookEvent,
}));

// Mock do marketplace-service (handlers + dedupe + persistWebhookEvent)
const mockIsEventProcessed = vi.fn();
const mockMarkEventProcessed = vi.fn();
const mockPersistWebhookEvent = vi.fn();
const mockOnPaymentSucceeded = vi.fn();
const mockOnPaymentFailed = vi.fn();
const mockOnChargeRefunded = vi.fn();
const mockOnDisputeCreated = vi.fn();
const mockOnDisputeClosed = vi.fn();
const mockOnAccountUpdated = vi.fn();
const mockOnPayoutPaid = vi.fn();
const mockOnPayoutFailed = vi.fn();

vi.mock('@/lib/payments/marketplace-service', () => ({
  WebhookHandlers: {
    onPaymentSucceeded: mockOnPaymentSucceeded,
    onPaymentFailed: mockOnPaymentFailed,
    onChargeRefunded: mockOnChargeRefunded,
    onDisputeCreated: mockOnDisputeCreated,
    onDisputeClosed: mockOnDisputeClosed,
    onAccountUpdated: mockOnAccountUpdated,
    onPayoutPaid: mockOnPayoutPaid,
    onPayoutFailed: mockOnPayoutFailed,
  },
  isEventProcessed: mockIsEventProcessed,
  markEventProcessed: mockMarkEventProcessed,
  persistWebhookEvent: mockPersistWebhookEvent,
}));

// ============================================================================
// Import AFTER mocks
// ============================================================================

import { POST } from '@/app/api/payments/webhook/route';
import type { NextRequest } from 'next/server';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a NextRequest-like object with raw body + Stripe signature.
 */
function buildStripeRequest(
  payload: object | string,
  opts: { includeSignature?: boolean; signatureOverride?: string } = {}
): NextRequest {
  const rawBody =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000);
  const sig =
    opts.signatureOverride ??
    (opts.includeSignature === false
      ? ''
      : createHmac('sha256', WEBHOOK_SECRET)
          .update(`${ts}.${rawBody}`)
          .digest('hex'));

  const headers = new Headers();
  if (sig !== '') headers.set('stripe-signature', `t=${ts},v1=${sig}`);

  return new Request('http://localhost:3000/api/payments/webhook', {
    method: 'POST',
    body: rawBody,
    headers,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// TEST 1 — Valid signature → 200
// ============================================================================

describe('POST /api/payments/webhook', () => {
  it('1) signature válida → 200 + handled=true + persist audit', async () => {
    const event = {
      id: 'evt_test_001',
      type: 'payment_intent.succeeded',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_test', amount_received: 10000 } },
      livemode: false,
    };

    mockVerifyWebhookSignature.mockResolvedValue({ valid: true, event });
    mockIsEventProcessed.mockResolvedValue(false);
    mockHandleStripeWebhookEvent.mockResolvedValue({
      eventId: event.id,
      handled: true,
    });
    mockPersistWebhookEvent.mockResolvedValue(undefined);

    const req = buildStripeRequest(event);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({
      received: true,
      eventId: 'evt_test_001',
      duplicate: false,
      handled: true,
    });

    // Signature foi verificada
    expect(mockVerifyWebhookSignature).toHaveBeenCalledTimes(1);
    // Idempotência checada
    expect(mockIsEventProcessed).toHaveBeenCalledWith('evt_test_001');
    // Event handler executado
    expect(mockHandleStripeWebhookEvent).toHaveBeenCalledTimes(1);
    // Audit log persistido
    expect(mockPersistWebhookEvent).toHaveBeenCalledTimes(1);
    const persistCall = mockPersistWebhookEvent.mock.calls[0]?.[0];
    expect(persistCall).toMatchObject({
      stripeId: 'evt_test_001',
      type: 'payment_intent.succeeded',
      processed: true,
      duplicate: false,
      livemode: false,
    });
    expect(typeof persistCall?.durationMs).toBe('number');
  });
});

// ============================================================================
// TEST 2 — Invalid signature → 400
// ============================================================================

describe('Invalid signature', () => {
  it('2) signature inválida → 400 + sem side-effects', async () => {
    mockVerifyWebhookSignature.mockResolvedValue({
      valid: false,
      reason: 'signature_mismatch',
    });

    const req = buildStripeRequest({ id: 'evt_x', type: 'ping' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error?.code).toBe(4000);
    expect(body.error?.message).toMatch(/signature/i);

    // CRÍTICO: nada deve ter sido persistido ou roteado
    expect(mockIsEventProcessed).not.toHaveBeenCalled();
    expect(mockHandleStripeWebhookEvent).not.toHaveBeenCalled();
    expect(mockPersistWebhookEvent).not.toHaveBeenCalled();
  });

  it('2b) signature header ausente → 400', async () => {
    const req = buildStripeRequest({ id: 'evt_x' }, {
      includeSignature: false,
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error?.message).toMatch(/stripe-signature/i);
    expect(mockVerifyWebhookSignature).not.toHaveBeenCalled();
  });
});

// ============================================================================
// TEST 3 — Duplicate event → 200 idempotent
// ============================================================================

describe('Idempotência', () => {
  it('3) evento já processado → 200 com duplicate=true (sem re-execução)', async () => {
    const event = {
      id: 'evt_duplicate_001',
      type: 'charge.refunded',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'ch_123', payment_intent: 'pi_123' } },
      livemode: false,
    };

    mockVerifyWebhookSignature.mockResolvedValue({ valid: true, event });
    mockIsEventProcessed.mockResolvedValue(true); // ← já processado!
    mockPersistWebhookEvent.mockResolvedValue(undefined);

    const req = buildStripeRequest(event);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({
      received: true,
      eventId: 'evt_duplicate_001',
      duplicate: true,
      handled: true,
    });

    // CRÍTICO: handler NÃO deve ter sido chamado (idempotência)
    expect(mockHandleStripeWebhookEvent).not.toHaveBeenCalled();
    expect(mockMarkEventProcessed).not.toHaveBeenCalled();

    // MAS: audit trail foi persistido como duplicate=true
    expect(mockPersistWebhookEvent).toHaveBeenCalledTimes(1);
    const persistCall = mockPersistWebhookEvent.mock.calls[0]?.[0];
    expect(persistCall).toMatchObject({
      stripeId: 'evt_duplicate_001',
      duplicate: true,
      processed: true,
    });
  });
});

// ============================================================================
// TEST 4 — Unknown event → 200 (ack only)
// ============================================================================

describe('Unknown event', () => {
  it('4) tipo desconhecido → 200 com handled=false (acknowledged only)', async () => {
    const event = {
      id: 'evt_unknown_001',
      type: 'some_future_event.we_do_not_handle',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      data: { object: {} },
      livemode: false,
    };

    mockVerifyWebhookSignature.mockResolvedValue({ valid: true, event });
    mockIsEventProcessed.mockResolvedValue(false);
    mockHandleStripeWebhookEvent.mockResolvedValue({
      eventId: event.id,
      handled: false,
      reason: 'unknown_event_type',
    });
    mockPersistWebhookEvent.mockResolvedValue(undefined);

    const req = buildStripeRequest(event);
    const res = await POST(req);

    // Acknowledge (200) — Stripe não deve reentregar unknown event types
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({
      received: true,
      eventId: 'evt_unknown_001',
      duplicate: false,
      handled: false,
      reason: 'unknown_event_type',
    });

    // Audit trail persistido COM error marker
    expect(mockPersistWebhookEvent).toHaveBeenCalledTimes(1);
    const persistCall = mockPersistWebhookEvent.mock.calls[0]?.[0];
    expect(persistCall).toMatchObject({
      stripeId: 'evt_unknown_001',
      processed: false,
      duplicate: false,
    });
    expect(persistCall?.error).toMatch(/not_handled/);
  });
});

// ============================================================================
// TEST extra — Handler error → 500 (Stripe vai reentregar)
// ============================================================================

describe('Handler error → 500', () => {
  it('handler lança exceção → 500 para retry da Stripe', async () => {
    const event = {
      id: 'evt_err_001',
      type: 'payment_intent.succeeded',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      data: { object: {} },
      livemode: false,
    };

    mockVerifyWebhookSignature.mockResolvedValue({ valid: true, event });
    mockIsEventProcessed.mockResolvedValue(false);
    mockHandleStripeWebhookEvent.mockRejectedValue(
      new Error('DB connection lost')
    );

    const req = buildStripeRequest(event);
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error?.code).toBe(5000);
  });
});