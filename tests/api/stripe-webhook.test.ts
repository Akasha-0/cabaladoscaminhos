/**
 * Stripe Webhook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env before any imports
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
vi.stubEnv('STRIPE_PRICE_BASIC', 'price_basic');
vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
vi.stubEnv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise');

// Mock modules
vi.mock('@/lib/payments/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    assinatura: { upsert: vi.fn(), update: vi.fn() },
    user: { update: vi.fn(), findFirst: vi.fn() },
  },
}));

// Import mocked modules
import { stripe } from '@/lib/payments/stripe';
// Cast stripe to Mocked<typeof stripe> to satisfy TypeScript for mock methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeMock = stripe as any;
import { prisma } from '@/lib/prisma';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any;
import { NextRequest } from 'next/server';

// Helper to get fresh route with env
async function getRouteWithEnv() {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
  vi.stubEnv('STRIPE_PRICE_BASIC', 'price_basic');
  vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
  vi.stubEnv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise');
  vi.resetModules();
  const { POST } = await import('@/app/api/stripe/webhook/route');
  return POST;
}

function createWebhookRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

function createMockEvent(type: string, data: Record<string, unknown> = {}) {
  return { type, data: { object: data } };
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. POST rejects without stripe-signature header → 400', async () => {
    const POST = await getRouteWithEnv();
    const body = JSON.stringify(createMockEvent('checkout.session.completed', { customer: 'cus_test', metadata: { userId: 'user_123' } }));
    const request = createWebhookRequest(body, {});
    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing signature');
  });

  it('2. POST with valid checkout.session.completed event → 200 + received: true', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_test123', metadata: { userId: 'user_456', plano: 'premium' }, subscription: 'sub_test123' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({ items: { data: [{ price: { id: 'price_premium' } }] } });
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_test123' });
    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
    expect(stripeMock.webhooks.constructEvent).toHaveBeenCalled();
  });

  it('3. POST with valid subscription.deleted event → 200', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.deleted', { id: 'sub_deleted', customer: 'cus_test' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user_789', stripeSubscriptionId: 'sub_deleted' });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_deleted' });
    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
  });

  it('4. POST with valid subscription.updated event → 200', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.updated', { id: 'sub_updated', customer: 'cus_test', status: 'active', items: { data: [{ price: { id: 'price_premium' } }] } });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user_101', stripeSubscriptionId: 'sub_updated' });
    prismaMock.assinatura.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_updated' });
    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
  });

  it('5. POST with unhandled event type → 200', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('invoice.paid', { id: 'in_test' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_unhandled' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(stripeMock.webhooks.constructEvent).toHaveBeenCalled();
  });

  it('6. POST with invalid signature → 400', async () => {
    const POST = await getRouteWithEnv();
    const body = JSON.stringify(createMockEvent('checkout.session.completed', { metadata: { userId: 'user_fail' } }));
    stripeMock.webhooks.constructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_invalid' });
    const response = await POST(request);
    const result = await response.json();
    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid signature');
  });

  it('7. Missing userId in checkout metadata → graceful skip', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_no_user', metadata: {} });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_no_user' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prismaMock.assinatura.upsert).not.toHaveBeenCalled();
  });

  it('8. Checkout with no subscription ID uses metadata plano', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_no_sub', metadata: { userId: 'user_no_sub', plano: 'basico' } });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.assinatura.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_no_sub' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.assinatura.upsert).toHaveBeenCalled();
  });

  it('9. Subscription deleted with no user found → graceful skip', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.deleted', { id: 'sub_orphan', customer: 'cus_orphan' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue(null);
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_orphan' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prismaMock.assinatura.update).not.toHaveBeenCalled();
  });

  it('10. Subscription updated with no user found → graceful skip', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.updated', { id: 'sub_unknown', customer: 'cus_unknown', status: 'active' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prismaMock.user.findFirst.mockResolvedValue(null);
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_unknown' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prismaMock.assinatura.update).not.toHaveBeenCalled();
  });

  it('11. Checkout with enterprise plan enables all modules', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_enterprise', metadata: { userId: 'user_enterprise' }, subscription: 'sub_enterprise' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({ items: { data: [{ price: { id: 'price_enterprise' } }] } });
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_ent' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.assinatura.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user_enterprise' }, create: expect.objectContaining({ plano: 'enterprise', moduloEmpresa: true }) }));
  });

  it('12. Checkout with basic plan limits modules', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_basic', metadata: { userId: 'user_basic' }, subscription: 'sub_basic' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockResolvedValue({ items: { data: [{ price: { id: 'price_basic' } }] } });
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_basic' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.assinatura.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user_basic' }, create: expect.objectContaining({ plano: 'basico', moduloPlanetas: true, moduloLetras: true, moduloGeometria: false }) }));
  });

  it('13. Subscription retrieve error → falls back to metadata plano', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_error', metadata: { userId: 'user_error', plano: 'premium' }, subscription: 'sub_error' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    stripeMock.subscriptions.retrieve.mockRejectedValue(new Error('API Error'));
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_error' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.assinatura.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ plano: 'premium' }) }));
  });

  it('14. Multiple rapid webhooks all return 200', async () => {
    const POST = await getRouteWithEnv();
    const events = [
      { type: 'checkout.session.completed', data: { object: { customer: 'cus_multi_1', metadata: { userId: 'user_multi_1' } } } },
      { type: 'customer.subscription.updated', data: { object: { id: 'sub_multi_1', customer: 'cus_multi_1', status: 'active' } } },
      { type: 'invoice.paid', data: { object: { id: 'in_multi_1' } } },
    ];
    for (const eventData of events) {
      stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
      prisma.user.findFirst.mockResolvedValue({ id: 'user_multi_1' });
      prisma.assinatura.upsert.mockResolvedValue({});
      prisma.assinatura.update.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});
      const body = JSON.stringify(eventData);
      const request = createWebhookRequest(body, { 'stripe-signature': 'sig_multi' });
      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });

  it('15. Route module exports POST handler', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_export', metadata: { userId: 'user_export' }, subscription: 'sub_export' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_export' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('16. Route uses request.text() for body parsing', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { metadata: { userId: 'user_text' } });
    const bodyString = JSON.stringify(eventData);
    stripeMock.webhooks.constructEvent.mockImplementation((body, sig, secret) => {
      expect(typeof body).toBe('string');
      return eventData;
    });
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const request = createWebhookRequest(bodyString, { 'stripe-signature': 'sig_text' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('17. Route handles empty metadata gracefully', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('checkout.session.completed', { customer: 'cus_empty', metadata: {}, subscription: 'sub_empty' });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_empty' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('18. Route handles subscription with no price items', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.updated', { id: 'sub_no_items', customer: 'cus_no_items', items: { data: [] } });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prisma.user.findFirst.mockResolvedValue({ id: 'user_no_items' });
    prisma.assinatura.update.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_no_items' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('19. Route handles unknown price ID gracefully', async () => {
    const POST = await getRouteWithEnv();
    const eventData = createMockEvent('customer.subscription.updated', { id: 'sub_unknown_price', customer: 'cus_unknown_price', items: { data: [{ price: { id: 'price_unknown_123' } }] } });
    stripeMock.webhooks.constructEvent.mockReturnValue(eventData);
    prisma.user.findFirst.mockResolvedValue({ id: 'user_unknown_price' });
    prisma.assinatura.update.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_unknown_price' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.assinatura.update).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user_unknown_price' }, data: expect.objectContaining({ plano: 'basico' }) }));
  });

  it('20. constructEvent receives body as string not JSON', async () => {
    const POST = await getRouteWithEnv();
    let receivedBodyType = 'unknown';
    const eventData = createMockEvent('checkout.session.completed', { metadata: { userId: 'user_string' } });
    stripeMock.webhooks.constructEvent.mockImplementation((body: unknown) => {
      receivedBodyType = typeof body;
      return eventData;
    });
    prisma.assinatura.upsert.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const body = JSON.stringify(eventData);
    const request = createWebhookRequest(body, { 'stripe-signature': 'sig_string' });
    await POST(request);
    expect(receivedBodyType).toBe('string');
  });
});
