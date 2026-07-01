// ============================================================================
// BILLING TIERS — Free vs Pro (Wave 37 · 2026-07-01)
// ============================================================================
// Catálogo de tiers da Akasha. Single source of truth para:
//   - Limites FREE (gate de enforcement)
//   - Benefícios PRO (gate de upgrade)
//   - Preços em BRL (R$)
//   - Stripe Price IDs (lookup para checkout)
//
// PRINCÍPIOS:
//   1. Free NUNCA bloqueia leitura/conhecimento — só limita publishing power
//      e ferramentas avançadas (marketplace list, IA ilimitada, mentorship)
//   2. Pro NÃO é "tudo ilimitado" — quotas justas evitam abuse
//   3. Preços em BRL (mercado-alvo); suporta Stripe BRL
//   4. ROI calculator na UI: 4 sessões mentorship inclusas = R$ 400+ valor
//      (vs R$ 49/mês) → payback em 1 uso
//   5. LGPD: invoices contêm apenas email + nome + valor + data (data min.)
//
// COMPARAÇÃO (vide `docs/BILLING-SUBSCRIPTIONS-W37.md` §2):
//   FREE  R$ 0     : 3 grupos, 10 Akasha conversas/mês, 1 mapa oráculo
//   PRO   R$ 49/mês: unlimited grupos, 200 Akasha, 10 mapas, 4 mentor/sess
// ============================================================================

/** Catálogo de métricas rastreadas por UsageRecord. */
export const UsageMetric = {
  AKASHA_CONVERSATIONS: 'AKASHA_CONVERSATIONS',
  ORACULO_MAPS: 'ORACULO_MAPS',
  MENTORSHIP_SESSIONS: 'MENTORSHIP_SESSIONS',
  STORAGE_GB: 'STORAGE_GB',
  MARKETPLACE_LISTINGS: 'MARKETPLACE_LISTINGS',
  GROUPS_CREATED: 'GROUPS_CREATED',
} as const;
export type UsageMetricType = (typeof UsageMetric)[keyof typeof UsageMetric];

/** Features booleanas (gate on/off). */
export const FeatureFlag = {
  MARKETPLACE_LIST: 'marketplaceList',
  BETA_FEATURES: 'betaFeatures',
  PRIORITY_MENTORSHIP: 'priorityMentorship',
  PRIORITY_SUPPORT: 'prioritySupport',
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  EXPORT_LGPD: 'exportLgpd',
} as const;
export type FeatureFlagType = (typeof FeatureFlag)[keyof typeof FeatureFlag];

/** Catálogo de tiers. */
export type TierKey = 'FREE' | 'PRO';

/** Billing cycle (mensal vs anual). */
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface TierDefinition {
  key: TierKey;
  name: string;
  tagline: string;
  priceMonthly: number; // em reais (R$)
  priceAnnual: number; // em reais (R$) — com desconto
  currency: 'BRL';
  stripePriceIds: {
    monthly?: string;
    annual?: string;
  };
  /** Limites numéricos (null = unlimited). */
  limits: {
    akashaConversationsPerMonth: number | null;
    oraculoMaps: number | null;
    mentorshipSessionsPerMonth: number | null;
    groupsCreated: number | null;
    monthlyStorageGB: number | null;
    marketplaceListings: number | null;
  };
  /** Features on/off. */
  features: Record<FeatureFlagType, boolean>;
  /** Tier de suporte. */
  support: 'community' | 'email_72h' | 'priority_48h' | 'priority_24h';
  /** Nível de acesso à biblioteca. */
  libraryAccess: 'limited' | 'unlimited';
  /** Lista de features em linguagem humana (para UI). */
  highlights: string[];
}

/** FREE — default no signup. */
export const FREE_TIER: TierDefinition = {
  key: 'FREE',
  name: 'Free',
  tagline: 'Comece sua jornada na Akasha',
  priceMonthly: 0,
  priceAnnual: 0,
  currency: 'BRL',
  stripePriceIds: {},
  limits: {
    akashaConversationsPerMonth: 10,
    oraculoMaps: 1,
    mentorshipSessionsPerMonth: 0,
    groupsCreated: 3,
    monthlyStorageGB: 1,
    marketplaceListings: 0,
  },
  features: {
    marketplaceList: false, // pode visualizar, não listar offerings
    betaFeatures: false,
    priorityMentorship: false,
    prioritySupport: false,
    advancedAnalytics: false,
    exportLgpd: true, // LGPD Art. 18 — export é gratuito
  },
  support: 'community',
  libraryAccess: 'limited',
  highlights: [
    'Posts e comentários ilimitados',
    'Acesso à comunidade e feed',
    'Visualizar marketplace (sem listar)',
    '10 conversas Akasha IA por mês',
    '1 mapa espiritual Oráculo',
    'Acesso limitado à biblioteca',
    'Suporte da comunidade',
    'Exportação LGPD completa',
  ],
};

/** PRO — R$ 49/mês ou R$ 470/ano (20% desconto). */
export const PRO_TIER: TierDefinition = {
  key: 'PRO',
  name: 'Pro',
  tagline: 'Para praticantes sérios e mentores',
  priceMonthly: 49,
  priceAnnual: 470, // ~R$ 39.17/mês equivalente
  currency: 'BRL',
  stripePriceIds: {
    // Estes IDs são configurados no Stripe Dashboard.
    // Para testes: usar price IDs do `stripe trigger` ou Test Clocks.
    // Para produção: criar Products no Dashboard e popular via env vars.
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder',
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual_placeholder',
  },
  limits: {
    akashaConversationsPerMonth: 200,
    oraculoMaps: 10,
    mentorshipSessionsPerMonth: 4, // 4 sessões incluídas
    groupsCreated: null, // unlimited
    monthlyStorageGB: 100,
    marketplaceListings: 20,
  },
  features: {
    marketplaceList: true,
    betaFeatures: true,
    priorityMentorship: true,
    prioritySupport: true,
    advancedAnalytics: true,
    exportLgpd: true,
  },
  support: 'priority_48h',
  libraryAccess: 'unlimited',
  highlights: [
    'Tudo do Free +',
    'Grupos ilimitados',
    '200 conversas Akasha IA por mês',
    '10 mapas Oráculo por mês',
    '4 sessões de mentoria incluídas',
    'Listar offerings no marketplace',
    'Acesso ilimitado à biblioteca',
    'Recursos beta exclusivos',
    'Mentoria prioritária',
    'Suporte prioritário 48h',
    'Analytics avançados',
  ],
};

/** Catálogo indexado por key. */
export const TIERS: Record<TierKey, TierDefinition> = {
  FREE: FREE_TIER,
  PRO: PRO_TIER,
};

/** Lista ordenada (FREE primeiro → upgrade incentive). */
export const TIER_LIST: readonly TierDefinition[] = Object.freeze([FREE_TIER, PRO_TIER]);

// ============================================================================
// HELPERS
// ============================================================================

/** Resolve tier definition pela key. Default: FREE. */
export function getTier(key: string | null | undefined): TierDefinition {
  const upper = (key ?? 'FREE').toUpperCase();
  if (upper === 'PRO') return PRO_TIER;
  return FREE_TIER;
}

/** Calcula economia anual (%). */
export function annualDiscountPct(tier: TierDefinition): number {
  if (tier.priceMonthly === 0) return 0;
  const monthlyEquivalent = (tier.priceAnnual / 12);
  const savings = tier.priceMonthly - monthlyEquivalent;
  return Math.round((savings / tier.priceMonthly) * 100);
}

/** Calcula economia anual em R$. */
export function annualSavingsBRL(tier: TierDefinition): number {
  if (tier.priceMonthly === 0) return 0;
  return tier.priceMonthly * 12 - tier.priceAnnual;
}

/** Retorna limit ou null (unlimited). */
export function getLimit(
  tier: TierDefinition,
  metric: UsageMetricType
): number | null {
  switch (metric) {
    case UsageMetric.AKASHA_CONVERSATIONS:
      return tier.limits.akashaConversationsPerMonth;
    case UsageMetric.ORACULO_MAPS:
      return tier.limits.oraculoMaps;
    case UsageMetric.MENTORSHIP_SESSIONS:
      return tier.limits.mentorshipSessionsPerMonth;
    case UsageMetric.STORAGE_GB:
      return tier.limits.monthlyStorageGB;
    case UsageMetric.MARKETPLACE_LISTINGS:
      return tier.limits.marketplaceListings;
    case UsageMetric.GROUPS_CREATED:
      return tier.limits.groupsCreated;
    default:
      return null;
  }
}

/** Retorna feature flag. */
export function hasFeature(tier: TierDefinition, flag: FeatureFlagType): boolean {
  return tier.features[flag] === true;
}

/** Compara tiers (FREE < PRO). */
export function compareTiers(a: TierKey, b: TierKey): number {
  const order: Record<TierKey, number> = { FREE: 0, PRO: 1 };
  return order[a] - order[b];
}

/** Upgrade target (próximo tier). null se já é PRO. */
export function upgradeTarget(currentTier: TierKey): TierKey | null {
  if (currentTier === 'FREE') return 'PRO';
  return null;
}

/** Downgrade target. null se já é FREE. */
export function downgradeTarget(currentTier: TierKey): TierKey | null {
  if (currentTier === 'PRO') return 'FREE';
  return null;
}

/** Formata preço em BRL. */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/** Trial config (vide trial.ts). */
export const TRIAL_CONFIG = {
  DURATION_DAYS: 14,
  REMINDER_DAYS_BEFORE: [3, 1], // D-3 e D-1
  REQUIRES_PAYMENT_METHOD: true,
  AUTO_DOWNGRADE_ON_EXPIRY: true,
} as const;

/** Extra session pricing (PRO: R$ 100/sessão adicional). */
export const EXTRA_MENTORSHIP_PRICE_BRL = 100;