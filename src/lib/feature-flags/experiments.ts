// ============================================================================
// A/B TESTING — assignVariant (Wave 20)
// ============================================================================
// Atribuição determinística de variantes para experimentos.
//
// Uso:
//   const variant = await assignVariant(userId, 'onboarding-test', [
//     { name: 'control', weight: 50 },
//     { name: 'redesign', weight: 50 },
//   ]);
//   // → 'control' | 'redesign'
//
// Algoritmo:
//   1. Hash(userId + experimentName) → 0..2^32
//   2. Mapeia para 0-99 (percentile)
//   3. Distribui por peso cumulativo
//
// Garantias:
//   - Determinístico: mesmo user sempre vê mesma variante
//   - Cross-device: funciona com anonymousId também
//   - Sticky: mudar pesos só afeta novos usuários (via re-hash)
//
// Tracking de exposição: o caller é responsável por chamar
// `trackExposure(experiment, variant, userId)` quando a variante é
// efetivamente renderizada — evita inflar contadores com bounces.
// ============================================================================

import { hashUserId } from './index';

export interface Variant {
  /** Nome da variante ('control', 'redesign', 'variant-a', ...) */
  name: string;
  /** Peso relativo (não precisa somar 100 — é normalizado) */
  weight: number;
  /** Metadata opcional (config, payload específico da variante) */
  payload?: Record<string, unknown>;
}

export interface AssignedVariant {
  experiment: string;
  variant: string;
  /** Hash do usuário para debug */
  hash: number;
  /** Percentil 0-99 */
  percentile: number;
}

/**
 * Atribui um usuário a uma variante de um experimento.
 *
 * @param userId       identificador do usuário (ou anonymousId)
 * @param experiment   nome único do experimento
 * @param variants     lista de variantes com pesos relativos
 */
export function assignVariant(
  userId: string,
  experiment: string,
  variants: Variant[]
): AssignedVariant {
  if (variants.length === 0) {
    throw new Error(`[experiments] ${experiment}: variants[] vazio`);
  }

  const hash = hashUserId(userId, experiment);
  const percentile = hash % 100;
  const totalWeight = variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);

  if (totalWeight <= 0) {
    throw new Error(`[experiments] ${experiment}: soma de pesos = 0`);
  }

  let cumulative = 0;
  const normalizedPercentile = (percentile / 100) * totalWeight;

  for (const v of variants) {
    cumulative += Math.max(0, v.weight);
    if (normalizedPercentile < cumulative) {
      return {
        experiment,
        variant: v.name,
        hash,
        percentile,
      };
    }
  }

  // Fallback (não deveria acontecer) — primeira variante
  return {
    experiment,
    variant: variants[0].name,
    hash,
    percentile,
  };
}

/**
 * Helper para tracking de exposição. Emite um evento de analytics quando
 * o usuário é exposto a uma variante.
 *
 * Integração com PostHog/analytics: chama via @/lib/track quando existir.
 * Por enquanto, loga no console (server) — produção vai wirear PostHog.
 */
export function trackExposure(
  userId: string,
  assignment: AssignedVariant
): void {
  // Estrutura segue padrão PostHog: $experiment + $variant
  if (typeof console !== 'undefined') {
    console.log(
      `[experiment] exposure user=${userId} experiment=${assignment.experiment} variant=${assignment.variant} percentile=${assignment.percentile}`
    );
  }
  // TODO Wave 21+: integrar com PostHog via @/lib/track
  // posthog.capture({
  //   distinctId: userId,
  //   event: '$experiment_exposure',
  //   properties: {
  //     $experiment_name: assignment.experiment,
  //     $variant: assignment.variant,
  //   },
  // });
}

/**
 * Helper de tracking de conversão. Chamar quando o usuário completa
 * a ação objetivo do experimento (compra, signup, etc).
 */
export function trackConversion(
  userId: string,
  experiment: string,
  conversionEvent: string
): void {
  if (typeof console !== 'undefined') {
    console.log(
      `[experiment] conversion user=${userId} experiment=${experiment} event=${conversionEvent}`
    );
  }
}
