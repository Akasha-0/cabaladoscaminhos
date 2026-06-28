// ============================================================================
// GET /api/admin/funnel-metrics — Wave 20 — Métricas do funil de conversão
// ============================================================================
// Snapshot dos 7 eventos do funil + breakdown por variante da landing.
// In-memory (substituir por PostHog query em produção).
//
// Auth: TODO (admin gate). Por enquanto, dev-only (NODE_ENV !== 'production').
// ============================================================================

import { NextResponse } from 'next/server';
import { getVariantMetrics } from '@/lib/landing/variant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FunnelStep {
  step: string;
  description: string;
  /** Eventos por dia (placeholder — substituir por query ao PostHog) */
  last7days: number[];
  total: number;
}

const FUNNEL_STEPS: FunnelStep[] = [
  {
    step: 'landing_view',
    description: 'Visualização da landing /validacao',
    last7days: [42, 38, 51, 47, 62, 55, 70],
    total: 365,
  },
  {
    step: 'cta_click',
    description: 'Clique no CTA principal da landing',
    last7days: [12, 10, 18, 15, 22, 19, 24],
    total: 120,
  },
  {
    step: 'signup_start',
    description: 'Início do signup (focus em email)',
    last7days: [10, 8, 14, 12, 17, 15, 19],
    total: 95,
  },
  {
    step: 'signup_complete',
    description: 'Signup completo (conta criada)',
    last7days: [7, 5, 11, 9, 13, 11, 15],
    total: 71,
  },
  {
    step: 'first_post',
    description: 'Primeiro post criado (em <1h após signup)',
    last7days: [3, 2, 5, 4, 6, 5, 8],
    total: 33,
  },
  {
    step: 'first_like',
    description: 'Primeira curtida dada',
    last7days: [5, 4, 8, 7, 10, 8, 12],
    total: 54,
  },
  {
    step: 'day7_return',
    description: 'Retorno em D+7',
    last7days: [2, 1, 3, 2, 4, 3, 5],
    total: 20,
  },
];

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin gate pendente' },
      { status: 403 }
    );
  }

  const variantMetrics = getVariantMetrics();

  // Calcula conversion rate por etapa
  const enrichedFunnel = FUNNEL_STEPS.map((step, idx) => {
    const previous = idx > 0 ? FUNNEL_STEPS[idx - 1] : null;
    const conversionFromTop =
      FUNNEL_STEPS[0].total > 0 ? step.total / FUNNEL_STEPS[0].total : 0;
    const conversionFromPrevious = previous && previous.total > 0
      ? step.total / previous.total
      : null;
    return {
      ...step,
      conversionFromTop: Number(conversionFromTop.toFixed(4)),
      conversionFromPrevious:
        conversionFromPrevious !== null
          ? Number(conversionFromPrevious.toFixed(4))
          : null,
    };
  });

  return NextResponse.json({
    funnel: enrichedFunnel,
    variants: variantMetrics,
    summary: {
      visitorToWaitlist:
        FUNNEL_STEPS[1].total / Math.max(1, FUNNEL_STEPS[0].total),
      waitlistToSignup:
        FUNNEL_STEPS[3].total / Math.max(1, FUNNEL_STEPS[1].total),
      signupToActivation:
        FUNNEL_STEPS[4].total / Math.max(1, FUNNEL_STEPS[3].total),
      signupToD7Retention:
        FUNNEL_STEPS[6].total / Math.max(1, FUNNEL_STEPS[3].total),
    },
    meta: {
      timestamp: new Date().toISOString(),
      periodDays: 7,
      note: 'In-memory metrics. Replace with PostHog query in Wave 21+.',
    },
  });
}
