// src/lib/w28/marketplace-stripe-connect.ts
// Cycle 28 — Stripe Connect Express onboarding for marketplace sellers (leitura/praticas).
// Extends w27/marketplace-praticas with seller KYC + payout schedule types.

export type ConnectAccountStatus =
  | "not_started"
  | "pending"
  | "restricted"
  | "enabled"
  | "rejected";

export interface ConnectAccount {
  /** Stripe Connect account id (acct_xxx). */
  accountId: string;
  status: ConnectAccountStatus;
  /** Whether seller can receive payouts (charges_enabled). */
  payoutsEnabled: boolean;
  /** Outstanding requirements from Stripe (e.g. "individual.id_number"). */
  requirementsDue: string[];
  /** Onboarding URL — seller completes KYC in Stripe-hosted flow. */
  onboardingUrl: string | null;
  createdAt: string;
}

export type PayoutSchedule = "daily" | "weekly" | "monthly";

export interface PayoutConfig {
  schedule: PayoutSchedule;
  /** Minimum balance to trigger a payout (in BRL cents). */
  minimumAmountCents: number;
}

/** Platform fee in basis points (e.g. 1000 = 10%). */
export const PLATFORM_FEE_BPS = 1000;

export interface PayoutCalculation {
  grossCents: number;
  platformFeeCents: number;
  netCents: number;
  currency: "BRL";
}

/** Compute platform fee + net payout for a marketplace order. */
export function calculatePayout(grossCents: number, feeBps = PLATFORM_FEE_BPS): PayoutCalculation {
  const platformFeeCents = Math.round((grossCents * feeBps) / 10000);
  return {
    grossCents,
    platformFeeCents,
    netCents: grossCents - platformFeeCents,
    currency: "BRL",
  };
}

/** Stub — create Express account + return onboarding link. */
export async function startSellerOnboarding(sellerUserId: string): Promise<ConnectAccount> {
  return {
    accountId: "",
    status: "not_started",
    payoutsEnabled: false,
    requirementsDue: [],
    onboardingUrl: null,
    createdAt: new Date().toISOString(),
  };
}
