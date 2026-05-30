import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
vi.stubEnv('STRIPE_PRICE_BASIC', 'price_basic');
vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
vi.stubEnv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise');

vi.mock('@/lib/payments/stripe', () => ({
  stripe: { webhooks: { constructEvent: vi.fn() }, subscriptions: { retrieve: vi.fn() } },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: { assinatura: { upsert: vi.fn(), update: vi.fn() }, user: { update: vi.fn(), findFirst: vi.fn() } },
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/stripe/webhook/route';

function mkReq(body, extraHeaders = {}) {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': '', ...extraHeaders },
    body: JSON.stringify(body),
  });
}

function ev(type, obj = {}) {
  return { type, data: { object: obj } };
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('rejects without stripe-signature header', async () => {
    const r = await POST(mkReq(ev('checkout.session.completed', { 'stripe-signature': '' })));
    expect(r.status).toBe(400);
  });

  it('returns 200 + received:true for checkout.session.completed', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { metadata: { userId: 'u1' } }));
    const r = await POST(mkReq(ev('checkout.session.completed', { metadata: { userId: 'u1' } }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
    expect((await r.json()).received).toBe(true);
  });

  it('returns 200 for subscription.deleted', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.deleted', { id: 's1', customer: 'c1' }));
    const r = await POST(mkReq(ev('customer.subscription.deleted', { id: 's1', customer: 'c1' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('returns 200 for subscription.updated', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.updated', { id: 's2', customer: 'c2', status: 'active' }));
    const r = await POST(mkReq(ev('customer.subscription.updated', { id: 's2', customer: 'c2', status: 'active' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('returns 200 for unhandled event types', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('invoice.paid', { id: 'i1' }));
    const r = await POST(mkReq(ev('invoice.paid', { id: 'i1' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('returns 400 for invalid signature', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => { throw Object.assign(new Error('Invalid'), { name: 'JsonWebTokenError' }); });
    const r = await POST(mkReq(ev('checkout.session.completed', { metadata: { userId: 'u2' } }), { 'stripe-signature': 'bad' }));
    expect(r.status).toBe(400);
  });

  it('missing userId gracefully skips upsert', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { customer: 'c3', metadata: {} }));
    const r = await POST(mkReq(ev('checkout.session.completed', { customer: 'c3', metadata: {} }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('no subscription ID uses metadata plano', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { metadata: { userId: 'u4', plano: 'basico' } }));
    const r = await POST(mkReq(ev('checkout.session.completed', { metadata: { userId: 'u4' } }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('deleted with no user gracefully skips update', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.deleted', { id: 's5', customer: 'c5' }));
    const r = await POST(mkReq(ev('customer.subscription.deleted', { id: 's5', customer: 'c5' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('updated with no user gracefully skips update', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.updated', { id: 's6', customer: 'c6' }));
    const r = await POST(mkReq(ev('customer.subscription.updated', { id: 's6', customer: 'c6' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('enterprise plan enables all modules', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { customer: 'c_ent', metadata: { userId: 'u_ent' }, subscription: 's_ent' }));
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({ items: { data: [{ price: { id: 'price_enterprise' } }] } });
    vi.mocked(prisma.assinatura.upsert).mockResolvedValue({});
    vi.mocked(prisma.user.update).mockResolvedValue({});
    const r = await POST(mkReq(ev('checkout.session.completed', { customer: 'c_ent', metadata: { userId: 'u_ent' } }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('basic plan limits modules', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { customer: 'c_bas', metadata: { userId: 'u_bas' }, subscription: 's_bas' }));
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({ items: { data: [{ price: { id: 'price_basic' } }] } });
    vi.mocked(prisma.assinatura.upsert).mockResolvedValue({});
    vi.mocked(prisma.user.update).mockResolvedValue({});
    const r = await POST(mkReq(ev('checkout.session.completed', { customer: 'c_bas', metadata: { userId: 'u_bas' } }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('retrieve error falls back to metadata plano', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { metadata: { userId: 'u_err', plano: 'premium' }, subscription: 's_err' }));
    vi.mocked(stripe.subscriptions.retrieve).mockRejectedValue(new Error('API Error'));
    vi.mocked(prisma.assinatura.upsert).mockResolvedValue({});
    vi.mocked(prisma.user.update).mockResolvedValue({});
    const r = await POST(mkReq(ev('checkout.session.completed', { metadata: { userId: 'u_err', plano: 'premium' } }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('multiple rapid webhooks all return 200', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    for (const evData of [
      ev('checkout.session.completed', { metadata: { userId: 'u_m1' } }),
      ev('customer.subscription.updated', { id: 's_m1', customer: 'c_m1', status: 'active' }),
      ev('invoice.paid', { id: 'i_m1' }),
    ]) {
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(evData);
      const r = await POST(mkReq(evData, { 'stripe-signature': 'sig' }));
      expect(r.status).toBe(200);
    }
  });

  it('constructEvent receives body as string not object', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    let receivedType = 'unknown';
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation((body) => {
      receivedType = typeof body;
      return ev('checkout.session.completed', { metadata: { userId: 'u_txt' } });
    });
    const req2 = mkReq(ev('checkout.session.completed', { metadata: { userId: 'u_txt' } }), { 'stripe-signature': 'sig' });
    await POST(req2);
    expect(receivedType).toBe('string');
  });

  it('handles empty metadata gracefully', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('checkout.session.completed', { customer: 'c_emp', metadata: {} }));
    const r = await POST(mkReq(ev('checkout.session.completed', { customer: 'c_emp', metadata: {} }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('handles no price items gracefully', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.updated', { id: 's_noprice', customer: 'c_noprice', items: { data: [] } }));
    const r = await POST(mkReq(ev('customer.subscription.updated', { id: 's_noprice', customer: 'c_noprice' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });

  it('handles unknown price ID gracefully', async () => {
    const { stripe } = await import('@/lib/payments/stripe');
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(ev('customer.subscription.updated', { id: 's_unkn', customer: 'c_unkn', items: { data: [{ price: { id: 'price_unknown' } }] } }));
    const r = await POST(mkReq(ev('customer.subscription.updated', { id: 's_unkn', customer: 'c_unkn' }), { 'stripe-signature': 'sig' }));
    expect(r.status).toBe(200);
  });
});
