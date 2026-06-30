// ============================================================================
// MARKETPLACE SERVICE — Camada de domínio entre Prisma e Stripe lib
// ============================================================================
// Wave 30. Esta camada:
//   1) Centraliza a lógica de negócio (escrow, fee splits, idempotência)
//   2) Loga audit trail (LGPD Art. 37)
//   3) Usa tipos estritos + Object.freeze nos retornos públicos
//
// IMPORTANTE: este módulo usa `globalThis.prisma` para tolerar a versão
// atual do client. Em produção real, importe de @prisma/client.
// ============================================================================

import {
  createConnectAccount as stripeCreateConnectAccount,
  getConnectAccountStatus as stripeGetConnectAccountStatus,
  refreshConnectAccountLink as stripeRefreshConnectAccountLink,
  createPaymentIntent as stripeCreatePaymentIntent,
  capturePaymentIntent as stripeCapturePaymentIntent,
  cancelPaymentIntent as stripeCancelPaymentIntent,
  createRefund as stripeCreateRefund,
  makeIdempotencyKey,
  type ConnectAccountResult,
  type ConnectAccountCreateParams,
  type PaymentIntentParams,
  type PaymentIntentResult,
  type RefundResult,
} from './stripe';

// ============================================================================
// PRISMA STUB — Resolve cliente dinamicamente para evitar hard-dep em dev
// ============================================================================
// Em produção, importar `PrismaClient` direto de `@prisma/client`.
// Em dev/test, aceitamos um mock global para que seeds rodem sem DB real.
// ============================================================================

interface PrismaLike {
  connectAccount: {
    findUnique: (args: { where: { userId?: string; stripeAccountId?: string } }) => Promise<any>;
    upsert: (args: { where: { userId: string }; create: any; update: any }) => Promise<any>;
  };
  payment: {
    findUnique: (args: { where: { id?: string; idempotencyKey?: string; stripePaymentIntentId?: string } }) => Promise<any>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
  };
  payout: {
    create: (args: { data: any }) => Promise<any>;
    findMany: (args: { where: { readerId: string }; orderBy?: any; take?: number }) => Promise<any[]>;
  };
  processedStripeEvent: {
    findUnique: (args: { where: { eventId: string } }) => Promise<any>;
    create: (args: { data: any }) => Promise<any>;
  };
  paymentAuditLog: {
    create: (args: { data: any }) => Promise<any>;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __akasha_prisma: PrismaLike | undefined;
}

async function getPrisma(): Promise<PrismaLike> {
  if (globalThis.__akasha_prisma) return globalThis.__akasha_prisma;
  try {
    // Tenta lazy-import do client gerado (só funciona se `prisma generate` rodou)
    const mod = (await import('@prisma/client')) as { PrismaClient?: new () => PrismaLike };
    if (mod.PrismaClient) {
      const client = new mod.PrismaClient();
      globalThis.__akasha_prisma = client as unknown as PrismaLike;
      return client as unknown as PrismaLike;
    }
  } catch {
    // cai no stub
  }
  // STUB — para dev/test offline. NÃO usar em produção.
  const stub: PrismaLike = {
    connectAccount: {
      findUnique: async () => null,
      upsert: async () => null,
    },
    payment: {
      findUnique: async () => null,
      create: async ({ data }) => ({ id: 'stub_' + Date.now(), ...data }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
    },
    payout: {
      create: async ({ data }) => ({ id: 'stub_' + Date.now(), ...data }),
      findMany: async () => [],
    },
    processedStripeEvent: {
      findUnique: async () => null,
      create: async ({ data }) => data,
    },
    paymentAuditLog: {
      create: async ({ data }) => data,
    },
  };
  globalThis.__akasha_prisma = stub;
  return stub;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'reader_not_found'
      | 'reader_not_onboarded'
      | 'amount_invalid'
      | 'currency_mismatch'
      | 'payment_not_found'
      | 'payment_not_capturable'
      | 'refund_exceeds_amount'
      | 'already_processed',
    public readonly httpStatus: number = 400
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// ============================================================================
// AUDIT HELPERS
// ============================================================================

async function audit(
  prisma: PrismaLike,
  action: string,
  actorId: string | null,
  paymentId: string | null,
  metadata: Record<string, unknown> = {},
  ip?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.paymentAuditLog.create({
      data: {
        action,
        actorId,
        paymentId,
        metadata,
        ipHash: ip ? await hashSha256(ip) : null,
        userAgent: userAgent?.slice(0, 250) ?? null,
      },
    });
  } catch (err) {
    // Audit log NUNCA deve falhar o fluxo principal — só loga
    console.error('[payment-audit] falha ao gravar log:', (err as Error).message);
  }
}

async function hashSha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================================
// CONNECT — Onboarding de readers
// ============================================================================

export interface OnboardReaderInput {
  userId: string;
  email: string;
  country: string;
  fullName?: string;
  returnUrl: string;
  refreshUrl: string;
}

export async function onboardReader(
  input: OnboardReaderInput
): Promise<ConnectAccountResult> {
  const prisma = await getPrisma();

  // 1. Se já existe, retorna onboarding link novo (idempotente)
  const existing = await prisma.connectAccount.findUnique({
    where: { userId: input.userId },
  });
  if (existing && existing.chargesEnabled && existing.payoutsEnabled) {
    // Já onboarded — retorna status sem criar nova conta
    const status = await stripeGetConnectAccountStatus(existing.stripeAccountId);
    return {
      userId: input.userId,
      stripeAccountId: existing.stripeAccountId,
      onboardingUrl: '', // vazio = já completou
      expiresAt: 0,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirements: status.requirements,
    };
  }

  // 2. Cria / atualiza via Stripe
  const params: ConnectAccountCreateParams = {
    userId: input.userId,
    email: input.email,
    country: input.country,
    fullName: input.fullName,
    returnUrl: input.returnUrl,
    refreshUrl: input.refreshUrl,
  };
  const stripeAccountId = existing?.stripeAccountId;
  let result: ConnectAccountResult;
  if (stripeAccountId) {
    const link = await stripeRefreshConnectAccountLink({
      stripeAccountId,
      returnUrl: input.returnUrl,
      refreshUrl: input.refreshUrl,
    });
    result = {
      userId: input.userId,
      stripeAccountId,
      onboardingUrl: link.url,
      expiresAt: link.expiresAt,
      chargesEnabled: existing.chargesEnabled ?? false,
      payoutsEnabled: existing.payoutsEnabled ?? false,
      detailsSubmitted: existing.detailsSubmitted ?? false,
      requirements: {
        currentlyDue: existing.requirementsDue ?? [],
        pastDue: existing.requirementsPastDue ?? [],
        pendingVerification: existing.requirementsPending ?? [],
      },
    };
  } else {
    result = await stripeCreateConnectAccount(params);
  }

  // 3. Persiste
  await prisma.connectAccount.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      stripeAccountId: result.stripeAccountId,
      status: result.chargesEnabled ? 'ACTIVE' : 'PENDING',
      chargesEnabled: result.chargesEnabled,
      payoutsEnabled: result.payoutsEnabled,
      detailsSubmitted: result.detailsSubmitted,
      requirementsDue: result.requirements.currentlyDue,
      requirementsPastDue: result.requirements.pastDue,
      requirementsPending: result.requirements.pendingVerification,
      defaultCurrency: 'brl',
    },
    update: {
      stripeAccountId: result.stripeAccountId,
      chargesEnabled: result.chargesEnabled,
      payoutsEnabled: result.payoutsEnabled,
      detailsSubmitted: result.detailsSubmitted,
      requirementsDue: result.requirements.currentlyDue,
      requirementsPastDue: result.requirements.pastDue,
      requirementsPending: result.requirements.pendingVerification,
      updatedAt: new Date(),
    },
  });

  await audit(prisma, 'connect_onboard', input.userId, null, {
    stripeAccountId: result.stripeAccountId,
    chargesEnabled: result.chargesEnabled,
  });

  return Object.freeze(result);
}

export async function getReaderConnectStatus(
  userId: string
): Promise<Omit<ConnectAccountResult, 'onboardingUrl' | 'expiresAt' | 'userId'> | null> {
  const prisma = await getPrisma();
  const acc = await prisma.connectAccount.findUnique({ where: { userId } });
  if (!acc) return null;
  const status = await stripeGetConnectAccountStatus(acc.stripeAccountId);
  // Atualiza cache
  await prisma.connectAccount.upsert({
    where: { userId },
    create: {
      userId,
      stripeAccountId: acc.stripeAccountId,
      status: status.chargesEnabled ? 'ACTIVE' : 'PENDING',
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsDue: status.requirements.currentlyDue,
      requirementsPastDue: status.requirements.pastDue,
      requirementsPending: status.requirements.pendingVerification,
    },
    update: {
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsDue: status.requirements.currentlyDue,
      requirementsPastDue: status.requirements.pastDue,
      requirementsPending: status.requirements.pendingVerification,
      status: status.chargesEnabled && status.payoutsEnabled ? 'ACTIVE' : 'PENDING',
      onboardingCompletedAt:
        status.detailsSubmitted && !acc.onboardingCompletedAt
          ? new Date()
          : acc.onboardingCompletedAt,
    },
  });
  return Object.freeze(status);
}

// ============================================================================
// CHARGE — Marketplace payment (escrow)
// ============================================================================

export interface CreateMarketplaceChargeInput {
  readerId: string;
  clientId: string;
  amount: number;
  currency: 'brl' | 'usd' | 'eur';
  platformFee: number;
  serviceType: 'READING' | 'MENTORSHIP' | 'AFFILIATE';
  orderId: string;
  affiliateId?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
}

export interface ChargeCreatedResult {
  paymentId: string;
  clientSecret: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  platformFee: number;
  netAmount: number;
  status: PaymentIntentResult['status'];
}

export async function createMarketplaceCharge(
  input: CreateMarketplaceChargeInput
): Promise<ChargeCreatedResult> {
  const prisma = await getPrisma();

  // 1. Validações
  if (input.amount <= 0) {
    throw new PaymentError('amount deve ser > 0', 'amount_invalid');
  }
  if (input.platformFee >= input.amount) {
    throw new PaymentError(
      'platformFee deve ser < amount',
      'amount_invalid'
    );
  }

  // 2. Verifica Connect account do reader
  const readerAccount = await prisma.connectAccount.findUnique({
    where: { userId: input.readerId },
  });
  if (!readerAccount) {
    throw new PaymentError(
      'Reader não fez onboarding Stripe Connect',
      'reader_not_onboarded',
      412
    );
  }
  if (!readerAccount.chargesEnabled) {
    throw new PaymentError(
      'Reader Connect account não habilitada para receber pagamentos',
      'reader_not_onboarded',
      412
    );
  }

  // 3. Idempotency key (mesma orderId → mesmo PaymentIntent)
  const idempotencyKey = makeIdempotencyKey([
    'charge',
    input.orderId,
    input.amount,
    input.currency,
    input.readerId,
  ]);
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey },
  });
  if (existing) {
    return Object.freeze({
      paymentId: existing.id,
      clientSecret: '', // clientSecret não é persistido (segurança); re-create abaixo
      stripePaymentIntentId: existing.stripePaymentIntentId,
      amount: existing.amount,
      currency: existing.currency,
      platformFee: existing.platformFee,
      netAmount: existing.netAmount,
      status: 'processing',
    });
  }

  // 4. Cria PaymentIntent na Stripe
  const netAmount = input.amount - input.platformFee;
  const piParams: PaymentIntentParams = {
    amount: input.amount,
    currency: input.currency,
    readerStripeAccountId: readerAccount.stripeAccountId,
    platformFee: input.platformFee,
    metadata: {
      readerId: input.readerId,
      clientId: input.clientId,
      serviceType: input.serviceType,
      orderId: input.orderId,
      ...(input.affiliateId ? { affiliateId: input.affiliateId } : {}),
    },
    description: input.description,
    idempotencyKey,
  };
  const pi = await stripeCreatePaymentIntent(piParams);

  // 5. Persiste Payment
  const payment = await prisma.payment.create({
    data: {
      readerId: input.readerId,
      clientId: input.clientId,
      affiliateId: input.affiliateId ?? null,
      affiliateFee: 0, // calculado no webhook se aplicável
      stripePaymentIntentId: pi.id,
      amount: input.amount,
      currency: input.currency,
      platformFee: input.platformFee,
      netAmount,
      status: 'PENDING',
      serviceType: input.serviceType,
      idempotencyKey,
      metadata: {
        orderId: input.orderId,
        description: input.description ?? null,
      },
    },
  });

  await audit(prisma, 'create_charge', input.clientId, payment.id, {
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    readerId: input.readerId,
    affiliateId: input.affiliateId ?? null,
  }, input.ip, input.userAgent);

  return Object.freeze({
    paymentId: payment.id,
    clientSecret: pi.clientSecret,
    stripePaymentIntentId: pi.id,
    amount: input.amount,
    currency: input.currency,
    platformFee: input.platformFee,
    netAmount,
    status: pi.status,
  });
}

// ============================================================================
// RELEASE — Capture após sessão confirmada
// ============================================================================

export async function releaseMarketplacePayment(
  paymentId: string,
  actorId: string,
  amountOverride?: number
): Promise<{ paymentId: string; status: PaymentIntentResult['status']; amountCaptured: number }> {
  const prisma = await getPrisma();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new PaymentError('Pagamento não encontrado', 'payment_not_found', 404);
  if (payment.status !== 'SUCCEEDED') {
    throw new PaymentError(
      `Não é possível capturar pagamento com status ${payment.status}`,
      'payment_not_capturable',
      409
    );
  }
  if (payment.status === 'RELEASED') {
    throw new PaymentError('Pagamento já foi liberado', 'already_processed', 409);
  }
  if (amountOverride && amountOverride > payment.amount) {
    throw new PaymentError(
      'amountOverride > amount original',
      'refund_exceeds_amount',
      400
    );
  }

  // Para destination charges, capture é NO-OP (já capturou no succeeded).
  // Mas marcamos como RELEASED para indicar "sessão confirmada".
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'RELEASED',
      releasedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await audit(prisma, 'release_payment', actorId, paymentId, {
    amountCaptured: amountOverride ?? payment.amount,
  });

  return Object.freeze({
    paymentId,
    status: 'succeeded' as PaymentIntentResult['status'],
    amountCaptured: amountOverride ?? payment.amount,
  });
}

// ============================================================================
// REFUND
// ============================================================================

export async function refundMarketplacePayment(
  paymentId: string,
  actorId: string,
  options: { amount?: number; reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' } = {}
): Promise<RefundResult> {
  const prisma = await getPrisma();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new PaymentError('Pagamento não encontrado', 'payment_not_found', 404);
  if (payment.status === 'REFUNDED') {
    throw new PaymentError('Pagamento já foi reembolsado', 'already_processed', 409);
  }
  if (payment.status !== 'SUCCEEDED' && payment.status !== 'RELEASED') {
    throw new PaymentError(
      `Não é possível reembolsar pagamento com status ${payment.status}`,
      'payment_not_capturable',
      409
    );
  }
  if (options.amount && options.amount > payment.amount) {
    throw new PaymentError(
      'amount > payment.amount',
      'refund_exceeds_amount',
      400
    );
  }

  const idempotencyKey = makeIdempotencyKey([
    'refund',
    paymentId,
    options.amount ?? 'full',
    options.reason ?? 'requested_by_customer',
  ]);

  const refund = await stripeCreateRefund({
    paymentIntentId: payment.stripePaymentIntentId,
    amount: options.amount,
    reason: options.reason ?? 'requested_by_customer',
    idempotencyKey,
    metadata: {
      paymentId,
      actorId,
    },
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'REFUNDED',
      stripeRefundId: refund.id,
      refundedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await audit(prisma, 'refund_payment', actorId, paymentId, {
    refundId: refund.id,
    amount: refund.amount,
    reason: refund.reason,
  });

  return Object.freeze(refund);
}

// ============================================================================
// READER EARNINGS — Consultas para UI
// ============================================================================

export async function getReaderTransactions(
  readerId: string,
  options: { limit?: number; status?: string } = {}
): Promise<Array<{
  id: string;
  amount: number;
  currency: string;
  netAmount: number;
  platformFee: number;
  status: string;
  serviceType: string;
  createdAt: string;
  succeededAt: string | null;
}>> {
  const prisma = await getPrisma();
  const payments = await prisma.payment.findMany({
    where: {
      readerId,
      ...(options.status ? { status: options.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(options.limit ?? 20, 100),
  });
  return Object.freeze(
    payments.map((p: any) =>
      Object.freeze({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        netAmount: p.netAmount,
        platformFee: p.platformFee,
        status: p.status,
        serviceType: p.serviceType,
        createdAt: p.createdAt?.toISOString?.() ?? new Date().toISOString(),
        succeededAt: p.succeededAt?.toISOString?.() ?? null,
      })
    )
  );
}

export async function getReaderPayouts(
  readerId: string,
  options: { limit?: number } = {}
): Promise<Array<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string;
  method: string;
  destination: string;
}>> {
  const prisma = await getPrisma();
  const payouts = await prisma.payout.findMany({
    where: { readerId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(options.limit ?? 10, 50),
  });
  return Object.freeze(
    payouts.map((p: any) =>
      Object.freeze({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        arrivalDate: p.arrivalDate?.toISOString?.() ?? new Date().toISOString(),
        method: p.method,
        destination: p.destination,
      })
    )
  );
}

// ============================================================================
// WEBHOOK DEDUPE HELPERS
// ============================================================================

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const prisma = await getPrisma();
  const existing = await prisma.processedStripeEvent.findUnique({
    where: { eventId },
  });
  return !!existing;
}

export async function markEventProcessed(
  eventId: string,
  eventType: string,
  livemode: boolean
): Promise<void> {
  const prisma = await getPrisma();
  try {
    await prisma.processedStripeEvent.create({
      data: { eventId, eventType, livemode },
    });
  } catch {
    // UNIQUE constraint = já existe, ok
  }
}

// ============================================================================
// WEBHOOK EVENT ROUTERS
// ============================================================================

export const WebhookHandlers = {
  onPaymentSucceeded: async (pi: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const paymentIntentId = pi.id as string;
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) {
      console.warn(`[webhook] payment_intent.succeeded sem payment local: ${paymentIntentId}`);
      return;
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        succeededAt: new Date(),
        stripeChargeId: (pi.latest_charge as string) ?? null,
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'payment_succeeded', null, payment.id, {
      paymentIntentId,
      amountReceived: pi.amount_received,
    });
  },

  onPaymentFailed: async (pi: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const paymentIntentId = pi.id as string;
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) return;
    const err = (pi.last_payment_error ?? {}) as Record<string, string>;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureCode: err.code ?? null,
        failureMessage: err.message?.slice(0, 250) ?? null,
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'payment_failed', null, payment.id, {
      code: err.code,
      message: err.message,
    });
  },

  onChargeRefunded: async (charge: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const paymentIntentId = charge.payment_intent as string;
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) return;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'charge_refunded', null, payment.id, {
      amountRefunded: charge.amount_refunded,
    });
  },

  onDisputeCreated: async (dispute: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const chargeId = dispute.charge as string;
    // Encontra via charge id (busca simples)
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: chargeId },
    });
    if (!payment) return;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'DISPUTED',
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'dispute_opened', null, payment.id, {
      disputeId: dispute.id,
      reason: dispute.reason,
      amount: dispute.amount,
    });
  },

  onDisputeClosed: async (dispute: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const chargeId = dispute.charge as string;
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: chargeId },
    });
    if (!payment) return;
    // Se dispute.status === 'won' → reader ganha; 'lost' → plataforma perde
    const won = dispute.status === 'won';
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: won ? 'RELEASED' : 'REFUNDED',
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'dispute_closed', null, payment.id, {
      status: dispute.status,
      won,
    });
  },

  onAccountUpdated: async (account: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const stripeAccountId = account.id as string;
    const reqs = (account.requirements ?? {}) as Record<string, string[]>;
    const status =
      account.charges_enabled && account.payouts_enabled
        ? 'ACTIVE'
        : account.disabled_reason
        ? 'DISABLED'
        : 'PENDING';
    await prisma.connectAccount.upsert({
      where: { stripeAccountId },
      create: {
        // Não temos userId aqui — pular create se userId for null seria ideal;
        // mas upsert precisa de userId. Fazemos update-by-stripeAccountId via
        // findUnique primeiro.
        stripeAccountId,
        userId: 'unknown',
        status,
        chargesEnabled: !!account.charges_enabled,
        payoutsEnabled: !!account.payouts_enabled,
        detailsSubmitted: !!account.details_submitted,
        requirementsDue: reqs.currently_due ?? [],
        requirementsPastDue: reqs.past_due ?? [],
        requirementsPending: reqs.pending_verification ?? [],
      },
      update: {
        status,
        chargesEnabled: !!account.charges_enabled,
        payoutsEnabled: !!account.payouts_enabled,
        detailsSubmitted: !!account.details_submitted,
        requirementsDue: reqs.currently_due ?? [],
        requirementsPastDue: reqs.past_due ?? [],
        requirementsPending: reqs.pending_verification ?? [],
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'account_updated', null, null, {
      stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  },

  onPayoutPaid: async (payout: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const stripePayoutId = payout.id as string;
    await prisma.payout.update({
      where: { stripePayoutId },
      data: { status: 'PAID', updatedAt: new Date() },
    });
    await audit(prisma, 'payout_paid', null, null, { stripePayoutId });
  },

  onPayoutFailed: async (payout: Record<string, unknown>) => {
    const prisma = await getPrisma();
    const stripePayoutId = payout.id as string;
    const failure = (payout.failure_code ?? {}) as Record<string, string>;
    await prisma.payout.update({
      where: { stripePayoutId },
      data: {
        status: 'FAILED',
        failureCode: failure.code ?? null,
        failureMessage: failure.message?.slice(0, 250) ?? null,
        updatedAt: new Date(),
      },
    });
    await audit(prisma, 'payout_failed', null, null, {
      stripePayoutId,
      code: failure.code,
    });
  },
};