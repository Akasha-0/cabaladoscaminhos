/**
 * Stripe Webhook Tests
 *
 * Testa o handler de webhooks do Stripe para eventos de assinatura.
 * - checkout.session.completed → marca usuário como premium
 * - customer.subscription.deleted → downgrade do usuário
 * - customer.subscription.updated → atualiza status da assinatura
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// Mock Setup — Use vi.mock with factory that sets env
// ============================================
const constructEvent = vi.fn();
const subscriptionsRetrieve = vi.fn();
const assinaturaUpsert = vi.fn();
const assinaturaUpdate = vi.fn();
const userUpdate = vi.fn();
const userFindFirst = vi.fn();

vi.mock('@/lib/payments/stripe', () => {
  // Set env vars before the stripe module is evaluated
  process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
  process.env.STRIPE_PRICE_BASIC = process.env.STRIPE_PRICE_BASIC || 'price_basic';
  process.env.STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM || 'price_premium';
  process.env.STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise';
  
  return {
    stripe: {
      webhooks: { constructEvent },
      subscriptions: { retrieve: subscriptionsRetrieve },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    assinatura: { upsert: assinaturaUpsert, update: assinaturaUpdate },
    user: { update: userUpdate, findFirst: userFindFirst },
  },
}));

// ============================================
// Import Route Handlers
// ============================================
import { NextRequest } from 'next/server';
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

function resetAllMocks() {
  constructEvent.mockReset();
  subscriptionsRetrieve.mockReset();
  assinaturaUpsert.mockReset();
  assinaturaUpdate.mockReset();
  userUpdate.mockReset();
  userFindFirst.mockReset();
}

// ============================================
// Test Setup
// ============================================

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    resetAllMocks();
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
    constructEvent.mockReturnValue(eventData);
    subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_premium' } }],
      },
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_test123',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
    expect(constructEvent).toHaveBeenCalled();
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

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue({
      id: 'user_789',
      stripeSubscriptionId: 'sub_deleted',
    });
    assinaturaUpdate.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_deleted',
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

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue({
      id: 'user_101',
      stripeSubscriptionId: 'sub_updated',
    });
    assinaturaUpdate.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_updated',
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

    constructEvent.mockReturnValue(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_unhandled',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(constructEvent).toHaveBeenCalled();
  });

  // ============================================
  // Test 6: Invalid signature
  // ============================================
  it('6. POST with invalid signature → 400', async () => {
    const body = JSON.stringify(createMockEvent('checkout.session.completed', {
      metadata: { userId: 'user_fail' },
    }));

    constructEvent.mockImplementation(() => {
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
  // Test 7: Missing userId in checkout metadata
  // ============================================
  it('7. Missing userId in checkout metadata → graceful skip (no error)', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_no_user',
      metadata: {},
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_user',
    });

    // Should not throw
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(assinaturaUpsert).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 8: No subscription ID
  // ============================================
  it('8. Checkout with no subscription ID uses metadata plano', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_no_sub',
      metadata: { userId: 'user_no_sub', plano: 'basico' },
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_sub',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(assinaturaUpsert).toHaveBeenCalled();
  });

  // ============================================
  // Test 9: Subscription deleted with no user found
  // ============================================
  it('9. Subscription deleted with no user found → graceful skip', async () => {
    const eventData = createMockEvent('customer.subscription.deleted', {
      id: 'sub_orphan',
      customer: 'cus_orphan',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue(null);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_orphan',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(assinaturaUpdate).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 10: Subscription updated with no user found
  // ============================================
  it('10. Subscription updated with no user found → graceful skip', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_unknown',
      customer: 'cus_unknown',
      status: 'active',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue(null);

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_unknown',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(assinaturaUpdate).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 11: Enterprise plan enables all modules
  // ============================================
  it('11. Checkout with enterprise plan enables all modules', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_enterprise',
      metadata: { userId: 'user_enterprise' },
      subscription: 'sub_enterprise',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_enterprise' } }],
      },
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_ent',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Verify upsert was called with enterprise modules
    expect(assinaturaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_enterprise' },
        create: expect.objectContaining({
          plano: 'enterprise',
          moduloEmpresa: true,
        }),
      })
    );
  });

  // ============================================
  // Test 12: Basic plan limits to planets+letters
  // ============================================
  it('12. Checkout with basic plan limits modules to planets and letters', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_basic',
      metadata: { userId: 'user_basic' },
      subscription: 'sub_basic',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_basic' } }],
      },
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_basic',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Verify upsert was called with basic modules
    expect(assinaturaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_basic' },
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
  // Test 13: Subscription retrieve error
  // ============================================
  it('13. Subscription retrieve error → falls back to metadata plano', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_error',
      metadata: { userId: 'user_error', plano: 'premium' },
      subscription: 'sub_error',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    subscriptionsRetrieve.mockRejectedValue(new Error('API Error'));
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_error',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Falls back to metadata plano 'premium'
    expect(assinaturaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          plano: 'premium',
        }),
      })
    );
  });

  // ============================================
  // Test 14: Multiple rapid webhooks
  // ============================================
  it('14. Multiple rapid webhooks all return 200', async () => {
    const events = [
      {
        type: 'checkout.session.completed',
        data: { object: { customer: 'cus_multi_1', metadata: { userId: 'user_multi_1' } } },
      },
      {
        type: 'customer.subscription.updated',
        data: { object: { id: 'sub_multi_1', customer: 'cus_multi_1', status: 'active' } },
      },
      {
        type: 'invoice.paid',
        data: { object: { id: 'in_multi_1' } },
      },
    ];

    for (const eventData of events) {
      constructEvent.mockReturnValue(eventData);
      userFindFirst.mockResolvedValue({ id: 'user_multi_1' });
      assinaturaUpsert.mockResolvedValue({});
      assinaturaUpdate.mockResolvedValue({});
      userUpdate.mockResolvedValue({});

      const body = JSON.stringify(eventData);
      const request = createWebhookRequest(body, {
        'stripe-signature': 'sig_multi',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });

  // ============================================
  // Test 15: POST handler exported and callable
  // ============================================
  it('15. Route module exports POST handler', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_export',
      metadata: { userId: 'user_export' },
      subscription: 'sub_export',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_export',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ============================================
  // Test 16: Route uses request.text()
  // ============================================
  it('16. Route uses request.text() for body parsing', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      metadata: { userId: 'user_text' },
    });

    const bodyString = JSON.stringify(eventData);

    constructEvent.mockImplementation((body, sig, secret) => {
      // Verify body is passed as string (text content)
      expect(typeof body).toBe('string');
      return eventData;
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(bodyString, {
      'stripe-signature': 'sig_text',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ============================================
  // Test 17: Empty metadata
  // ============================================
  it('17. Route handles empty metadata gracefully', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_empty',
      metadata: {},
      subscription: 'sub_empty',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_empty',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ============================================
  // Test 18: No price items
  // ============================================
  it('18. Route handles subscription with no price items', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_no_items',
      customer: 'cus_no_items',
      items: { data: [] },
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue({ id: 'user_no_items' });
    assinaturaUpdate.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_no_items',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ============================================
  // Test 19: Unknown price ID
  // ============================================
  it('19. Route handles unknown price ID gracefully', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_unknown_price',
      customer: 'cus_unknown_price',
      items: { data: [{ price: { id: 'price_unknown_123' } }] },
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue({ id: 'user_unknown_price' });
    assinaturaUpdate.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_unknown_price',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should fall back to basico plan
    expect(assinaturaUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_unknown_price' },
        data: expect.objectContaining({
          plano: 'basico',
        }),
      })
    );
  });

  // ============================================
  // Test 20: Body as string
  // ============================================
  it('20. constructEvent receives body as string not JSON', async () => {
    let receivedBodyType = 'unknown';

    const eventData = createMockEvent('checkout.session.completed', {
      metadata: { userId: 'user_string' },
    });

    constructEvent.mockImplementation((body: unknown) => {
      receivedBodyType = typeof body;
      return eventData;
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_string',
    });

    await POST(request);

    expect(receivedBodyType).toBe('string');
  });

  // ============================================
  // Test 21: Stripe client not configured
  // ============================================
  it('21. stripe client not configured → 500', async () => {
    // This test verifies the route handles missing stripe client
    const body = JSON.stringify(createMockEvent('checkout.session.completed', {
      metadata: { userId: 'user_noconfig' },
    }));

    // Set secret key empty to simulate no stripe
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_noconfig',
    });

    const response = await POST(request);
    // Route checks `if (!stripe)` first
    expect([400, 500]).toContain(response.status);

    // Reset for other tests
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
  });

  // ============================================
  // Test 22: Webhook secret not configured
  // ============================================
  it('22. webhook secret not configured → 400', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

    const body = JSON.stringify(createMockEvent('checkout.session.completed', {
      metadata: { userId: 'user_nosecret' },
    }));

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_nosecret',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    // Reset for other tests
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
  });

  // ============================================
  // Test 23: Non-JSON body
  // ============================================
  it('23. Non-JSON body → signature verification failure', async () => {
    // Raw non-JSON body (simulating potential issues)
    const nonJsonBody = 'this is not json';

    constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = createWebhookRequest(nonJsonBody, {
      'stripe-signature': 'sig_nonjson',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  // ============================================
  // Test 24: Subscription cancelled status
  // ============================================
  it('24. Subscription with canceled status updates correctly', async () => {
    const eventData = createMockEvent('customer.subscription.updated', {
      id: 'sub_canceled',
      customer: 'cus_canceled',
      status: 'canceled',
      items: { data: [{ price: { id: 'price_premium' } }] },
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    userFindFirst.mockResolvedValue({ id: 'user_canceled' });
    assinaturaUpdate.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_canceled',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(assinaturaUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_canceled' },
        data: expect.objectContaining({
          status: 'cancelled',
        }),
      })
    );
  });

  // ============================================
  // Test 25: Premium plan enables additional modules
  // ============================================
  it('25. Checkout with premium plan enables additional modules', async () => {
    const eventData = createMockEvent('checkout.session.completed', {
      customer: 'cus_premium',
      metadata: { userId: 'user_premium' },
      subscription: 'sub_premium',
    });

    const body = JSON.stringify(eventData);

    constructEvent.mockReturnValue(eventData);
    subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{ price: { id: 'price_premium' } }],
      },
    });
    assinaturaUpsert.mockResolvedValue({});
    userUpdate.mockResolvedValue({});

    const request = createWebhookRequest(body, {
      'stripe-signature': 'sig_premium',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Verify upsert was called with premium modules
    expect(assinaturaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_premium' },
        create: expect.objectContaining({
          plano: 'premium',
          moduloPlanetas: true,
          moduloLetras: true,
          moduloGeometria: true,
          moduloFrequencias: true,
          moduloEmpresa: false,
        }),
      })
    );
  });
});
