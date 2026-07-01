// ============================================================================
// POST /api/onboarding/event — Beta Onboarding Wave 35
// ============================================================================
// Endpoint append-only para registrar eventos granulares do onboarding
// (welcome_viewed, profile_field_edited, tour_step_viewed, etc).
//
// Não muda estado — apenas loga. Útil para analytics sem precisar de um
// PUT cheio no state.
//
// Auth: requer sessão Supabase. Rate limit: 120 events/min/user (defesa
// contra cliente malicioso que pode tentar inflar métricas).
//
// LGPD: metadata.validado contra schema zod que rejeita chaves com PII
// óbvia (email, cpf, telefone, address).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';
import { applyTransition } from '@/lib/onboarding/persistence';
import { Prisma, type OnboardingEventKind } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function resolveUserId(supabaseUserId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true },
  });
  return u?.id ?? null;
}

// ============================================================================
// Schema — eventos aceitos
// ============================================================================

const EVENT_KINDS = [
  'WELCOME_VIEWED',
  'WELCOME_STEP_CHANGED',
  'WELCOME_SKIPPED',
  'WELCOME_COMPLETED',
  'PROFILE_FIELD_EDITED',
  'PROFILE_AVATAR_UPLOADED',
  'PROFILE_LGPD_REFRESHED',
  'PROFILE_NOTIFICATION_PREFS_SAVED',
  'PROFILE_COMPLETED',
  'TRADITION_SELECTED',
  'FIRST_ACTION_CTA_CLICKED',
  'FIRST_ACTION_COMPLETED',
  'TOUR_STEP_VIEWED',
  'TOUR_SKIPPED',
  'TOUR_COMPLETED',
  'ONBOARDING_SKIPPED_ALL',
  'REMINDER_SENT',
  'MILESTONE_REACHED',
  'STATE_ADVANCED',
] as const satisfies readonly OnboardingEventKind[];

const metadataSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (m) => {
      // Defesa simples contra PII óbvia em metadata.
      const banned = ['email', 'cpf', 'phone', 'telefone', 'address', 'endereço'];
      for (const key of Object.keys(m)) {
        if (banned.some((b) => key.toLowerCase().includes(b))) return false;
      }
      return true;
    },
    { message: 'metadata contém chaves com PII óbvia (banned keys)' }
  );

const eventSchema = z.object({
  kind: z.enum(EVENT_KINDS),
  metadata: metadataSchema.optional(),
  abVariant: z.string().max(40).optional(),
  /** Opcional: aplicar transição associada junto com o log do evento. */
  applyTransition: z
    .enum([
      'no_op',
      'welcome_viewed',
      'welcome_completed',
      'welcome_skipped',
      'profile_completed',
      'tradition_selected',
      'first_action_started',
      'first_action_completed',
      'tour_completed',
      'tour_skipped',
      'onboarding_skipped_all',
    ])
    .optional(),
  welcomeStep: z.number().int().min(0).max(3).optional(),
  device: z.string().max(120).optional(),
});

// ============================================================================
// Rate limit simples em memória (120/min/user) — defesa contra flooding
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const userBuckets = new Map<string, number[]>();

function checkRate(userId: string): boolean {
  const now = Date.now();
  const bucket = userBuckets.get(userId) ?? [];
  const recent = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  userBuckets.set(userId, recent);
  return true;
}

// ============================================================================
// POST handler
// ============================================================================

export async function POST(req: NextRequest) {
  const supabaseId = await getCurrentUserId();
  if (!supabaseId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const userId = await resolveUserId(supabaseId);
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  if (!checkRate(userId)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: z.infer<typeof eventSchema>;
  try {
    body = eventSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_input',
        detail: err instanceof z.ZodError ? err.issues : 'parse_error',
      },
      { status: 400 }
    );
  }

  // Aplica transição (se pedida) ANTES de logar o evento — assim o evento
  // captura stateBefore/stateAfter corretos.
  let transitionResult = null;
  if (body.applyTransition && body.applyTransition !== 'no_op') {
    const out = await applyTransition({
      userId,
      event: body.applyTransition,
      ctx: { welcomeStep: body.welcomeStep, abVariant: body.abVariant, device: body.device },
      metadata: body.metadata,
      eventKind: body.kind,
    });
    transitionResult = out.result;
  } else {
    // Log direto sem transição.
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingState: true },
      });
      await prisma.onboardingEvent.create({
        data: {
          userId,
          kind: body.kind,
          metadata: (body.metadata ?? {}) as Prisma.InputJsonValue,
          stateBefore: user?.onboardingState ?? null,
          stateAfter: user?.onboardingState ?? null,
          abVariant: body.abVariant ?? null,
          device: body.device ?? null,
        },
      });
    } catch {
      // Falha ao logar não pode bloquear.
    }
  }

  return NextResponse.json({
    ok: true,
    transition: transitionResult,
  });
}