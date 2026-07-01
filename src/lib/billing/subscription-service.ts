// ============================================================================
// SUBSCRIPTION SERVICE — DB operations for Subscription + Usage + Notifications
// ============================================================================
// Wave 37 (2026-07-01). Camada entre webhooks/API e Prisma.
//
// RESPONSABILIDADES:
//   1. CRUD de Subscription (upsert por userId)
//   2. Webhook handlers (7 eventos subscription.* / invoice.*)
//   3. Notificações de billing (trial reminders, usage warnings)
//   4. Idempotência via WebhookEvent (já implementado em W33)
//
// LGPD: nenhuma PII armazenada localmente fora do Stripe. Subscription
// guarda apenas IDs (stripeCustomerId, stripeSubscriptionId) — Stripe é
// o "source of truth" para PII de pagamento.
// ============================================================================

import {
  retrieveSubscription,
  type SubscriptionDetails,
} from './stripe-subscriptions';
import {
  computeTrialState,
  shouldSendReminder,
  shouldAutoDowngrade,
  renderReminderText,
  type TrialReminderKind,
} from './trial';
import {
  currentPeriodStart,
  currentPeriodEnd,
  PrismaLike as UsagePrismaLike,
} from './usage-tracker';
import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionTier,
  BillingCycle,
} from '@prisma/client';

// ============================================================================
// PRISMA-LIKE INTERFACE (para testes/mocks)
// ============================================================================

export interface PrismaLike {
  subscription: {
    findUnique: (args: { where: { userId?: string; id?: string; stripeCustomerId?: string } }) => Promise<Subscription | null>;
    upsert: (args: {
      where: { userId: string };
      create: SubscriptionCreateInput;
      update: SubscriptionUpdateInput;
    }) => Promise<Subscription>;
    update: (args: { where: { userId: string }; data: SubscriptionUpdateInput }) => Promise<Subscription>;
  };
  billingNotification: {
    create: (args: { data: { userId: string; type: string; channel: string; metadata?: unknown } }) => Promise<{ id: string }>;
    findFirst: (args: { where: { userId: string; type: string } }) => Promise<{ id: string } | null>;
  };
}

export interface SubscriptionCreateInput {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  trialEndsAt?: Date | null;
  trialReminderSentD3?: boolean;
  trialReminderSentD1?: boolean;
}

export interface SubscriptionUpdateInput {
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  trialEndsAt?: Date | null;
  trialReminderSentD3?: boolean;
  trialReminderSentD1?: boolean;
}

// ============================================================================
// MAPS — Stripe status → DB status
// ============================================================================

/**
 * Stripe subscription.status → nossa enum SubscriptionStatus.
 *
 * Stripe docs: https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 *
 *   incomplete → ACTIVE (vai virar ACTIVE após confirmar pagamento)
 *   trialing   → TRIAL
 *   active     → ACTIVE
 *   past_due   → PAST_DUE
 *   canceled   → CANCELLED
 *   unpaid     → PAST_DUE (unpaid é past_due com grace expirado)
 *   incomplete_expired → CANCELLED
 *   paused     → CANCELLED (não usamos pause; tratamos como cancel)
 */
export function mapStripeStatus(
  stripeStatus: SubscriptionDetails['status']
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'trialing':
      return 'TRIAL';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'unpaid':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELLED';
    case 'incomplete':
      return 'ACTIVE';
    case 'incomplete_expired':
      return 'CANCELLED';
    case 'paused':
      return 'CANCELLED';
    default:
      return 'ACTIVE';
  }
}

/** Trial-end detection. */
export function trialEndFromStripe(sub: SubscriptionDetails): Date | null {
  if (sub.status === 'trialing' && sub.trialEnd) {
    return new Date(sub.trialEnd * 1000);
  }
  return null;
}

// ============================================================================
// SUBSCRIPTION UPSERT — chamado por webhooks + checkout success
// ============================================================================

/**
 * Upsert atômico baseado em stripeSubscriptionId (preferencial) ou userId.
 * Se stripeSubscriptionId vier, associamos ao user. Se user já tem sub
 * diferente, atualizamos in-place (mantém histórico).
 */
export async function upsertSubscriptionFromStripe(params: {
  userId: string;
  details: SubscriptionDetails;
  prisma: PrismaLike;
}): Promise<Subscription> {
  const { userId, details, prisma } = params;
  const status = mapStripeStatus(details.status);
  const trialEndsAt = trialEndFromStripe(details);
  const billingCycle: BillingCycle =
    details.metadata?.billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY';

  const data = {
    tier: 'PRO' as SubscriptionTier,
    status,
    billingCycle,
    stripeCustomerId: details.customerId,
    stripeSubscriptionId: details.id,
    stripePriceId: details.priceId,
    stripeProductId: details.productId,
    currentPeriodStart: new Date(details.currentPeriodStart * 1000),
    currentPeriodEnd: new Date(details.currentPeriodEnd * 1000),
    cancelAtPeriodEnd: details.cancelAtPeriodEnd,
    cancelledAt: details.cancelAtPeriodEnd ? new Date() : null,
    cancelReason: details.cancelAtPeriodEnd ? 'user_request' : null,
    trialEndsAt,
  };

  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// ============================================================================
// CANCEL — downgrade to FREE
// ============================================================================

/**
 * Downgrade to FREE. Chamado quando:
 *   - user cancela subscription (effective period end)
 *   - trial expira sem payment (auto-downgrade)
 *   - admin força cancel por fraud/refund
 */
export async function downgradeToFree(params: {
  userId: string;
  reason: 'user_request' | 'trial_expired' | 'payment_failed' | 'admin' | 'fraud';
  prisma: PrismaLike;
}): Promise<Subscription> {
  const { userId, reason, prisma } = params;

  return prisma.subscription.update({
    where: { userId },
    data: {
      tier: 'FREE',
      status: reason === 'trial_expired' ? 'EXPIRED' : 'CANCELLED',
      cancelAtPeriodEnd: false,
      cancelledAt: new Date(),
      cancelReason: reason,
      // NÃO limpa stripeCustomerId — para histórico e re-upgrade
    },
  });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Enfileira notificação de billing. Idempotente por tipo+user (não envia
 * duplicado). Caller (email worker ou cron) processa depois.
 */
export async function scheduleBillingNotification(params: {
  userId: string;
  type:
    | 'trial_d3_reminder'
    | 'trial_d1_reminder'
    | 'trial_expired'
    | 'usage_80_warning'
    | 'usage_100_block'
    | 'payment_failed'
    | 'subscription_cancelled'
    | 'subscription_reactivated';
  channel?: 'email' | 'in_app';
  metadata?: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<{ scheduled: boolean; reason?: 'duplicate' }> {
  const { userId, type, prisma } = params;
  const channel = params.channel ?? 'email';

  const existing = await prisma.billingNotification.findFirst({
    where: { userId, type },
  });
  if (existing) return { scheduled: false, reason: 'duplicate' };

  await prisma.billingNotification.create({
    data: {
      userId,
      type,
      channel,
      metadata: (params.metadata as Record<string, unknown>) ?? {},
    },
  });
  return { scheduled: true };
}

// ============================================================================
// WEBHOOK HANDLERS — 7 eventos
// ============================================================================

/**
 * Webhook handlers para Subscription lifecycle. Cada handler é idempotente
 * (chamável múltiplas vezes com mesmo payload → mesmo resultado).
 *
 * Os 7 eventos cobertos:
 *   1. customer.subscription.created      → onSubscriptionCreated
 *   2. customer.subscription.updated      → onSubscriptionUpdated
 *   3. customer.subscription.deleted      → onSubscriptionDeleted
 *   4. invoice.payment_succeeded          → onInvoicePaymentSucceeded
 *   5. invoice.payment_failed            → onInvoicePaymentFailed
 *   6. customer.subscription.trial_will_end → onTrialWillEnd
 *   7. customer.subscription.trial_ended (synthesized) → onTrialEnded
 */

interface WebhookContext {
  userId: string | null; // pode vir null se metadata.userId ausente
  email?: string;
  name?: string;
  prisma: PrismaLike;
}

function extractUserId(obj: Record<string, unknown>): string | null {
  const meta = obj.metadata as Record<string, string> | undefined;
  return meta?.userId ?? null;
}

/** 1. customer.subscription.created */
export async function onSubscriptionCreated(params: {
  subscription: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const sub = params.subscription as unknown as SubscriptionDetails;
  const userId = extractUserId(params.subscription);
  if (!userId) return;

  // Re-fetch full details (webhook payload pode ser subset)
  const details = await retrieveSubscription(sub.id).catch(() => sub);

  await upsertSubscriptionFromStripe({
    userId,
    details,
    prisma: params.prisma,
  });

  // Se trial começou, marca reminder flags como false
  if (details.status === 'trialing') {
    await scheduleBillingNotification({
      userId,
      type: 'trial_d3_reminder', // placeholder; cron processa de verdade
      channel: 'in_app',
      metadata: { source: 'subscription_created' },
      prisma: params.prisma,
    });
  }
}

/** 2. customer.subscription.updated */
export async function onSubscriptionUpdated(params: {
  subscription: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const userId = extractUserId(params.subscription);
  if (!userId) return;

  const sub = params.subscription as unknown as SubscriptionDetails;
  const details = await retrieveSubscription(sub.id).catch(() => sub);

  await upsertSubscriptionFromStripe({
    userId,
    details,
    prisma: params.prisma,
  });

  // Detect plan change (price ID diferente)
  const existing = await params.prisma.subscription.findUnique({ where: { userId } });
  if (existing && existing.stripePriceId !== details.priceId) {
    await scheduleBillingNotification({
      userId,
      type: 'subscription_reactivated',
      channel: 'email',
      metadata: { oldPriceId: existing.stripePriceId, newPriceId: details.priceId },
      prisma: params.prisma,
    });
  }
}

/** 3. customer.subscription.deleted */
export async function onSubscriptionDeleted(params: {
  subscription: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const userId = extractUserId(params.subscription);
  if (!userId) return;

  await downgradeToFree({
    userId,
    reason: 'user_request',
    prisma: params.prisma,
  });

  await scheduleBillingNotification({
    userId,
    type: 'subscription_cancelled',
    channel: 'email',
    prisma: params.prisma,
  });
}

/** 4. invoice.payment_succeeded */
export async function onInvoicePaymentSucceeded(params: {
  invoice: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const inv = params.invoice;
  const customerId = inv.customer as string;
  // Buscar user pelo stripeCustomerId
  const sub = await params.prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  // Payment succeeded → upgrade de TRIAL para ACTIVE se aplicável
  if (sub.status === 'TRIAL' || sub.status === 'PAST_DUE') {
    await params.prisma.subscription.update({
      where: { userId: sub.userId },
      data: { status: 'ACTIVE' },
    });
  }
}

/** 5. invoice.payment_failed */
export async function onInvoicePaymentFailed(params: {
  invoice: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const inv = params.invoice;
  const customerId = inv.customer as string;
  const sub = await params.prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  await params.prisma.subscription.update({
    where: { userId: sub.userId },
    data: { status: 'PAST_DUE' },
  });

  await scheduleBillingNotification({
    userId: sub.userId,
    type: 'payment_failed',
    channel: 'email',
    metadata: { invoiceId: inv.id, amountDue: inv.amount_due },
    prisma: params.prisma,
  });
}

/** 6. customer.subscription.trial_will_end (3 dias antes) */
export async function onTrialWillEnd(params: {
  subscription: Record<string, unknown>;
  prisma: PrismaLike;
}): Promise<void> {
  const userId = extractUserId(params.subscription);
  if (!userId) return;

  // Marca D-3 reminder como enviado
  await params.prisma.subscription.update({
    where: { userId },
    data: { trialReminderSentD3: true },
  });

  await scheduleBillingNotification({
    userId,
    type: 'trial_d3_reminder',
    channel: 'email',
    prisma: params.prisma,
  });
}

/** 7. trial_ended (synthesized — chamada pelo cron quando trial expira) */
export async function onTrialEnded(params: {
  userId: string;
  prisma: PrismaLike;
}): Promise<{ status: 'downgraded' | 'converted' | 'noop' }> {
  const sub = await params.prisma.subscription.findUnique({
    where: { userId: params.userId },
  });
  if (!sub) return { status: 'noop' };
  if (sub.status !== 'TRIAL') return { status: 'noop' };

  const should = shouldAutoDowngrade({
    trialEndsAt: sub.trialEndsAt,
    status: sub.status,
    stripeSubscriptionId: sub.stripeSubscriptionId,
  });

  if (should) {
    await downgradeToFree({
      userId: params.userId,
      reason: 'trial_expired',
      prisma: params.prisma,
    });
    await scheduleBillingNotification({
      userId: params.userId,
      type: 'trial_expired',
      channel: 'email',
      prisma: params.prisma,
    });
    return { status: 'downgraded' };
  }

  return { status: 'noop' };
}

// ============================================================================
// HANDLER REGISTRY (usado pelo /api/payments/webhook/route.ts)
// ============================================================================

export const SubscriptionWebhookHandlers = {
  'customer.subscription.created': onSubscriptionCreated,
  'customer.subscription.updated': onSubscriptionUpdated,
  'customer.subscription.deleted': onSubscriptionDeleted,
  'invoice.payment_succeeded': onInvoicePaymentSucceeded,
  'invoice.payment_failed': onInvoicePaymentFailed,
  'customer.subscription.trial_will_end': onTrialWillEnd,
};

// ============================================================================
// EXPORTS
// ============================================================================

export const SubscriptionService = {
  upsertSubscriptionFromStripe,
  downgradeToFree,
  scheduleBillingNotification,
  onSubscriptionCreated,
  onSubscriptionUpdated,
  onSubscriptionDeleted,
  onInvoicePaymentSucceeded,
  onInvoicePaymentFailed,
  onTrialWillEnd,
  onTrialEnded,
  mapStripeStatus,
  trialEndFromStripe,
  SubscriptionWebhookHandlers,
};

export default SubscriptionService;