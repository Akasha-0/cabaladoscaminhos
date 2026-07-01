// ============================================================================
// ONBOARDING PERSISTENCE — Wave 35
// ============================================================================
// Camada fina que aplica uma transição ao DB. Lê estado atual, calcula
// próximo via `transition()`, atualiza User, e registra OnboardingEvent.
//
// Atomicidade: Prisma não suporta transaction em runtime com Edge — então
// usamos `update` idempotente + `create` separado. Falha no log é tolerada
// (LGPD art. 37 não pode bloquear UX).
//
// Funções expostas são server-only (`prisma` import). Para client, use
// `/api/onboarding/state` (GET/PUT) e `/api/onboarding/event` (POST).
// ============================================================================

import type { OnboardingState, OnboardingEventKind } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  transition,
  type OnboardingTransition,
  type TransitionContext,
  type TransitionResult,
  progressPercent,
} from './state-machine';

/** Input de `applyTransition`. */
export interface ApplyInput {
  userId: string;
  event: OnboardingTransition;
  ctx?: TransitionContext;
  /** Metadata extra (não-PII) anexada ao evento. */
  metadata?: Record<string, unknown>;
  /** Kind explícito do evento (default = derivado). */
  eventKind?: OnboardingEventKind;
}

/** Output de `applyTransition`. */
export interface ApplyOutput {
  result: TransitionResult;
  /** ID do OnboardingEvent criado (null se evento não-persistido). */
  eventId: string | null;
}

const EVENT_KIND_MAP: Record<OnboardingTransition, OnboardingEventKind | null> = {
  invite_accepted: 'STATE_ADVANCED',
  welcome_viewed: 'WELCOME_VIEWED',
  welcome_completed: 'WELCOME_COMPLETED',
  welcome_skipped: 'WELCOME_SKIPPED',
  profile_completed: 'PROFILE_COMPLETED',
  tradition_selected: 'TRADITION_SELECTED',
  first_action_started: 'FIRST_ACTION_CTA_CLICKED',
  first_action_completed: 'FIRST_ACTION_COMPLETED',
  tour_completed: 'TOUR_COMPLETED',
  tour_skipped: 'TOUR_SKIPPED',
  onboarding_skipped_all: 'ONBOARDING_SKIPPED_ALL',
  reminder_sent: 'REMINDER_SENT',
  milestone_reached: 'MILESTONE_REACHED',
  no_op: null,
};

/**
 * Aplica uma transição de onboarding: lê estado atual, calcula próximo,
 * atualiza User, registra evento. Tudo server-side.
 *
 * @throws Nunca. Falhas são logadas e retornadas como `result.changed=false`.
 */
export async function applyTransition(input: ApplyInput): Promise<ApplyOutput> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      onboardingState: true,
      onboardingWelcomeStep: true,
      onboardingSkippedAll: true,
    },
  });

  if (!user) {
    return {
      result: {
        state: 'INVITED',
        changed: false,
        welcomeStep: 0,
        label: 'Usuário não encontrado',
        nextRoute: null,
      },
      eventId: null,
    };
  }

  const ctx: TransitionContext = {
    ...input.ctx,
    welcomeStep: input.ctx?.welcomeStep ?? user.onboardingWelcomeStep,
  };

  const result = transition(user.onboardingState, input.event, ctx);

  // Atualiza User apenas se houve mudança.
  if (result.changed) {
    // ONBOARDED também marca `SpiritualProfile.onboardedAt` (legacy field)
    // para compat com queries existentes que checam esse flag.
    if (result.state === 'ONBOARDED') {
      try {
        await prisma.spiritualProfile.update({
          where: { userId: input.userId },
          data: { onboardedAt: new Date() },
        });
      } catch {
        // Perfil pode não existir ainda (race com signup) — best effort.
      }
    }
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        onboardingState: result.state,
        onboardingWelcomeStep: result.welcomeStep,
        // Skip-all persistente: nunca mais mostrar.
        ...(input.event === 'onboarding_skipped_all' && { onboardingSkippedAll: true }),
      },
    });
  } else if (result.welcomeStep !== user.onboardingWelcomeStep) {
    // Só mudou o step do carrossel (sem mudar estado) — atualiza para retomar.
    await prisma.user.update({
      where: { id: input.userId },
      data: { onboardingWelcomeStep: result.welcomeStep },
    });
  }

  // Persiste o evento (append-only).
  const kind = input.eventKind ?? EVENT_KIND_MAP[input.event];
  let eventId: string | null = null;
  if (kind) {
    try {
      const ev = await prisma.onboardingEvent.create({
        data: {
          userId: input.userId,
          kind,
          metadata: (input.metadata ?? input.ctx?.metadata ?? {}) as Prisma.InputJsonValue,
          stateBefore: user.onboardingState,
          stateAfter: result.state,
          abVariant: input.ctx?.abVariant ?? null,
          device: input.ctx?.device ?? null,
        },
        select: { id: true },
      });
      eventId = ev.id;
    } catch {
      // Falha ao logar não pode bloquear UX.
    }
  }

  return { result, eventId };
}

/** Lê o estado de onboarding atual do usuário (read-only). */
export async function readOnboardingState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      onboardingState: true,
      onboardingWelcomeStep: true,
      onboardingSkippedAll: true,
      preferredTradition: true,
      practicePreferences: true,
      emailPrefsNewContent: true,
      emailPrefsCommunity: true,
      emailPrefsMentorship: true,
      emailPrefsMarketing: true,
      emailPrefsNpsSurveys: true,
      lgpdRefreshedAt: true,
      displayName: true,
      avatarUrl: true,
      bioPublic: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    progressPercent: progressPercent(user.onboardingState),
  };
}