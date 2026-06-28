import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/profile-auto-create
 * ----------------------------------------------------------------------------
 * Cria (ou recupera) o `SpiritualProfile` Prisma do usuário autenticado.
 *
 * Chamado tipicamente pelo client imediatamente após `supabase.auth.signUp()`
 * retornar uma sessão pronta (email confirmation OFF) — garante que o
 * `SpiritualProfile` existe antes do usuário entrar no onboarding.
 *
 * Idempotente: se já existir perfil para o `userId`, faz upsert preservando
 * os campos já preenchidos (não sobrescreve birthDate, birthPlace, mapaJson).
 *
 * Body: { fullName: string, birthDate?: string (YYYY-MM-DD) }
 * 200 OK:                     { ok: true, profileId, created: boolean }
 * 400 Bad Request:            — body inválido ou userId não-auth
 * 401 Unauthorized:           — sem sessão Supabase válida
 * 503 Service Unavailable:    — Supabase não configurado (sandbox)
 *
 * Segurança:
 *   - `userId` vem do JWT validado por `supabase.auth.getUser()` server-side,
 *     **nunca** do body. Previne que um usuário crie perfil para outro.
 *
 * Wave 11 (auth integration).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Formato esperado YYYY-MM-DD')
    .optional(),
});

export async function POST(request: Request) {
  // 1. Autentica via Supabase — getUser() valida o JWT server-side
  const supabase = await createClient();
  if (!supabase) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('[auth/profile-auto-create] Supabase não configurado.');
    }
    return NextResponse.json(
      { error: 'Serviço de autenticação indisponível.' },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Não autenticado. Faça login e tente novamente.' },
      { status: 401 }
    );
  }

  // 2. Valida body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 }
    );
  }

  const { fullName, birthDate } = parsed.data;

  // 3. Upsert idempotente do SpiritualProfile
  //    - birthDate usa fallback seguro (1970-01-01) se não fornecido, para
  //      satisfazer o `@default(now())` não-existir nesse campo (é obrigatório).
  //    - O onboarding completa os dados reais depois.
  const placeholderDate = birthDate
    ? new Date(`${birthDate}T00:00:00.000Z`)
    : new Date('1970-01-01T00:00:00.000Z');

  try {
    const existing = await prisma.spiritualProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    const profile = await prisma.spiritualProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        birthName: fullName,
        birthDate: placeholderDate,
        // birthTime e birthPlace ficam null até onboarding
      },
      update: {
        // Não sobrescreve birthDate/birthName se já existem — onboarding
        // pode ter avançado. Apenas garante consistência mínima.
        birthName: fullName,
      },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      profileId: profile.id,
      created: !existing,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.error('[auth/profile-auto-create] Prisma error:', err);
    }
    // Não vaza detalhes do erro para o cliente (F14 security audit).
    return NextResponse.json(
      { error: 'Erro ao provisionar perfil. Tente novamente.' },
      { status: 500 }
    );
  }
}
