import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from './akasha-jwt';

export interface AkashaUser {
  id: string;
  email: string;
  name: string;
}

export interface AkashaAdmin extends AkashaUser {
  role: 'ADMIN';
}

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookie = request.cookies.get(name);
  return cookie?.value;
}

export async function requireAkashaApi(
  req: NextRequest
): Promise<AkashaUser | NextResponse<{ error: string }>> {
  const token = getCookie(req, AKASHA_TOKEN_COOKIE);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAkashaToken(token, 'access');
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return user as AkashaUser;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function requireAkashaUser(req: NextRequest): Promise<AkashaUser> {
  const result = await requireAkashaApi(req);
  if (result instanceof NextResponse) {
    throw new Error('Unauthorized');
  }
  return result;
}

/**
 * requireAkashaAdmin — Wave 14.
 *
 * Wrap de requireAkashaApi + check `role === 'ADMIN'`. Retorna 401 se não
 * autenticado, 403 se autenticado mas não-ADMIN. Usar em TODOS os endpoints
 * /api/admin/*.
 *
 * Diferencial vs checagem inline: consolida o pattern (todos os admins
 * tinham que fazer `prisma.user.findUnique({ select: { role }})` + if manual),
 * garantindo mensagem consistente e select único do caller.
 */
export async function requireAkashaAdmin(
  req: NextRequest
): Promise<AkashaAdmin | NextResponse<{ error: string }>> {
  const auth = await requireAkashaApi(req);
  if (auth instanceof NextResponse) return auth;

  const caller = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { role: true },
  });
  if (caller?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso restrito a ADMIN' }, { status: 403 });
  }

  return { ...auth, role: 'ADMIN' };
}
