// ============================================================================
// STRIPE SUBSCRIPTIONS — Checkout + Customer Portal + lifecycle
// ============================================================================
// Wave 37 (2026-07-01). Wrapper zero-dependency sobre Stripe REST API para
// subscriptions (vs PaymentIntents one-shot, que já temos em stripe.ts).
//
// PRINCÍPIOS:
//   1. Reusa padrão do stripe.ts: fetch + flatten + idempotency keys
//   2. Checkout Session: hosted page (PCI DSS SAQ-A — não tocamos em PAN)
//   3. Customer Portal: gerencia sub/cancel/invoices sem custom UI
//   4. Trial: 14 dias, cobrança D+14 (ou cancel)
//   5. Metadata sempre inclui userId + tier + cycle (rastreamento end-to-end)
//
// FLUXO CHECKOUT:
//   1) user clica "Upgrade Pro" no UI
//   2) POST /api/payments/checkout {billingCycle: 'monthly'}
//   3) backend cria Subscription (status=TRIAL) + Stripe Checkout Session
//   4) retorna redirect URL
//   5) user completa pagamento no Stripe-hosted page
//   6) Stripe webhook → atualiza Subscription.status → ACTIVE
//
// FLUXO PORTAL:
//   1) user clica "Gerenciar assinatura" no UI
//   2) POST /api/payments/portal
//   3) backend cria Portal session para stripeCustomerId
//   4) retorna redirect URL
//   5) user altera plano, baixa invoices, cancela
// ============================================================================

import { randomUUID } from 'node:crypto';
import { getStripeSecretKey, isStripeLiveMode, StripeError } from '@/lib/payments/stripe';
import { PRO_TIER, type BillingCycle } from './tiers';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = '2024-06-20';

// ============================================================================
// TYPES
// ============================================================================

export interface CheckoutSessionParams {
  userId: string;
  email: string;
  name?: string;
  /** Qual plano: 'monthly' (R$49) ou 'annual' (R$470). */
  billingCycle: BillingCycle;
  /** Trial days (default 14). */
  trialDays?: number;
  /** URLs de retorno (success/cancel) do Stripe Checkout. */
  successUrl: string;
  cancelUrl: string;
  /** Metadata customizada — sempre inclui userId, tier, cycle. */
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  id: string; // 'cs_...'
  url: string;
  customerId: string;
  expiresAt: number; // unix ts; Checkout Session expira em 24h
  livemode: boolean;
}

export interface CustomerPortalParams {
  stripeCustomerId: string;
  returnUrl: string;
}

export interface CustomerPortalResult {
  url: string;
}

export interface SubscriptionDetails {
  id: string; // 'sub_...'
  customerId: string; // 'cus_...'
  status:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'paused';
  currentPeriodStart: number; // unix ts
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialStart: number | null;
  trialEnd: number | null;
  priceId: string;
  productId: string;
  metadata: Record<string, string>;
}

export interface InvoiceDetails {
  id: string; // 'in_...'
  customerId: string;
  subscriptionId: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  number: string | null;
  created: number;
  periodStart: number;
  periodEnd: number;
}

// ============================================================================
// HTTP HELPERS (subset copy do stripe.ts; poderia ser extraído mas mantido
// inline para preservar zero-dependency do módulo)
// ============================================================================

interface StripeResponse<T> {
  ok: boolean;
  status: number;
  data: T;
  requestId?: string;
}

async function stripeFetch<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  params: Record<string, unknown>,
  idempotencyKey?: string
): Promise<StripeResponse<T>> {
  const url = `${STRIPE_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getStripeSecretKey()}`,
    'Stripe-Version': STRIPE_API_VERSION,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'AkashaPortal/1.0 (Wave37-Billing)',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const body = params
    ? new URLSearchParams(flatten(params)).toString()
    : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
    });
  } catch (err) {
    throw new StripeError(
      `Stripe network error: ${(err as Error).message}`,
      0
    );
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new StripeError(`Non-JSON response (status ${response.status})`, -1);
  }

  return {
    ok: response.ok,
    status: response.status,
    data: parsed as T,
    requestId: response.headers.get('request-id') ?? undefined,
  };
}

function flatten(
  input: Record<string, unknown>,
  prefix = ''
): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(input)) {
    const k = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v && typeof v === 'object') {
          out.push(...flatten(v as Record<string, unknown>, `${k}[${i}]`));
        } else {
          out.push([`${k}[${i}]`, String(v)]);
        }
      });
    } else if (typeof value === 'object') {
      out.push(...flatten(value as Record<string, unknown>, k));
    } else {
      out.push([k, String(value)]);
    }
  }
  return out;
}

function throwIfError<T>(response: StripeResponse<T>): T {
  if (response.ok) return response.data;
  const err = response.data as {
    error?: { message?: string; code?: string };
  };
  throw new StripeError(
    err?.error?.message ?? `Stripe status ${response.status}`,
    response.status,
    err?.error?.code,
    response.requestId
  );
}

// ============================================================================
// CUSTOMER — encontrar ou criar
// ============================================================================

/**
 * Procura customer por metadata.userId. Cria novo se não existir.
 * Idempotente via metadata index (Stripe indexa metadata de customer).
 */
export async function findOrCreateCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<{ id: string; created: boolean }> {
  // 1. Tenta encontrar
  const search = throwIfError(
    await stripeFetch<{
      data: Array<{ id: string; email: string; metadata: { userId?: string } }>;
    }>('GET', '/customers/search', {
      query: `metadata['userId']:'${params.userId}'`,
      limit: 1,
    })
  );

  if (search.data.length > 0) {
    return { id: search.data[0].id, created: false };
  }

  // 2. Cria novo
  const customerParams: Record<string, unknown> = {
    email: params.email,
    metadata: { userId: params.userId },
  };
  if (params.name) customerParams.name = params.name;

  const created = throwIfError(
    await stripeFetch<{ id: string; email: string }>(
      'POST',
      '/customers',
      customerParams
    )
  );

  return { id: created.id, created: true };
}

// ============================================================================
// CHECKOUT SESSION
// ============================================================================

/**
 * Cria Stripe Checkout Session para assinatura PRO.
 * Stripe-hosted page (PCI DSS SAQ-A).
 *
 * IMPORTANTE: trial_period_days só funciona na PRIMEIRA subscription do
 * customer. Para renovações/reativação, não é respeitado.
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const priceId =
    params.billingCycle === 'ANNUAL'
      ? PRO_TIER.stripePriceIds.annual
      : PRO_TIER.stripePriceIds.monthly;

  if (!priceId || priceId.includes('placeholder')) {
    throw new StripeError(
      'Stripe Price ID não configurado para tier PRO. Defina STRIPE_PRO_MONTHLY_PRICE_ID e STRIPE_PRO_ANNUAL_PRICE_ID em .env.local',
      500,
      'price_id_not_configured'
    );
  }

  // 1. Encontrar/criar customer
  const customer = await findOrCreateCustomer({
    userId: params.userId,
    email: params.email,
    name: params.name,
  });

  // 2. Criar checkout session
  const trialDays = params.trialDays ?? 14;

  const sessionParams: Record<string, unknown> = {
    mode: 'subscription',
    customer: customer.id,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': 1,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    'subscription_data[trial_period_days]': trialDays,
    'subscription_data[metadata][userId]': params.userId,
    'subscription_data[metadata][tier]': 'PRO',
    'subscription_data[metadata][billingCycle]': params.billingCycle,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    automatic_tax: { enabled: false }, // MVP: tax handling manual
    metadata: {
      userId: params.userId,
      tier: 'PRO',
      billingCycle: params.billingCycle,
      ...(params.metadata ?? {}),
    },
  };

  // Idempotency: garante 1 session por tentativa de checkout
  const idempotencyKey = `checkout:${params.userId}:${params.billingCycle}:${randomUUID()}`;

  const session = throwIfError(
    await stripeFetch<{
      id: string;
      url: string;
      customer: string;
      expires_at: number;
      livemode: boolean;
    }>('POST', '/checkout/sessions', sessionParams, idempotencyKey)
  );

  return {
    id: session.id,
    url: session.url,
    customerId: session.customer,
    expiresAt: session.expires_at,
    livemode: session.livemode,
  };
}

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

/**
 * Cria Customer Portal session (gerencia sub, cancel, invoices).
 * Configurar Portal no Stripe Dashboard (Settings → Billing → Customer Portal).
 */
export async function createPortalSession(
  params: CustomerPortalParams
): Promise<CustomerPortalResult> {
  const portal = throwIfError(
    await stripeFetch<{ url: string }>(
      'POST',
      '/billing_portal/sessions',
      {
        customer: params.stripeCustomerId,
        return_url: params.returnUrl,
      }
    )
  );

  return { url: portal.url };
}

// ============================================================================
// SUBSCRIPTION RETRIEVE / UPDATE / CANCEL
// ============================================================================

export async function retrieveSubscription(
  stripeSubscriptionId: string
): Promise<SubscriptionDetails> {
  const sub = throwIfError(
    await stripeFetch<{
      id: string;
      customer: string;
      status: SubscriptionDetails['status'];
      current_period_start: number;
      current_period_end: number;
      cancel_at_period_end: boolean;
      trial_start: number | null;
      trial_end: number | null;
      items: {
        data: Array<{
          price: { id: string; product: string };
        }>;
      };
      metadata: Record<string, string>;
    }>('GET', `/subscriptions/${stripeSubscriptionId}`, {})
  );

  return {
    id: sub.id,
    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer,
    status: sub.status,
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    trialStart: sub.trial_start,
    trialEnd: sub.trial_end,
    priceId: sub.items.data[0]?.price.id ?? '',
    productId: sub.items.data[0]?.price.product ?? '',
    metadata: sub.metadata,
  };
}

/**
 * Atualiza subscription (ex: mudar monthly → annual, ou adicionar cancel_at_period_end).
 * Para mudar de tier, é preciso criar nova subscription com proration.
 */
export async function updateSubscription(params: {
  stripeSubscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}): Promise<SubscriptionDetails> {
  const updates: Record<string, unknown> = {};

  if (params.priceId) {
    // Pegar item ID atual
    const current = await retrieveSubscription(params.stripeSubscriptionId);
    const subData = throwIfError(
      await stripeFetch<{
        items: { data: Array<{ id: string }> };
      }>('GET', `/subscriptions/${params.stripeSubscriptionId}`, {})
    );
    const itemId = subData.items.data[0]?.id;
    if (!itemId) {
      throw new StripeError('Subscription sem items', 500, 'no_items');
    }
    updates.items = [{ id: itemId, price: params.priceId }];
  }

  if (typeof params.cancelAtPeriodEnd === 'boolean') {
    updates.cancel_at_period_end = params.cancelAtPeriodEnd;
  }

  if (params.metadata) {
    updates.metadata = params.metadata;
  }

  const updated = throwIfError(
    await stripeFetch<{
      id: string;
      customer: string;
      status: SubscriptionDetails['status'];
      current_period_start: number;
      current_period_end: number;
      cancel_at_period_end: boolean;
      trial_start: number | null;
      trial_end: number | null;
      items: { data: Array<{ price: { id: string; product: string } }> };
      metadata: Record<string, string>;
    }>('POST', `/subscriptions/${params.stripeSubscriptionId}`, updates)
  );

  return {
    id: updated.id,
    customerId: typeof updated.customer === 'string' ? updated.customer : updated.customer,
    status: updated.status,
    currentPeriodStart: updated.current_period_start,
    currentPeriodEnd: updated.current_period_end,
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    trialStart: updated.trial_start,
    trialEnd: updated.trial_end,
    priceId: updated.items.data[0]?.price.id ?? '',
    productId: updated.items.data[0]?.price.product ?? '',
    metadata: updated.metadata,
  };
}

/**
 * Cancel imediato (não recomendado — prefira cancel_at_period_end).
 * Para SaaS B2C, sempre cancel_at_period_end para evitar refund issues.
 */
export async function cancelSubscriptionImmediately(
  stripeSubscriptionId: string
): Promise<SubscriptionDetails> {
  return updateSubscription({
    stripeSubscriptionId,
    cancelAtPeriodEnd: false,
  }).then(async () => {
    const sub = throwIfError(
      await stripeFetch<{
        id: string;
        status: SubscriptionDetails['status'];
      }>('DELETE', `/subscriptions/${stripeSubscriptionId}`, {})
    );
    void sub;
    return retrieveSubscription(stripeSubscriptionId);
  });
}

// ============================================================================
// INVOICES
// ============================================================================

export async function listInvoices(
  stripeCustomerId: string,
  options: { limit?: number } = {}
): Promise<InvoiceDetails[]> {
  const response = throwIfError(
    await stripeFetch<{
      data: Array<{
        id: string;
        customer: string;
        subscription: string | null;
        amount_due: number;
        amount_paid: number;
        currency: string;
        status: InvoiceDetails['status'];
        hosted_invoice_url: string | null;
        invoice_pdf: string | null;
        number: string | null;
        created: number;
        period_start: number;
        period_end: number;
      }>;
      has_more: boolean;
    }>('GET', '/invoices', {
      customer: stripeCustomerId,
      limit: Math.min(options.limit ?? 12, 100),
    })
  );

  return response.data.map((inv) => ({
    id: inv.id,
    customerId: typeof inv.customer === 'string' ? inv.customer : inv.customer,
    subscriptionId: typeof inv.subscription === 'string' ? inv.subscription : null,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    hostedInvoiceUrl: inv.hosted_invoice_url,
    invoicePdf: inv.invoice_pdf,
    number: inv.number,
    created: inv.created,
    periodStart: inv.period_start,
    periodEnd: inv.period_end,
  }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export const StripeSubscriptions = {
  findOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
  retrieveSubscription,
  updateSubscription,
  cancelSubscriptionImmediately,
  listInvoices,
  isLiveMode: isStripeLiveMode,
};

export default StripeSubscriptions;