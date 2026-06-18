import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from './akasha-jwt';

export interface AkashaUser {
  id: string;
  email: string;
  name: string;
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
