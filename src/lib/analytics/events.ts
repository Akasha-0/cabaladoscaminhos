/**
 * analytics/events — stubs de tracking de eventos.
 * ----------------------------------------------------------------------------
 * Fornece interface simples `trackEvent` para componentes que querem
 * registrar eventos de analytics.
 *
 * Quando PostHog/Segment estiver configurado (env POSTHOG_API_KEY),
 * esses stubs enviam para o provider real. Caso contrario, apenas
 * log no console (modo dev/demo).
 *
 * Refs:
 *   - docs/PERFORMANCE-AUDIT.md (planejamento PostHog em wave-6)
 */

export interface AnalyticsEvent {
  /** Nome do evento (snake_case). */
  name: string;
  /** Propriedades customizadas. */
  properties?: Record<string, unknown>;
  /** Timestamp (auto se omitido). */
  timestamp?: string;
}

const isPostHogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

/**
 * Dispara um evento de analytics.
 * Silencioso se provider nao configurado (console.log em dev).
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const enriched: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  if (!isPostHogEnabled) {
    // Modo dev/demo: apenas log
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', enriched.name, enriched.properties ?? {});
    }
    return;
  }

  // Quando PostHog estiver configurado, enviar via API client-side
  try {
    if (typeof window !== 'undefined') {
      const { default: posthog } = await import('posthog-js');
      posthog.capture(enriched.name, enriched.properties ?? {});
    }
  } catch (err) {
    // Falha silenciosa — analytics nunca deve quebrar UX
    console.warn('[analytics] PostHog falhou:', err);
  }
}

/**
 * Helpers semanticos para eventos comuns da comunidade.
 */
export const events = {
  /** Usuario viu a pagina de feedback. */
  feedbackViewed: (communitySlug?: string) =>
    trackEvent({ name: 'feedback_viewed', properties: { communitySlug } }),

  /** Usuario enviou feedback. */
  feedbackSubmitted: (category: string, rating?: number) =>
    trackEvent({
      name: 'feedback_submitted',
      properties: { category, rating },
    }),

  /** Usuario votou em feedback de outro. */
  feedbackVoted: (feedbackId: string, vote: 'up' | 'down') =>
    trackEvent({ name: 'feedback_voted', properties: { feedbackId, vote } }),

  /** Landing de validacao acessada. */
  validationPageViewed: (source?: string) =>
    trackEvent({ name: 'validation_page_viewed', properties: { source } }),

  /** CTA da landing clicado. */
  validationCtaClicked: () =>
    trackEvent({ name: 'validation_cta_clicked' }),

  /** Email capturado para waitlist. */
  waitlistJoined: (email: string, source?: string) =>
    trackEvent({ name: 'waitlist_joined', properties: { source } }),

  // ============================================================================
  // W32 — Waitlist multi-step funnel
  // ============================================================================

  /** Usuario abriu o form multi-step (step 1 visível). */
  waitlistFormStarted: (source?: string) =>
    trackEvent({ name: 'waitlist_form_started', properties: { source } }),

  /** Usuario completou um step do form multi-step (1..5). */
  waitlistStepCompleted: (step: number, source?: string) =>
    trackEvent({
      name: 'waitlist_step_completed',
      properties: { step, source },
    }),

  /** Email de confirmação clicado (vinda do email). */
  waitlistConfirmationClicked: () =>
    trackEvent({ name: 'waitlist_confirmation_clicked' }),

  /** Lead confirmou email via link de confirmação. */
  waitlistConfirmed: () =>
    trackEvent({ name: 'waitlist_confirmed' }),

  /** Admin enviou invite para um lead. */
  waitlistInviteSent: (wave: number, email: string) =>
    trackEvent({ name: 'waitlist_invite_sent', properties: { wave, email } }),

  /** Lead aceitou invite e entrou no beta. */
  waitlistInviteAccepted: () =>
    trackEvent({ name: 'waitlist_invite_accepted' }),

  /** Usuario saiu da fila (unsubscribe). */
  waitlistUnsubscribed: () =>
    trackEvent({ name: 'waitlist_unsubscribed' }),
};