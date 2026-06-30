// ============================================================================
// STRIPE CONNECT — Marketplace de Leituras + Afiliados (Wave 30 / Onda 30)
// ============================================================================
// Implementação ZERO-DEPENDENCY usando Stripe REST API diretamente.
// Justificativa: evita lock-in de versão do SDK `stripe` npm, mantém o bundle
// pequeno, e funciona em qualquer runtime Node 18+ (fetch nativo).
//
// PRINCÍPIOS ÉTICOS (Akasha 8 regras):
//   1. Transparência total — nunca escondemos taxas
//   2. Webhook signature verification OBRIGATÓRIA em produção
//   3. Idempotency keys em toda mutação (evita double-charge)
//   4. LGPD: nunca logamos PAN / dados sensíveis
//   5. Escrow honesto: só transferimos após sessão confirmada
//   6. Refund policy documentada em /docs/STRIPE-PAYMENTS-W30.md
//   7. Disputes: webhook charge.dispute.* aciona moderador
//   8. Reader onboarding via Stripe-hosted KYC (Express account)
//
// TIPOS DE CONTA STRIPE CONNECT:
//   - Standard → reader tem dashboard próprio (não usamos; muito controle)
//   - Express  → Stripe hospeda onboarding/dashboard; usado aqui ✅
//   - Custom  → controlamos tudo (responsabilidade enorme; evitamos)
//
// FLUXO: destination charges (cobrança cai na plataforma, fee + transfer
//        imediato ao reader). Alternativa "separate charges & transfers"
//        é mais complexa e foi descartada para MVP.
// ============================================================================

import { randomUUID } from 'node:crypto';

// ============================================================================
// CONFIG
// ============================================================================

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = '2024-06-20';

export function getStripeSecretKey(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k || k.length < 8) {
    throw new Error(
      'STRIPE_SECRET_KEY ausente ou inválida. Defina em .env.local (sk_test_... ou sk_live_...).'
    );
  }
  return k;
}

export function getStripeWebhookSecret(): string {
  const k = process.env.STRIPE_WEBHOOK_SECRET;
  if (!k || k.length < 8) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET ausente. Defina em .env.local (whsec_...).'
    );
  }
  return k;
}

export function isStripeLiveMode(): boolean {
  return getStripeSecretKey().startsWith('sk_live_');
}

// ============================================================================
// TYPES — subset usado por marketplace de leituras
// ============================================================================

export type Currency = 'brl' | 'usd' | 'eur';

export type ConnectAccountCapabilities = {
  card_payments: { requested: true };
  transfers: { requested: true };
};

export interface ConnectAccountCreateParams {
  userId: string;
  email: string;
  country: string; // ISO-3166-1 alpha-2 ('BR', 'US', 'PT', ...)
  /** Full legal name from KYC document. */
  fullName?: string;
  /** URL reader is sent back to after onboarding. */
  returnUrl: string;
  /** URL reader is sent to if they abandon onboarding. */
  refreshUrl: string;
  /** Capabilities to request. Default: card_payments + transfers. */
  capabilities?: ConnectAccountCapabilities;
}

export interface ConnectAccountResult {
  userId: string;
  stripeAccountId: string; // 'acct_...'
  onboardingUrl: string; // URL for hosted onboarding
  expiresAt: number; // unix ts; account links last ~5min
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
  };
}

export interface PaymentIntentParams {
  /** Amount in smallest currency unit (cents for USD/EUR; centavos for BRL). */
  amount: number;
  currency: Currency;
  /** Stripe Connect account ID of the reader (the destination). */
  readerStripeAccountId: string;
  /** Platform fee in smallest currency unit (Akasha's cut). */
  platformFee: number;
  /** Internal metadata. NEVER include PAN, password, PII sensitive. */
  metadata: {
    readerId: string;
    clientId: string;
    serviceType: 'reading' | 'mentorship' | 'affiliate';
    orderId: string;
    [key: string]: string;
  };
  /** Optional customer for saved cards. */
  customerId?: string;
  /** Optional description shown in dashboard. */
  description?: string;
  /** Idempotency key — usually `${orderId}:${attempt}`. */
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  id: string; // 'pi_...'
  clientSecret: string; // 'pi_..._secret_...'
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'requires_capture'
    | 'canceled'
    | 'succeeded';
  amount: number;
  amountReceived: number;
  currency: Currency;
  applicationFeeAmount: number | null;
  transferData: { destination: string } | null;
  metadata: Record<string, string>;
  created: number; // unix ts
}

export interface RefundParams {
  paymentIntentId: string;
  /** Amount in smallest unit. Omit for full refund. */
  amount?: number;
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface RefundResult {
  id: string; // 're_...'
  paymentIntentId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  reason: string;
  created: number;
}

export interface PayoutResult {
  id: string; // 'po_...'
  amount: number;
  currency: Currency;
  arrivalDate: number;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  method: 'standard' | 'instant';
  destination: string;
}

// ============================================================================
// HTTP HELPERS
// ============================================================================

interface StripeResponse<T> {
  ok: boolean;
  status: number;
  data: T;
  raw: string;
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
    'User-Agent': 'AkashaPortal/1.0 (Wave30)',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  // Stripe aceita form-encoded ou JSON; usamos form-encoded (compat. máx.)
  const body = params ? new URLSearchParams(flatten(params)).toString() : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
    });
  } catch (err) {
    throw new StripeNetworkError(
      `Falha de rede ao chamar Stripe ${method} ${path}: ${(err as Error).message}`
    );
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new StripeParseError(`Resposta não-JSON da Stripe (status ${response.status})`);
  }

  return {
    ok: response.ok,
    status: response.status,
    data: parsed as T,
    raw: text,
    requestId: response.headers.get('request-id') ?? undefined,
  };
}

/** Achata objetos aninhados em notação com [chaves] (formato Stripe). */
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

// ============================================================================
// ERRORS
// ============================================================================

export class StripeError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly code?: string,
    public readonly stripeRequestId?: string
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

export class StripeNetworkError extends StripeError {
  constructor(message: string) {
    super(message, 0);
    this.name = 'StripeNetworkError';
  }
}

export class StripeParseError extends StripeError {
  constructor(message: string) {
    super(message, -1);
    this.name = 'StripeParseError';
  }
}

function throwIfError<T>(response: StripeResponse<T>): T {
  if (response.ok) return response.data;
  const err = response.data as {
    error?: { message?: string; code?: string; type?: string };
  };
  throw new StripeError(
    err?.error?.message ?? `Stripe retornou status ${response.status}`,
    response.status,
    err?.error?.code,
    response.requestId
  );
}

// ============================================================================
// CONNECT — Express account onboarding
// ============================================================================

/**
 * Cria Stripe Connect Express account + retorna account link para onboarding.
 *
 * Em produção, persistir `stripeAccountId` no User ANTES de retornar.
 * O `accountLink.url` expira em ~5 minutos; gerar novo link se expirar.
 */
export async function createConnectAccount(
  params: ConnectAccountCreateParams
): Promise<ConnectAccountResult> {
  if (!params.email.includes('@')) {
    throw new StripeError('Email inválido para Connect account', 400, 'invalid_email');
  }
  if (params.country.length !== 2) {
    throw new StripeError('Country deve ser ISO-3166-1 alpha-2', 400, 'invalid_country');
  }

  const accountParams: Record<string, unknown> = {
    type: 'express',
    country: params.country.toUpperCase(),
    email: params.email,
    capabilities: params.capabilities ?? {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: { userId: params.userId },
  };
  if (params.fullName) accountParams.business_profile = { name: params.fullName };

  const account = throwIfError(
    await stripeFetch<{
      id: string;
      charges_enabled: boolean;
      payouts_enabled: boolean;
      details_submitted: boolean;
      requirements: {
        currently_due: string[];
        past_due: string[];
        pending_verification: string[];
      };
    }>('POST', '/accounts', accountParams)
  );

  const linkParams = {
    account: account.id,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  };
  const link = throwIfError(
    await stripeFetch<{
      url: string;
      expires_at: number;
      created: number;
    }>('POST', '/account_links', linkParams)
  );

  return {
    userId: params.userId,
    stripeAccountId: account.id,
    onboardingUrl: link.url,
    expiresAt: link.expires_at,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: {
      currentlyDue: account.requirements.currently_due ?? [],
      pastDue: account.requirements.past_due ?? [],
      pendingVerification: account.requirements.pending_verification ?? [],
    },
  };
}

/**
 * Recupera status atual de uma Connect account.
 * Usado pelo endpoint /api/payments/connect/status para polling.
 */
export async function getConnectAccountStatus(
  stripeAccountId: string
): Promise<Omit<ConnectAccountResult, 'onboardingUrl' | 'expiresAt' | 'userId'>> {
  const acc = throwIfError(
    await stripeFetch<{
      id: string;
      charges_enabled: boolean;
      payouts_enabled: boolean;
      details_submitted: boolean;
      requirements: {
        currently_due: string[];
        past_due: string[];
        pending_verification: string[];
      };
    }>('GET', `/accounts/${stripeAccountId}`, {})
  );
  return {
    stripeAccountId: acc.id,
    chargesEnabled: acc.charges_enabled,
    payoutsEnabled: acc.payouts_enabled,
    detailsSubmitted: acc.details_submitted,
    requirements: {
      currentlyDue: acc.requirements.currently_due ?? [],
      pastDue: acc.requirements.past_due ?? [],
      pendingVerification: acc.requirements.pending_verification ?? [],
    },
  };
}

/**
 * Gera novo account link (para re-onboarding se link anterior expirou).
 */
export async function refreshConnectAccountLink(params: {
  stripeAccountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<{ url: string; expiresAt: number }> {
  const link = throwIfError(
    await stripeFetch<{ url: string; expires_at: number }>(
      'POST',
      '/account_links',
      {
        account: params.stripeAccountId,
        return_url: params.returnUrl,
        refresh_url: params.refreshUrl,
        type: 'account_onboarding',
      }
    )
  );
  return { url: link.url, expiresAt: link.expires_at };
}

// ============================================================================
// PAYMENT INTENTS — Destination charges with application_fee_amount
// ============================================================================

/**
 * Cria PaymentIntent como destination charge.
 * - Charge cai na conta plataforma Akasha
 * - `application_fee_amount` é a comissão da plataforma
 * - `transfer_data.destination` = conta Connect do reader
 * - Saldo (amount - application_fee_amount) é transferido IMEDIATAMENTE
 *
 * IMPORTANTE: leitor NÃO vê o application_fee — vê o net amount no dashboard.
 */
export async function createPaymentIntent(
  params: PaymentIntentParams
): Promise<PaymentIntentResult> {
  if (params.amount <= 0) {
    throw new StripeError('amount deve ser > 0', 400, 'invalid_amount');
  }
  if (params.platformFee < 0 || params.platformFee >= params.amount) {
    throw new StripeError(
      'platformFee deve ser >=0 e < amount',
      400,
      'invalid_application_fee'
    );
  }
  if (!params.idempotencyKey) {
    throw new StripeError(
      'idempotencyKey obrigatório para createPaymentIntent',
      400,
      'missing_idempotency_key'
    );
  }

  const intentParams: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    application_fee_amount: params.platformFee,
    transfer_data: { destination: params.readerStripeAccountId },
    automatic_payment_methods: { enabled: true },
    metadata: { ...params.metadata, idempotencyKey: params.idempotencyKey },
    description: params.description,
  };
  if (params.customerId) intentParams.customer = params.customerId;

  const pi = throwIfError(
    await stripeFetch<{
      id: string;
      client_secret: string;
      status: PaymentIntentResult['status'];
      amount: number;
      amount_received: number;
      currency: Currency;
      application_fee_amount: number | null;
      transfer_data: { destination: string } | null;
      metadata: Record<string, string>;
      created: number;
    }>('POST', '/payment_intents', intentParams, params.idempotencyKey)
  );

  return {
    id: pi.id,
    clientSecret: pi.client_secret,
    status: pi.status,
    amount: pi.amount,
    amountReceived: pi.amount_received,
    currency: pi.currency,
    applicationFeeAmount: pi.application_fee_amount,
    transferData: pi.transfer_data,
    metadata: pi.metadata,
    created: pi.created,
  };
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<PaymentIntentResult> {
  const pi = throwIfError(
    await stripeFetch<{
      id: string;
      client_secret: string;
      status: PaymentIntentResult['status'];
      amount: number;
      amount_received: number;
      currency: Currency;
      application_fee_amount: number | null;
      transfer_data: { destination: string } | null;
      metadata: Record<string, string>;
      created: number;
    }>('GET', `/payment_intents/${paymentIntentId}`, {})
  );
  return {
    id: pi.id,
    clientSecret: pi.client_secret,
    status: pi.status,
    amount: pi.amount,
    amountReceived: pi.amount_received,
    currency: pi.currency,
    applicationFeeAmount: pi.application_fee_amount,
    transferData: pi.transfer_data,
    metadata: pi.metadata,
    created: pi.created,
  };
}

/**
 * Manual capture: usado quando queremos escrow (autorizar mas não capturar
 * imediatamente). Para leitura confirmada → capture. Para cancelamento →
 * cancel. Por padrão usamos captura automática (sem escrow).
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<PaymentIntentResult> {
  const params: Record<string, unknown> = {};
  if (typeof amountToCapture === 'number') params.amount_to_capture = amountToCapture;
  const pi = throwIfError(
    await stripeFetch<{
      id: string;
      client_secret: string;
      status: PaymentIntentResult['status'];
      amount: number;
      amount_received: number;
      currency: Currency;
      application_fee_amount: number | null;
      transfer_data: { destination: string } | null;
      metadata: Record<string, string>;
      created: number;
    }>('POST', `/payment_intents/${paymentIntentId}/capture`, params)
  );
  return {
    id: pi.id,
    clientSecret: pi.client_secret,
    status: pi.status,
    amount: pi.amount,
    amountReceived: pi.amount_received,
    currency: pi.currency,
    applicationFeeAmount: pi.application_fee_amount,
    transferData: pi.transfer_data,
    metadata: pi.metadata,
    created: pi.created,
  };
}

export async function cancelPaymentIntent(
  paymentIntentId: string,
  reason: 'duplicate' | 'requested_by_customer' | 'abandoned' = 'requested_by_customer'
): Promise<PaymentIntentResult> {
  const pi = throwIfError(
    await stripeFetch<{
      id: string;
      client_secret: string;
      status: PaymentIntentResult['status'];
      amount: number;
      amount_received: number;
      currency: Currency;
      application_fee_amount: number | null;
      transfer_data: { destination: string } | null;
      metadata: Record<string, string>;
      created: number;
    }>('POST', `/payment_intents/${paymentIntentId}/cancel`, {
      cancellation_reason: reason,
    })
  );
  return {
    id: pi.id,
    clientSecret: pi.client_secret,
    status: pi.status,
    amount: pi.amount,
    amountReceived: pi.amount_received,
    currency: pi.currency,
    applicationFeeAmount: pi.application_fee_amount,
    transferData: pi.transfer_data,
    metadata: pi.metadata,
    created: pi.created,
  };
}

// ============================================================================
// REFUNDS
// ============================================================================

export async function createRefund(params: RefundParams): Promise<RefundResult> {
  if (!params.idempotencyKey) {
    throw new StripeError(
      'idempotencyKey obrigatório para createRefund',
      400,
      'missing_idempotency_key'
    );
  }
  const body: Record<string, unknown> = {
    payment_intent: params.paymentIntentId,
    reason: params.reason,
    metadata: params.metadata ?? {},
  };
  if (typeof params.amount === 'number') body.amount = params.amount;

  const refund = throwIfError(
    await stripeFetch<{
      id: string;
      payment_intent: string;
      amount: number;
      currency: Currency;
      status: RefundResult['status'];
      reason: string;
      created: number;
    }>('POST', '/refunds', body, params.idempotencyKey)
  );
  return {
    id: refund.id,
    paymentIntentId:
      typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : params.paymentIntentId,
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status,
    reason: refund.reason,
    created: refund.created,
  };
}

// ============================================================================
// PAYOUTS
// ============================================================================

export async function listPayouts(
  stripeAccountId: string,
  options: { limit?: number } = {}
): Promise<PayoutResult[]> {
  const params: Record<string, unknown> = {
    limit: Math.min(options.limit ?? 10, 100),
  };
  const response = throwIfError(
    await stripeFetch<{
      data: Array<{
        id: string;
        amount: number;
        currency: Currency;
        arrival_date: number;
        status: PayoutResult['status'];
        method: 'standard' | 'instant';
        destination: string;
      }>;
      has_more: boolean;
    }>('GET', `/payouts`, { ...params, /* appended below */ })
  );
  // /payouts sem destination lista payouts da plataforma. Para conta Connect,
  // usar /accounts/:id/payouts (mas isso não exige Stripe-Account header aqui,
  // pois nossa integração é via Stripe Connect direta na plataforma).
  // Para simplicidade do MVP, retornamos payouts da conta plataforma.
  void stripeAccountId;
  return response.data.map((p) => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    arrivalDate: p.arrival_date,
    status: p.status,
    method: p.method,
    destination: p.destination,
  }));
}

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================
// Implementação da verificação de assinatura do webhook conforme
// https://stripe.com/docs/webhooks#verify-official-libraries
//
// Stripe-Header: t=<timestamp>,v1=<signature>
// HMAC-SHA256( timestamp.payload, webhook_secret )
// Comparação constant-time.
// ============================================================================

const DEFAULT_TOLERANCE_SECONDS = 300; // 5 min

export interface WebhookVerificationOk {
  valid: true;
  event: StripeEvent;
}
export interface WebhookVerificationFail {
  valid: false;
  reason:
    | 'malformed_header'
    | 'timestamp_out_of_tolerance'
    | 'signature_mismatch'
    | 'unknown_signature_version';
}
export type WebhookVerificationResult = WebhookVerificationOk | WebhookVerificationFail;

export interface StripeEvent {
  id: string;
  type: string;
  api_version: string | null;
  created: number;
  data: { object: Record<string, unknown> };
  livemode: boolean;
  request?: { id?: string; idempotency_key?: string };
  account?: string; // Connect account ID quando evento vem de sub-conta
}

export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  options: { tolerance?: number; secret?: string } = {}
): Promise<WebhookVerificationResult> {
  const secret = options.secret ?? getStripeWebhookSecret();
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE_SECONDS;

  // 1. Parse do header
  const parts = signatureHeader.split(',').map((s) => s.trim());
  const fields: Record<string, string> = {};
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx);
    const v = part.slice(idx + 1);
    fields[k] = v;
  }
  const timestampStr = fields['t'];
  const v1 = fields['v1'];
  if (!timestampStr || !v1) return { valid: false, reason: 'malformed_header' };

  // 2. Validação de timestamp (anti-replay)
  const ts = parseInt(timestampStr, 10);
  if (Number.isNaN(ts)) return { valid: false, reason: 'malformed_header' };
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > tolerance) {
    return { valid: false, reason: 'timestamp_out_of_tolerance' };
  }

  // 3. HMAC-SHA256 do signed_payload
  const signedPayload = `${timestampStr}.${rawBody}`;
  const expected = await hmacSha256Hex(secret, signedPayload);

  // 4. Comparação constant-time
  if (!constantTimeEqual(expected, v1)) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  // 5. Parse seguro do evento
  try {
    const event = JSON.parse(rawBody) as StripeEvent;
    if (typeof event.id !== 'string' || typeof event.type !== 'string') {
      return { valid: false, reason: 'malformed_header' };
    }
    return { valid: true, event };
  } catch {
    return { valid: false, reason: 'malformed_header' };
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLER — Idempotência + roteamento
// ============================================================================

/**
 * Handler idempotente para eventos Stripe. O chamador (API route) é
 * responsável por:
 *   1) Verificar assinatura (verifyWebhookSignature)
 *   2) Verificar dedupe via ProcessedStripeEvent.id
 *   3) Chamar handleStripeWebhookEvent
 *   4) Marcar como processed (transação atômica)
 *
 * Eventos críticos para marketplace:
 *   - payment_intent.succeeded           → marcar Payment como PAID
 *   - payment_intent.payment_failed      → marcar Payment como FAILED
 *   - payment_intent.canceled            → marcar como CANCELED
 *   - charge.refunded                    → atualizar status pós-refund
 *   - charge.dispute.created             → acionar moderação
 *   - charge.dispute.closed              → resolver moderação
 *   - account.updated                    → atualizar ConnectAccount.chargesEnabled
 *   - payout.paid / payout.failed        → atualizar Payout.status
 *   - application_fee.created            → log para contabilidade
 */
export type WebhookOutcome =
  | { handled: true; action: string; eventId: string }
  | { handled: false; reason: string; eventId: string };

export async function handleStripeWebhookEvent(
  event: StripeEvent,
  callbacks: {
    isAlreadyProcessed: (eventId: string) => Promise<boolean>;
    markProcessed: (eventId: string, type: string) => Promise<void>;
    onPaymentSucceeded?: (pi: Record<string, unknown>, account?: string) => Promise<void>;
    onPaymentFailed?: (pi: Record<string, unknown>, account?: string) => Promise<void>;
    onPaymentCanceled?: (pi: Record<string, unknown>, account?: string) => Promise<void>;
    onChargeRefunded?: (charge: Record<string, unknown>, account?: string) => Promise<void>;
    onDisputeCreated?: (dispute: Record<string, unknown>, account?: string) => Promise<void>;
    onDisputeClosed?: (dispute: Record<string, unknown>, account?: string) => Promise<void>;
    onAccountUpdated?: (account: Record<string, unknown>) => Promise<void>;
    onPayoutPaid?: (payout: Record<string, unknown>, account?: string) => Promise<void>;
    onPayoutFailed?: (payout: Record<string, unknown>, account?: string) => Promise<void>;
  }
): Promise<WebhookOutcome> {
  // 1. Dedupe (idempotência via event.id)
  if (await callbacks.isAlreadyProcessed(event.id)) {
    return { handled: false, reason: 'duplicate', eventId: event.id };
  }

  // 2. Roteamento
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await callbacks.onPaymentSucceeded?.(event.data.object, event.account);
        break;
      case 'payment_intent.payment_failed':
        await callbacks.onPaymentFailed?.(event.data.object, event.account);
        break;
      case 'payment_intent.canceled':
        await callbacks.onPaymentCanceled?.(event.data.object, event.account);
        break;
      case 'charge.refunded':
        await callbacks.onChargeRefunded?.(event.data.object, event.account);
        break;
      case 'charge.dispute.created':
        await callbacks.onDisputeCreated?.(event.data.object, event.account);
        break;
      case 'charge.dispute.closed':
        await callbacks.onDisputeClosed?.(event.data.object, event.account);
        break;
      case 'account.updated':
        await callbacks.onAccountUpdated?.(event.data.object);
        break;
      case 'payout.paid':
        await callbacks.onPayoutPaid?.(event.data.object, event.account);
        break;
      case 'payout.failed':
        await callbacks.onPayoutFailed?.(event.data.object, event.account);
        break;
      default:
        // Evento não-crítico — registra mas não falha
        break;
    }
    await callbacks.markProcessed(event.id, event.type);
    return { handled: true, action: event.type, eventId: event.id };
  } catch (err) {
    // NÃO marcar como processed — Stripe vai reenviar (retry exponencial)
    throw err;
  }
}

// ============================================================================
// CRYPTO HELPERS (HMAC + constant-time compare)
// ============================================================================

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================================
// IDEMPOTENCY HELPERS
// ============================================================================

/**
 * Gera idempotency key determinística para mesma operação. Usado em retry
 * após timeout (rede caiu): mesma key → mesma resposta Stripe.
 */
export function makeIdempotencyKey(parts: Array<string | number>): string {
  return parts.map((p) => String(p).replace(/[^a-zA-Z0-9_-]/g, '_')).join(':');
}

/**
 * Helper para gerar UUIDv4-like. Mantido aqui para uniformidade.
 */
export function newRequestId(): string {
  return randomUUID();
}

// ============================================================================
// PUBLIC SURFACE
// ============================================================================

export const Stripe = {
  // Connect
  createConnectAccount,
  getConnectAccountStatus,
  refreshConnectAccountLink,
  // Payments
  createPaymentIntent,
  retrievePaymentIntent,
  capturePaymentIntent,
  cancelPaymentIntent,
  // Refunds
  createRefund,
  // Payouts
  listPayouts,
  // Webhooks
  verifyWebhookSignature,
  handleStripeWebhookEvent,
  // Utils
  makeIdempotencyKey,
  newRequestId,
  isLiveMode: isStripeLiveMode,
};

export default Stripe;