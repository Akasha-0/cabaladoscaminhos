import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  AKASHA_REFRESH_COOKIE,
  verifyAkashaToken,
  signAkashaAccessToken,
  signAkashaRefreshToken,
  setAkashaSessionCookie,
  setAkashaRefreshCookie,
  clearAkashaSessionCookie,
  clearAkashaRefreshCookie,
} from '@/lib/auth/akasha-jwt';

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AKASHA_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token ausente. Faça login novamente.' },
      { status: 401 }
    );
  }

  const payload = verifyAkashaToken(refreshToken, 'refresh');
  if (!payload) {
    const res = NextResponse.json(
      { error: 'Refresh token inválido. Faça login novamente.' },
      { status: 401 }
    );
    clearAkashaSessionCookie(res);
    clearAkashaRefreshCookie(res);
    return res;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true },
  });

  if (!user) {
    const res = NextResponse.json(
      { error: 'Usuário não encontrado. Faça login novamente.' },
      { status: 401 }
    );
    clearAkashaSessionCookie(res);
    clearAkashaRefreshCookie(res);
    return res;
  }

  const newAccessToken = signAkashaAccessToken({ id: user.id, email: user.email });
  const newRefreshToken = signAkashaRefreshToken({ id: user.id, email: user.email });

  const response = NextResponse.json({ message: 'Token renovado' });
  setAkashaSessionCookie(response, newAccessToken);
  setAkashaRefreshCookie(response, newRefreshToken);
  return response;
}
