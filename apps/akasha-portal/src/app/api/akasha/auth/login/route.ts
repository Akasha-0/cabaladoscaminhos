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

  // Honor the `return` query param so the user lands on the page they tried to access.
  // Extract locale from the request URL query params (set by middleware or login page).
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get('locale') ?? 'pt-BR';
  const returnTo = searchParams.get('return') ?? `/${locale}/conta`;

  // 307 redirect so browser processes Set-Cookie before navigating.
  const redirectUrl = new URL(returnTo, request.url);
  const response = NextResponse.redirect(redirectUrl, 307);
  setAkashaSessionCookie(response, accessToken);
  setAkashaRefreshCookie(response, refreshToken);
  return response;
}
