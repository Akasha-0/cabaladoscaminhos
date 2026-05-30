import { NextRequest } from 'next/server';

/**
 * Stripe Webhook Tests
 *
 * Testa o handler de webhooks do Stripe para eventos de assinatura.
 * - checkout.session.completed → marca usuário como premium
 * - customer.subscription.deleted → downgrade do usuário
 * - customer.subscription.updated → atualiza status da assinatura
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─────────────────────────────────────────────────────────────────
// Mock Setup — vi.hoisted() ensures mocks are available when
// vi.mock() factories are evaluated (both hoisted to top of module).
// ─────────────────────────────────────────────────────────────────
const { stripeMock, prismaMock } = vi.hoisted(() => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
  prisma: {
    assinatura: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));
// Mock modules before import
vi.mock('@/lib/payments/stripe', () => ({
  stripe: stripeMock,
}));
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));
// ============================================
// Import Route Handlers
// ============================================

import { POST } from '@/app/api/stripe/webhook/route';

// ============================================
// Test Helpers
// ============================================

function createWebhookRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

function createMockEvent(type: string, data: Record<string, unknown> = {}) {
  return {
    type,
    data: {
      object: data,
    },
  };
}

// ============================================
// Test Setup
// ============================================

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env and setup defaults
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
    vi.stubEnv('STRIPE_PRICE_BASIC', 'price_basic');
    vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
    vi.stubEnv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise');
  });

  // ============================================
  // Test 1: Missing stripe-signature header
  // ============================================
  it('1. POST rejects without stripe-signature header → 400', async () => {
    const body = JSON.stringify(createMockEvent('checkout.session.completed', {
      customer: 'cus_test',
      metadata: { userId: 'user_123' },
    }));

    const request = createWebhookRequest(body, {});

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing signature');
  });

  // ============================================
  // Test 2: Valid checkout.session.completed event
  // ============================================
  it('2. POST with valid checkout.session.completed event → 200 + received: true', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_test123',
      customer_email: 'user@example.com',
      metadata: { userId: 'user_456', plano: 'premium' },
      subscription: 'sub_test123',
    });

    const body = JSON.stringify(eventData);

    // Mock constructEvent to return the parsed event
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_premium' } }],
      },
    });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_test123',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
    expect(stripeMock.webhooks.constructEvent).toHaveBeenCalled();
  });

  // ============================================
  // Test 3: Valid subscription.deleted event
  // ============================================
  it('3. POST with valid subscription.deleted event → 200', async () => {
    const eventData = createMockEvent('customer.subscription.deleted', {
      id: 'sub_deleted',
      customer: 'cus_test',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user_789',
      stripeSubscriptionId: 'sub_deleted',
    });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_test456',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
  });

  // ============================================
  // Test 4: Valid subscription.updated event
  // ============================================
  it('4. POST with valid subscription.updated event → 200', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_updated',
      customer: 'cus_test',
      status: 'active',
      items: {
        data: [{ price: { id: 'price_premium' } }],
      },
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user_101',
      stripeSubscriptionId: 'sub_updated',
    });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_test789',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
  });

  // ============================================
  // Test 5: Unhandled event type
  // ============================================
  it('5. POST with unhandled event type → 200', async () => {
    const eventData = createMockEvent('invoice.paid', {
      id: 'in_test',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_test_unhandled',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
    // No specific handler should be called
    expect(prismaMock.assinatura.upsert).not.toHaveBeenCalled();
    expect(prismaMock.assinatura.update).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 6: Invalid signature
  // ============================================
  it('6. POST with invalid signature → 400', async () => {
    const body = JSON.stringify(createMockEvent('checkout.session.completed', {}));

    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_invalid',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid signature');
  });

  // ============================================
  // Test 7-10: Checkout handler upserts assinatura via prisma
  // ============================================
  it('7. Checkout handler upserts assinatura via prisma with correct data', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_checkout',
      customer_email: 'checkout@example.com',
      metadata: { userId: 'user_checkout', plano: 'premium' },
      subscription: 'sub_checkout',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_premium' } }],
      },
    });
    prismaMock.assinatura.upsert.mockResolvedValue({
      id: 'assinatura_1',
      userId: 'user_checkout',
      plano: 'premium',
      status: 'active',
    });
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_checkout',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_checkout' },
        create: expect.objectContaining({
          userId: 'user_checkout',
          plano: 'premium',
          status: 'active',
          stripeCustomerId: 'cus_checkout',
          stripeSubscriptionId: 'sub_checkout',
        }),
        update: expect.objectContaining({
          plano: 'premium',
          status: 'active',
          stripeCustomerId: 'cus_checkout',
          stripeSubscriptionId: 'sub_checkout',
        }),
      })
    );
  });

  // ============================================
  // Test 8: Subscription deleted handler updates assinatura status
  // ============================================
  it('8. Subscription deleted handler updates assinatura status to cancelled', async () => {
    const eventData = createMockEvent('customer.subscription.deleted', {
      id: 'sub_cancel',
      customer: 'cus_cancel',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user_cancel',
      stripeSubscriptionId: 'sub_cancel',
      stripeCustomerId: 'cus_cancel',
    });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_cancel',
    });

    await POST(request);

    expect(prismaMock.assinatura.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_cancel' },
        data: expect.objectContaining({
          plano: 'iniciante',
          status: 'cancelled',
          moduloPlanetas: false,
          moduloLetras: false,
          moduloGeometria: false,
          moduloFrequencias: false,
          moduloEmpresa: false,
        }),
      })
    );
  });

  // ============================================
  // Test 9: Missing userId in checkout metadata → graceful skip
  // ============================================
  it('9. Missing userId in checkout metadata → graceful skip (no error)', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_no_user',
      customer_email: 'nouser@example.com',
      metadata: {}, // No userId
      subscription: 'sub_no_user',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_user',
    });

    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
    // Should not try to upsert without userId
    expect(prismaMock.assinatura.upsert).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 10: Checkout with no subscription ID still works
  // ============================================
  it('10. Checkout with no subscription ID uses metadata plano', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_no_sub',
      customer_email: 'nosub@example.com',
      metadata: { userId: 'user_no_sub', plano: 'basico' },
      // No subscription field
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_sub',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should use 'basico' from metadata since no subscription
    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          plano: 'basico',
        }),
      })
    );
  });

  // ============================================
  // Test 11: Subscription updated with different plan
  // ============================================
  it('11. Subscription updated changes plan based on price ID', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_enterprise',
      customer: 'cus_enterprise',
      status: 'active',
      items: {
        data: [{ price: { id: 'price_enterprise' } }],
      },
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user_enterprise',
      stripeSubscriptionId: 'sub_enterprise',
    });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_enterprise',
    });

    await POST(request);

    expect(prismaMock.assinatura.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_enterprise' },
        data: expect.objectContaining({
          plano: 'enterprise',
        }),
      })
    );
  });

  // ============================================
  // Test 12: Stripe client not configured → 500
  // ============================================
  it('12. stripe client not configured → 500', async () => {
    // Clear the stripe secret to simulate no config
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_noconfig',
      metadata: { userId: 'user_noconfig' },
    });

    const body = JSON.stringify(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_noconfig',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe('Stripe not configured');
  });

  // ============================================
  // Test 13: Non-JSON body → signature verification failure
  // ============================================
  it('13. Non-JSON body → signature verification failure', async () => {
    const invalidBody = 'this is not valid json {{{';

    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Webhook signature verification failed');
    });

    const request = createWebhookRequest(invalidBody, {
      'stripe-signature': 'sig_bad_json',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid signature');
  });

  // ============================================
  // Test 14: Webhook secret not configured → 400
  // ============================================
  it('14. Webhook secret not configured → 400', async () => {
    // Clear webhook secret
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_no_secret',
      metadata: { userId: 'user_no_secret' },
    });

    const body = JSON.stringify(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_secret',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing signature');
  });

  // ============================================
  // Test 15: Subscription deleted with no user found → graceful skip
  // ============================================
  it('15. Subscription deleted with no user found → graceful skip', async () => {
    const eventData = createMockEvent('customer.subscription.deleted', {
      id: 'sub_orphan',
      customer: 'cus_orphan',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue(null); // No user found

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_orphan',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should not try to update assinatura if no user found
    expect(prismaMock.assinatura.update).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 16: Subscription updated with no user found → graceful skip
  // ============================================
  it('16. Subscription updated with no user found → graceful skip', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_unknown',
      customer: 'cus_unknown',
      status: 'active',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue(null);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_unknown',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prismaMock.assinatura.update).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 17: Checkout with enterprise plan sets all modules
  // ============================================
  it('17. Checkout with enterprise plan enables all modules', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_enterprise_full',
      customer_email: 'enterprise@example.com',
      metadata: { userId: 'user_enterprise_full' },
      subscription: 'sub_enterprise_full',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_enterprise' } }],
      },
    });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_enterprise_full',
    });

    await POST(request);

    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          moduloPlanetas: true,
          moduloLetras: true,
          moduloGeometria: true,
          moduloFrequencias: true,
          moduloEmpresa: true,
        }),
      })
    );
  });

  // ============================================
  // Test 18: Checkout with basic plan limits modules
  // ============================================
  it('18. Checkout with basic plan limits modules to planets and letters', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_basic_limited',
      customer_email: 'basic@example.com',
      metadata: { userId: 'user_basic_limited' },
      subscription: 'sub_basic_limited',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_basic' } }],
      },
    });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_basic_limited',
    });

    await POST(request);

    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          plano: 'basico',
          moduloPlanetas: true,
          moduloLetras: true,
          moduloGeometria: false,
          moduloFrequencias: false,
          moduloEmpresa: false,
        }),
      })
    );
  });

  // ============================================
  // Test 19: Checkout retrieves subscription details on error → uses metadata plano
  // ============================================
  it('19. Subscription retrieve error → falls back to metadata plano', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_error_fallback',
      customer_email: 'fallback@example.com',
      metadata: { userId: 'user_error_fallback', plano: 'premium' },
      subscription: 'sub_error_fallback',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    // Simulate subscription retrieve error
    stripeMock.subscriptions.retrieve.mockRejectedValue(new Error('API Error'));
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_error_fallback',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should fall back to metadata plano 'premium'
    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          plano: 'premium',
        }),
      })
    );
  });

  // ============================================
  // Test 20: Multiple rapid webhooks all return 200
  // ============================================
  it('20. Multiple rapid webhooks all return 200', async () => {
    const events = [
      createMockEvent('checkout.session.completed', {
        customer: 'cus_multi_1',
        metadata: { userId: 'user_multi_1' },
      }),
      createMockEvent('customer.subscription.updated', {
        id: 'sub_multi_1',
        customer: 'cus_multi_1',
        status: 'active',
      }),
      createMockEvent('invoice.paid', { id: 'in_multi_1' }), // unhandled
    ];

    for (const eventData of events) {
      stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
      prismaMock.user.findFirst.mockResolvedValue({ id: 'user_multi_1' });
      prismaMock.assinatura.upsert.mockResolvedValue({});
      prismaMock.assinatura.update.mockResolvedValue({});
      prismaMock.user.update.mockResolvedValue({});

      const body = JSON.stringify(eventData);
      const request = createWebhookRequest(body, {
        'stripe-signature': 'sig_multi',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});

// ============================================
// Integration-style tests for exported helpers
// Note: These test that the route module exports what is expected
// ============================================

describe('Stripe Webhook - Module Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
    vi.stubEnv('STRIPE_PRICE_BASIC', 'price_basic');
    vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
    vi.stubEnv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise');
  });

  it('21. Route module exports POST handler', async () => {
    // This verifies the route is properly structured
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_verify',
      metadata: { userId: 'user_verify' },
    });

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_verify',
    });

    // Should not throw - verifies POST is exported and callable
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('22. Route uses request.text() for body parsing', async () => {
    // This test verifies that we correctly use text() - the body should be a raw string
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_text_test',
      metadata: { userId: 'user_text_test' },
    });

    const bodyString = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockImplementation((body, sig, secret) => {
      // Verify body is passed as string (text content)
      expect(typeof body).toBe('string');
      return eventData;
    });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(bodyString, {
      'stripe-signature': 'sig_text_test',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('23. Route handles empty metadata gracefully', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_empty_meta',
      metadata: undefined, // No metadata at all
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_empty_meta',
    });

    // Should handle undefined metadata without crashing
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('24. Route handles subscription with no price items', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_no_items',
      customer: 'cus_no_items',
      status: 'active',
      items: {
        data: [], // Empty items
      },
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user_no_items',
      stripeSubscriptionId: 'sub_no_items',
    });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_items',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('25. Route handles unknown price ID gracefully', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_unknown_price',
      customer_email: 'unknownprice@example.com',
      metadata: { userId: 'user_unknown_price' },
      subscription: 'sub_unknown_price',
    });

    const body = JSON.stringify(eventData);

    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    // Return a price ID that doesn't match any known plan
    stripeMock.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_unknown_12345' } }],
      },
    });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_unknown_price',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    // Should fall back to 'basico' when price not found in PRICE_TO_PLAN
    expect(prismaMock.assinatura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          plano: 'basico', // Default fallback
        }),
      })
    );
  });
});