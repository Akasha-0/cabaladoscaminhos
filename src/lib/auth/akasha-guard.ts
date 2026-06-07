import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AKASHA_TOKEN_COOKIE, verifyAkashaToken } from './akasha-jwt';

// ============================================================================
// Helpers
// ============================================================================

async function loadAkashaUser(id: string) {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (err) {
    console.error('[akasha-guard] DB lookup failed', err);
    return null;
  }
}

async function resolveAkashaUser(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(AKASHA_TOKEN_COOKIE)?.value ??
    request.cookies.get(AKASHA_TOKEN_COOKIE)?.value ??
    null;

  if (!token) return null;

  const payload = verifyAkashaToken(token, 'access');
  if (!payload) return null;

  return loadAkashaUser(payload.sub);
}

// ============================================================================
// Guards
// ============================================================================

/**
 * Route Handler (API): garante que há um AkashaUser autenticado.
 *
 * Retorna o usuário se autenticado, ou NextResponse 401 caso contrário.
 *
 *   const userOrResponse = await requireAkashaApi(request);
 *   if (userOrResponse instanceof NextResponse) return userOrResponse;
 *   const user = userOrResponse;
 */
export async function requireAkashaApi(
  request: NextRequest
): Promise<{ id: string; email: string; name: string } | NextResponse> {
  const user = await resolveAkashaUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { id: user.id, email: user.email, name: user.name };
}

/**
 * Server Component / Server Action: garante que há um AkashaUser autenticado.
 *
 * Lança se não autenticado (para uso em page.tsx via redirect).
 * Para rotas de API prefira `requireAkashaApi`.
 */
export async function requireAkashaUser(
  request: NextRequest
): Promise<{ id: string; email: string; name: string }> {
  const user = await resolveAkashaUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return { id: user.id, email: user.email, name: user.name };
}
