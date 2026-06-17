import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/infrastructure/prisma';
import {
  signAkashaAccessToken,
  signAkashaRefreshToken,
  setAkashaSessionCookie,
  setAkashaRefreshCookie,
} from '@/lib/application/auth/akasha-jwt';

const loginSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const accessToken = signAkashaAccessToken({ id: user.id, email: user.email });
  const refreshToken = signAkashaRefreshToken({ id: user.id, email: user.email });

  // Return 307 redirect so the browser processes Set-Cookie BEFORE navigating.
  // This fixes the race condition where router.push() fires before the cookie
  // is committed to the browser jar — causing all pages to redirect to /onboarding.
  // Get locale from Next-Url header (set by middleware for locale-prefixed routes).
  const nextUrl = request.headers.get('next-url');
  const locale = (nextUrl?.split('/')[1]) || 'pt-BR';
  const redirectUrl = new URL(`/${locale}/conta`, request.url);
  const response = NextResponse.redirect(redirectUrl, 307);
  setAkashaSessionCookie(response, accessToken);
  setAkashaRefreshCookie(response, refreshToken);
  return response;
}
