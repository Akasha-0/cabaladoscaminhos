import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import {
  signAkashaAccessToken,
  signAkashaRefreshToken,
  setAkashaSessionCookie,
  setAkashaRefreshCookie,
} from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import { log, getRequestId } from '@/lib/shared/logging';

const ROUTE = '/api/akasha/auth/login';
// Email hash para correlação de tentativas sem logar PII (LGPD Art. 33).
// SHA-256 truncado a 8 chars é suficiente para identificar tentativas
// repetidas sem permitir enumeração reversa.
import { createHash } from 'crypto';
function emailFingerprint(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12);
}

const loginSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      log.warn('auth.login.invalid_body', { requestId, route: ROUTE, error: err });
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    log.error('auth.login.parse_failed', { requestId, route: ROUTE, error: err });
    throw err;
  }

  // Email fingerprint para correlação sem logar PII (LGPD Art. 33)
  const emailFp = emailFingerprint(body.email);

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user || !user.passwordHash) {
    log.warn('auth.login.user_not_found', { requestId, route: ROUTE, emailFingerprint: emailFp });
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    // Wave 12.3: userId conhecido para correlação com brute-force alerts.
    // NUNCA logar password ou hash.
    log.warn('auth.login.bad_password', {
      requestId,
      route: ROUTE,
      emailFingerprint: emailFp,
      userId: user.id,
    });
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const accessToken = signAkashaAccessToken({ id: user.id, email: user.email });
  const refreshToken = signAkashaRefreshToken({ id: user.id, email: user.email });

  // Extract jti from the freshly signed refresh token to store in DB for rotation tracking.
  const refreshPayload = jwt.decode(refreshToken) as { jti?: string } | null;
  const refreshJti = refreshPayload?.jti ?? null;

  // Store the new jti — this invalidates any previously active refresh token for this user.
  await prisma.user.update({
    where: { id: user.id },
    data: { currentRefreshTokenJti: refreshJti },
  });
  // Honor the `return` query param so the user lands on the page they tried to access.
  // Extract locale from the request URL query params (set by middleware or login page).
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get('locale') ?? 'pt-BR';
  // SECURITY: if returnTo points to an absolute URL off-origin, clamp to /conta.
  // Prevents open redirect if the return param is tampered with.
  let returnTo = searchParams.get('return') ?? `/${locale}/conta`;
  try {
    const parsed = new URL(returnTo, request.url);
    if (parsed.origin !== new URL(request.url).origin) {
      returnTo = `/${locale}/conta`;
    }
  } catch {
    returnTo = `/${locale}/conta`;
  }

  // 307 redirect so browser processes Set-Cookie before navigating.
  const redirectUrl = new URL(returnTo, request.url);
  const response = NextResponse.redirect(redirectUrl, 307);
  setAkashaSessionCookie(response, accessToken);
  setAkashaRefreshCookie(response, refreshToken);

  log.info('auth.login.success', {
    requestId,
    route: ROUTE,
    userId: user.id,
    emailFingerprint: emailFp,
    locale,
  });
  return response;
}