// ============================================================================
// ZOD SCHEMAS — PAYMENTS (Wave 30 / Stripe Connect marketplace)
// ============================================================================
// Schemas Zod para validação de entrada em APIs de pagamento.
// Decisão: NÃO validar PAN (nunca chega até nós — Stripe Elements cuida).
// ============================================================================

import { z } from 'zod';

// ============================================================================
// CONNECT ONBOARDING
// ============================================================================

export const ConnectOnboardSchema = z.object({
  country: z
    .string()
    .length(2, 'País deve ser ISO-3166-1 alpha-2 (BR, US, PT, ...)')
    .toUpperCase(),
  fullName: z.string().min(2).max(120).optional(),
  returnUrl: z.string().url().max(2048),
  refreshUrl: z.string().url().max(2048),
});

export type ConnectOnboardInput = z.infer<typeof ConnectOnboardSchema>;

// ============================================================================
// CHARGE — Marketplace payment
// ============================================================================

export const CreateChargeSchema = z.object({
  readerId: z.string().min(1, 'readerId obrigatório').max(64),
  amount: z
    .number()
    .int('amount deve ser inteiro (smallest unit)')
    .positive('amount deve ser > 0')
    .max(10_000_000, 'amount máximo: R$ 100.000,00'),
  currency: z.enum(['brl', 'usd', 'eur']).default('brl'),
  platformFee: z
    .number()
    .int()
    .min(0, 'platformFee >= 0')
    .max(10_000_000)
    .default(0),
  serviceType: z.enum(['READING', 'MENTORSHIP', 'AFFILIATE']),
  orderId: z.string().min(1).max(64),
  affiliateId: z.string().max(64).optional(),
  description: z.string().max(500).optional(),
});

export type CreateChargeInput = z.infer<typeof CreateChargeSchema>;

// ============================================================================
// RELEASE — Capture manual após sessão confirmada
// ============================================================================

export const ReleasePaymentSchema = z.object({
  paymentId: z.string().min(1).max(64),
  amount: z.number().int().positive().max(10_000_000).optional(),
});

export type ReleasePaymentInput = z.infer<typeof ReleasePaymentSchema>;

// ============================================================================
// REFUND
// ============================================================================

export const RefundSchema = z.object({
  paymentId: z.string().min(1).max(64),
  amount: z.number().int().positive().max(10_000_000).optional(),
  reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer'])
    .default('requested_by_customer'),
});

export type RefundInput = z.infer<typeof RefundSchema>;

// ============================================================================
// WEBHOOK — Não usamos Zod (raw body obrigatório p/ signature verify)
// ============================================================================

export const WebhookEventTypeSchema = z.enum([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.closed',
  'account.updated',
  'payout.paid',
  'payout.failed',
]);

export type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>;

// ============================================================================
// CONSTANTS — Plataforma
// ============================================================================

/**
 * Comissão padrão da plataforma (10% sobre o valor da leitura).
 * Em versões futuras, isso virá de uma tabela de planos do reader.
 */
export const DEFAULT_PLATFORM_FEE_BPS = 1000; // 10.00%

/**
 * Taxa de afiliado (5% sobre o valor da leitura vai para o afiliado).
 * Calculado sobre o net amount do reader.
 */
export const DEFAULT_AFFILIATE_FEE_BPS = 500; // 5.00%

/**
 * Calcula platform fee a partir do amount total em smallest unit.
 */
export function calcPlatformFee(amount: number, bps = DEFAULT_PLATFORM_FEE_BPS): number {
  return Math.floor((amount * bps) / 10_000);
}

export function calcAffiliateFee(
  amount: number,
  bps = DEFAULT_AFFILIATE_FEE_BPS
): number {
  return Math.floor((amount * bps) / 10_000);
}