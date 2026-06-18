import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  AKASHA_REFRESH_COOKIE,
  verifyAkashaToken,
  signAkashaAccessToken,
  signAkashaRefreshToken,
  setAkashaSessionCookie,
  setAkashaRefreshCookie,
  clearAkashaSessionCookie,
  clearAkashaRefreshCookie,
} from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';

export async function POST(_request: NextRequest) {
  try {
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

    // Refresh token rotation — verify the incoming token's jti matches the stored active one.
    // If it doesn't match, the token has already been rotated (by a concurrent request
    // or by a stolen-token reuse attempt). Reject to prevent token replay attacks.
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, currentRefreshTokenJti: true },
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

    if (user.currentRefreshTokenJti !== payload.jti) {
      // jti mismatch = token was already rotated or this is a replay of an old token.
      // Treat as potential theft: invalidate session and require re-login.
      await prisma.user.update({
        where: { id: user.id },
        data: { currentRefreshTokenJti: null },
      });
      const res = NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.' },
        { status: 401 }
      );
      clearAkashaSessionCookie(res);
      clearAkashaRefreshCookie(res);
      return res;
    }
    const newAccessToken = signAkashaAccessToken({ id: user.id, email: user.email });
    const newRefreshToken = signAkashaRefreshToken({ id: user.id, email: user.email });

    // Rotate: replace stored jti with the new token's jti — old refresh token immediately invalid.
    const newRefreshPayload = jwt.decode(newRefreshToken) as { jti?: string } | null;
    const newRefreshJti = newRefreshPayload?.jti ?? null;
    await prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenJti: newRefreshJti },
    });

    const response = NextResponse.json({ message: 'Token renovado' });
    setAkashaSessionCookie(response, newAccessToken);
    setAkashaRefreshCookie(response, newRefreshToken);
    return response;
  } catch (err) {
    console.error('[POST /api/akasha/auth/refresh]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
