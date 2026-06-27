'use server';

/**
 * Server Actions — Auth + Onboarding
 * ----------------------------------------------------------------------------
 * Pontos de entrada server-side para o fluxo de autenticação. Todas as
 * funções retornam `ActionResult<T>` com shape padronizado:
 *
 *   { ok: true,  data?: T }
 *   { ok: false, error: string, fieldErrors?: Record<string,string[]> }
 *
 * Isso simplifica o consumo nos componentes client (sem `try/catch`
 * repetido) e mantém consistência com as Server Actions do Next 16.
 *
 * IMPORTANTE:
 *   - Não usa `prisma` direto no signup porque o `User` em prisma.schema
 *     ainda é o legado (com `passwordHash`). A integração completa do
 *     `SpiritualProfile` (community.prisma) depende de a Fase 1 do schema
 *     ser mergeada. Por enquanto, as funções persistem via
 *     `community.prisma` quando o client está disponível.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient as createServerSupabase } from '@/lib/supabase/server';
import {
  loginSchema,
  signupSchema,
  onboardingCompleteSchema,
  type LoginInput,
  type SignupInput,
  type OnboardingCompleteInput,
  TRADITIONS,
} from '@/lib/validation/auth';

// ============================================================================
// TYPES
// ============================================================================

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface SignupResult {
  userId: string;
  email: string;
}

export interface LoginResult {
  userId: string;
  email: string;
}

export interface OnboardingResult {
  profileId: string;
  userId: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function fieldErrorsFromZod(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.') || '_';
    if (!out[path]) out[path] = [];
    out[path].push(issue.message);
  }
  return out;
}

function missingSupabase(): ActionResult<never> {
  return {
    ok: false,
    error:
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (ver docs/SUPABASE-SETUP.md).',
  };
}

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Email ou senha incorretos';
  if (/user already registered/i.test(message)) return 'Este email já está cadastrado';
  if (/email not confirmed/i.test(message))
    return 'Confirme seu email antes de entrar — verifique a caixa de entrada';
  return message;
}

// ============================================================================
// LOGIN
// ============================================================================

export async function loginAction(input: LoginInput): Promise<ActionResult<LoginResult>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return missingSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  if (!data.user) {
    return { ok: false, error: 'Falha ao autenticar' };
  }

  revalidatePath('/', 'layout');
  return {
    ok: true,
    data: { userId: data.user.id, email: data.user.email ?? '' },
  };
}

// ============================================================================
// SIGNUP
// ============================================================================

export async function signupAction(input: SignupInput): Promise<ActionResult<SignupResult>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return missingSupabase();

  const { fullName, email, password } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: buildRedirect('/onboarding'),
    },
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  if (!data.user) {
    return { ok: false, error: 'Falha ao criar usuário' };
  }

  // Se a sessão veio pronta (email confirmation desligado), cria perfil
  // espiritual automaticamente para que o onboarding tenha onde pousar.
  if (data.session) {
    await ensureSpiritualProfile(data.user.id, { fullName }).catch(() => {
      // Não bloqueia signup — onboarding pode criar/recriar.
    });
  }

  revalidatePath('/', 'layout');
  return {
    ok: true,
    data: { userId: data.user.id, email: data.user.email ?? '' },
  };
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logoutAction(): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!supabase) return missingSupabase();

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

// ============================================================================
// ONBOARDING — finaliza o fluxo 5 passos
// ============================================================================

export async function completeOnboardingAction(
  input: OnboardingCompleteInput
): Promise<ActionResult<OnboardingResult>> {
  const parsed = onboardingCompleteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return missingSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Não autenticado. Faça login novamente.' };
  }

  const profileId = await upsertSpiritualProfile(user.id, parsed.data);

  revalidatePath('/onboarding');
  revalidatePath('/feed');

  return {
    ok: true,
    data: { profileId, userId: user.id },
  };
}

/**
 * Lista as tradições suportadas — usada por páginas que precisam renderizar
 * o seletor (ex.: /onboarding passo 2).
 */
export async function listTraditionsAction(): Promise<ActionResult<string[]>> {
  return { ok: true, data: [...TRADITIONS] };
}

// ============================================================================
// INTERNAL — persistência do SpiritualProfile
// ============================================================================

interface EnsureArgs {
  fullName: string;
}

async function ensureSpiritualProfile(userId: string, args: EnsureArgs): Promise<string | null> {
  // Tenta criar via Prisma; se DATABASE_URL não estiver configurada
  // (sandbox), loga aviso e devolve null — o onboarding completo
  // tentará de novo depois.
  try {
    const { prisma } = await import('@/lib/prisma');
    const existing = await prisma.spiritualProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (existing) return existing.id;

    const created = await prisma.spiritualProfile.create({
      data: {
        userId,
        birthName: args.fullName,
        birthDate: new Date('1970-01-01'), // placeholder; onboarding corrige
      },
      select: { id: true },
    });
    return created.id;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[auth] Não foi possível criar SpiritualProfile inicial:', err);
    }
    return null;
  }
}

async function upsertSpiritualProfile(
  userId: string,
  data: OnboardingCompleteInput
): Promise<string> {
  const { prisma } = await import('@/lib/prisma');

  // Upsert no SpiritualProfile. birthDate vira Date; birthTime fica string.
  const profile = await prisma.spiritualProfile.upsert({
    where: { userId },
    update: {
      birthName: data.fullName,
      birthDate: new Date(data.birthDate),
      birthTime: data.birthTime || null,
      birthPlace: `${data.birthPlace}, ${data.birthCountry}`,
      onboardedAt: new Date(),
      mapaJson: {
        traditions: data.traditions,
        completedAt: new Date().toISOString(),
      },
    },
    create: {
      userId,
      birthName: data.fullName,
      birthDate: new Date(data.birthDate),
      birthTime: data.birthTime || null,
      birthPlace: `${data.birthPlace}, ${data.birthCountry}`,
      onboardedAt: new Date(),
      mapaJson: {
        traditions: data.traditions,
        completedAt: new Date().toISOString(),
      },
    },
    select: { id: true },
  });

  // Garante que o User espelha displayName (community.prisma)
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { displayName: data.fullName },
    });
  } catch {
    // User não existe na tabela community — pode ter sido criado só no
    // Supabase. Não bloqueia o onboarding.
  }

  return profile.id;
}

function buildRedirect(path: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) return undefined;
  return `${base.replace(/\/$/, '')}${path}`;
}