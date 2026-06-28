// ============================================================================
// /lib/landing/variant — Atribuição de variante da landing (Wave 20)
// ============================================================================
// Resolve qual das 4 variantes (A/B/C/D) o usuário deve ver.
//
// Variantes:
//   A — waitlist simples (baseline — atual /validacao)
//   B — hero com vídeo embed (placeholder)
//   C — social proof primeiro (depoimentos + counter)
//   D — interactive quiz ("qual tradição combina com você?")
//
// Atribuição: hash determinístico do userId (cookie userId / anonymousId)
// Garantia: sticky — mesmo user sempre vê mesma variante.
//
// Uso (server component):
//   import { resolveLandingVariant } from '@/lib/landing/variant';
//   const variant = await resolveLandingVariant();
// ============================================================================

import { cookies } from 'next/headers';
import { hashUserId } from '@/lib/feature-flags/index';

export type LandingVariant = 'A' | 'B' | 'C' | 'D';

export interface VariantMeta {
  variant: LandingVariant;
  /** Hash do usuário (para debug/audit) */
  hash: number;
  /** Percentil 0-99 usado na atribuição */
  percentile: number;
  /** Rótulo legível da variante */
  label: string;
  /** Hipótese testada (PM doc) */
  hypothesis: string;
}

const VARIANTS: Array<{
  name: LandingVariant;
  label: string;
  hypothesis: string;
}> = [
  {
    name: 'A',
    label: 'Waitlist simples (baseline)',
    hypothesis:
      'CTA único + benefícios = menor fricção. Baseline para comparar B/C/D.',
  },
  {
    name: 'B',
    label: 'Hero com vídeo',
    hypothesis:
      'Vídeo embed (60s) reduz incerteza sobre o produto e aumenta tempo de página.',
  },
  {
    name: 'C',
    label: 'Social proof primeiro',
    hypothesis:
      'Counter "X+ na lista" + depoimentos antes do CTA aumenta confiança e conversion.',
  },
  {
    name: 'D',
    label: 'Interactive quiz',
    hypothesis:
      'Quiz de 4 perguntas engaja e cria personalização → aumenta conversion + segmenta leads.',
  },
];

/**
 * Resolve a variante baseado no cookie `userId` ou `anonymousId`.
 * Fallback: sticky em cookie `landing-variant` (definido no client).
 */
export async function resolveLandingVariant(): Promise<VariantMeta> {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get('userId')?.value ??
    cookieStore.get('anonymousId')?.value ??
    'anonymous';

  const hash = hashUserId(userId, 'landing-variant');
  const percentile = hash % 100;

  // Distribuição 25% cada (A=25, B=25, C=25, D=25)
  let variant: LandingVariant;
  if (percentile < 25) variant = 'A';
  else if (percentile < 50) variant = 'B';
  else if (percentile < 75) variant = 'C';
  else variant = 'D';

  const meta = VARIANTS.find((v) => v.name === variant)!;

  return {
    variant,
    hash,
    percentile,
    label: meta.label,
    hypothesis: meta.hypothesis,
  };
}

/** Lista canônica de variantes — exposta para UI/admin. */
export function listVariants() {
  return VARIANTS;
}

/** Métricas de funil por variante (in-memory; substituir por PostHog em prod). */
export interface VariantMetrics {
  variant: LandingVariant;
  views: number;
  ctaClicks: number;
  waitlistJoins: number;
}

const metrics: Record<LandingVariant, VariantMetrics> = {
  A: { variant: 'A', views: 0, ctaClicks: 0, waitlistJoins: 0 },
  B: { variant: 'B', views: 0, ctaClicks: 0, waitlistJoins: 0 },
  C: { variant: 'C', views: 0, ctaClicks: 0, waitlistJoins: 0 },
  D: { variant: 'D', views: 0, ctaClicks: 0, waitlistJoins: 0 },
};

/** Incrementa view (chamado no server render). */
export function trackVariantView(variant: LandingVariant) {
  metrics[variant].views++;
}

/** Incrementa CTA click (chamado do client). */
export function trackVariantCtaClick(variant: LandingVariant) {
  metrics[variant].ctaClicks++;
}

/** Incrementa waitlist join (chamado no server após /api/waitlist). */
export function trackVariantConversion(variant: LandingVariant) {
  metrics[variant].waitlistJoins++;
}

/** Snapshot atual (admin dashboard). */
export function getVariantMetrics(): VariantMetrics[] {
  return Object.values(metrics).map((m) => ({
    ...m,
    /** CR = conversions / views. */
    conversionRate: m.views > 0 ? m.waitlistJoins / m.views : 0,
    /** CTR = clicks / views. */
    clickThroughRate: m.views > 0 ? m.ctaClicks / m.views : 0,
  })) as unknown as VariantMetrics[];
}
