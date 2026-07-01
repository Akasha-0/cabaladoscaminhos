// ============================================================================
// GET/PUT /api/onboarding/state — Beta Onboarding Wave 35
// ============================================================================
// GET: devolve o estado atual do onboarding para o usuário autenticado.
// PUT: atualiza campos do profile (avatar, displayName, bio, prática
//      preferida, email prefs) + opcionalmente avança o estado.
//
// Auth: requer sessão Supabase (cookie). Rate limit: 60 req/min/user.
//
// LGPD: o PUT é uma operação de tratamento (art. 5) — registra evento
// `PROFILE_FIELD_EDITED` quando há mudança de campos sensíveis (LGPD
// refresh, email prefs).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';
import { readOnboardingState } from '@/lib/onboarding/persistence';
import { getNextRoute, progressPercent } from '@/lib/onboarding/state-machine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// Auth helper — extrai userId da sessão Supabase
// ============================================================================
async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Mapeia Supabase auth user.id → User.id (cuid). */
async function resolveUserId(supabaseUserId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true },
  });
  return u?.id ?? null;
}

// ============================================================================
// GET handler
// ============================================================================
export async function GET(_req: NextRequest) {
  const supabaseId = await getCurrentUserId();
  if (!supabaseId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const userId = await resolveUserId(supabaseId);
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  const state = await readOnboardingState(userId);
  if (!state) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    state: {
      ...state,
      nextRoute: getNextRoute(state.onboardingState),
      progressPercent: progressPercent(state.onboardingState),
    },
  });
}

// ============================================================================
// PUT handler
// ============================================================================

const putSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  bioPublic: z.string().trim().max(280).optional().nullable(),
  preferredTradition: z.string().trim().min(2).max(40).optional().nullable(),
  practicePreferences: z.array(z.string().min(2).max(40)).max(10).optional(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  emailPrefsNewContent: z.boolean().optional(),
  emailPrefsCommunity: z.boolean().optional(),
  emailPrefsMentorship: z.boolean().optional(),
  emailPrefsMarketing: z.boolean().optional(),
  emailPrefsNpsSurveys: z.boolean().optional(),
  lgpdConsented: z.boolean().optional(),
  /** Avançar estado (evento). null = no_op. */
  transitionEvent: z
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
  /** Step do carrossel welcome (0..3). */
  welcomeStep: z.number().int().min(0).max(3).optional(),
});

export async function PUT(req: NextRequest) {
  const supabaseId = await getCurrentUserId();
  if (!supabaseId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const userId = await resolveUserId(supabaseId);
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  let body: z.infer<typeof putSchema>;
  try {
    body = putSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_input',
        detail: err instanceof z.ZodError ? err.issues : 'parse_error',
      },
      { status: 400 }
    );
  }

  // Aplica update (apenas campos presentes no body).
  const data: Record<string, unknown> = {};
  if (body.displayName !== undefined) data.displayName = body.displayName;
  if (body.bioPublic !== undefined) data.bioPublic = body.bioPublic;
  if (body.preferredTradition !== undefined) data.preferredTradition = body.preferredTradition;
  if (body.practicePreferences !== undefined) data.practicePreferences = body.practicePreferences;
  if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
  if (body.emailPrefsNewContent !== undefined) data.emailPrefsNewContent = body.emailPrefsNewContent;
  if (body.emailPrefsCommunity !== undefined) data.emailPrefsCommunity = body.emailPrefsCommunity;
  if (body.emailPrefsMentorship !== undefined) data.emailPrefsMentorship = body.emailPrefsMentorship;
  if (body.emailPrefsMarketing !== undefined) data.emailPrefsMarketing = body.emailPrefsMarketing;
  if (body.emailPrefsNpsSurveys !== undefined) data.emailPrefsNpsSurveys = body.emailPrefsNpsSurveys;

  // LGPD refresh — atualiza timestamp + loga evento.
  if (body.lgpdConsented === true) {
    data.lgpdRefreshedAt = new Date();
  }

  // Welcome step — atualiza direto (não passa pela máquina).
  if (body.welcomeStep !== undefined) {
    data.onboardingWelcomeStep = body.welcomeStep;
  }

  if (Object.keys(data).length > 0) {
    await prisma.user.update({ where: { id: userId }, data });
  }

  // Aplica transição se pedida.
  let transitionResult = null;
  if (body.transitionEvent && body.transitionEvent !== 'no_op') {
    const { applyTransition } = await import('@/lib/onboarding/persistence');
    const out = await applyTransition({
      userId,
      event: body.transitionEvent,
      ctx: { welcomeStep: body.welcomeStep },
      metadata: {
        source: 'api:onboarding/state',
        lgpdRefreshed: body.lgpdConsented === true,
      },
    });
    transitionResult = out.result;
  }

  // Lê estado final.
  const final = await readOnboardingState(userId);

  return NextResponse.json({
    ok: true,
    state: final
      ? {
          ...final,
          nextRoute: getNextRoute(final.onboardingState),
          progressPercent: progressPercent(final.onboardingState),
        }
      : null,
    transition: transitionResult,
  });
}