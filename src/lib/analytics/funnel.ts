// ============================================================================
// /lib/analytics/funnel — Eventos do funil de conversão (Wave 20)
// ============================================================================
// 7 eventos canônicos do funil de aquisição, mapeados para os helpers
// `events-catalog.ts` quando aplicável. Estes helpers são o ÚNICO lugar
// que deve chamar `trackEvent(...)` para eventos de funil — assim garantimos
// schema consistente e LGPD-safe.
//
// Eventos:
//   1. landing_view      → PAGE_VIEW com context.variant
//   2. cta_click         → validation_cta_clicked (existente, com variant)
//   3. signup_start      → user_signed_up (method=magic_link)
//   4. signup_complete   → user_signed_up (server emit)
//   5. first_post        → post_created (first=true)
//   6. first_like        → post_liked (first=true)
//   7. day7_return       → window.akasha.posthog daily ping + server check
//
// Uso (client component):
//   import { funnelEvents } from '@/lib/analytics/funnel';
//   funnelEvents.ctaClick('B');
//
// Uso (server):
//   import { trackServerFunnelEvent } from '@/lib/analytics/funnel';
//   await trackServerFunnelEvent('signup_complete', { userId, method: 'email' });
// ============================================================================

import { trackEvent, type TrackOptions } from './events-catalog';

export type FunnelStep =
  | 'landing_view'
  | 'cta_click'
  | 'signup_start'
  | 'signup_complete'
  | 'first_post'
  | 'first_like'
  | 'day7_return';

export interface FunnelContext {
  /** Variante da landing (A/B/C/D) — opcional */
  variant?: 'A' | 'B' | 'C' | 'D';
  /** Origem (utm_source, referrer, etc) */
  source?: string;
  /** User ID (post-signup) */
  userId?: string;
  /** Method de signup (email | google | magic_link) */
  method?: 'email' | 'google' | 'apple' | 'magic_link';
  /** Referrer (quem trouxe o user — referral link ?ref=userId) */
  referrer?: string;
  /** Timestamp (auto) */
  timestamp?: string;
}

export const funnelEvents = {
  /**
   * Step 1: usuário visualizou a landing /validacao.
   * Disparar uma vez por pageview (não-spam).
   */
  landingView(opts: { variant: 'A' | 'B' | 'C' | 'D'; source?: string } = { variant: 'A' }) {
    trackEvent('page_viewed', {
      path: '/validacao',
      query: { variant: opts.variant, ...(opts.source ? { source: opts.source } : {}) },
    });
    if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug('[funnel] landing_view', opts);
    }
  },

  /**
   * Step 2: usuário clicou no CTA principal da landing.
   */
  ctaClick(opts: { variant: 'A' | 'B' | 'C' | 'D'; ctaId?: string }) {
    if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug('[funnel] cta_click', opts);
    }
    // Encaminha como evento custom — PostHog vai aceitar
    // sem schema validation (não está no catálogo, mas é útil para funil).
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        akasha?: { posthog?: { capture: (e: { name: string; properties: Record<string, unknown> }) => void } };
      };
      if (w.akasha?.posthog) {
        w.akasha.posthog.capture({
          name: 'funnel_cta_click',
          properties: { variant: opts.variant, cta_id: opts.ctaId ?? 'main' },
        });
      }
    }
  },

  /**
   * Step 3: usuário abriu o form de signup (focus no primeiro campo).
   */
  signupStart(opts: { variant?: 'A' | 'B' | 'C' | 'D'; source?: string } = {}) {
    if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug('[funnel] signup_start', opts);
    }
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        akasha?: { posthog?: { capture: (e: { name: string; properties: Record<string, unknown> }) => void } };
      };
      if (w.akasha?.posthog) {
        w.akasha.posthog.capture({
          name: 'funnel_signup_start',
          properties: { variant: opts.variant, source: opts.source },
        });
      }
    }
  },

  /**
   * Step 4: signup completou (server-side emit).
   * Usa o evento canônico `user_signed_up` com método explícito.
   */
  signupComplete(opts: {
    userId: string;
    method: 'email' | 'google' | 'apple' | 'magic_link';
    variant?: 'A' | 'B' | 'C' | 'D';
  }) {
    trackEvent(
      'user_signed_up',
      {
        method: opts.method,
        userId: opts.userId,
      },
      { serverSide: true }
    );
  },

  /**
   * Step 5: primeiro post criado (< 1h após signup).
   */
  firstPost(opts: { userId: string; postId: string; tradition?: string }) {
    trackEvent(
      'post_created',
      {
        postId: opts.postId,
        authorId: opts.userId,
        postType: 'text',
        tradition: opts.tradition,
        hasMedia: false,
        contentLength: 0,
      },
      { serverSide: true }
    );
  },

  /**
   * Step 6: primeira curtida dada.
   */
  firstLike(opts: { userId: string; postId: string }) {
    trackEvent(
      'post_liked',
      { postId: opts.postId, authorId: opts.userId },
      { serverSide: false }
    );
  },

  /**
   * Step 7: retorno em D+7 (server-side cron checa lastSeenAt).
   * Cliente pode disparar ping diário para identificar.
   */
  day7Return(opts: { userId: string }) {
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        akasha?: { posthog?: { capture: (e: { name: string; properties: Record<string, unknown> }) => void } };
      };
      if (w.akasha?.posthog) {
        w.akasha.posthog.capture({
          name: 'funnel_day7_return',
          properties: { user_id: opts.userId },
        });
      }
    }
  },
};

/**
 * Server-side helper para emitir evento de funil sem expor no client.
 */
export async function trackServerFunnelEvent(
  step: FunnelStep,
  ctx: FunnelContext,
  options: TrackOptions = {}
) {
  switch (step) {
    case 'signup_complete':
      funnelEvents.signupComplete({
        userId: ctx.userId ?? 'unknown',
        method: ctx.method ?? 'email',
        variant: ctx.variant,
      });
      break;
    case 'first_post':
      funnelEvents.firstPost({
        userId: ctx.userId ?? 'unknown',
        postId: 'unknown',
      });
      break;
    default:
      // Outros steps são client-side; server não emite.
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[funnel] server emit ignorado para step=${step}`);
      }
  }
  void options; // silence unused
}
