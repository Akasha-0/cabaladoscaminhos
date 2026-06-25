import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { checkStrictRateLimit, buildStrictRateLimitResponse } from '@/lib/infrastructure/security/rate-limit-strict';
import { recordDefaultConsents } from '@/lib/application/privacy/consent';
import { getClientIpInfo } from '@/lib/infrastructure/security/ip-hash';

const registerSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  name: z.string().min(2, 'Nome obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate deve ser YYYY-MM-DD'),
  birthTime: z.string().optional(),
  birthCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  // AD-T5-C: LGPD — consent deve ser explicitamente true no cadastro
  consent: z.literal(true, {
    errorMap: () => ({ message: 'É necessário consentir com o tratamento dos dados' }),
  }),
});

export async function POST(request: NextRequest) {
  // Wave 12.5 §12.5: anti-enumeração + anti-spam de contas — 3 cadastros/hora por IP.
  // UX: usuário humano cria conta uma vez; >3/hora é claramente script.
  const rateLimit = await checkStrictRateLimit(request, 'AUTH_REGISTER', { preferUserId: false });
  if (!rateLimit.allowed) {
    const blocked = buildStrictRateLimitResponse('AUTH_REGISTER');
    return NextResponse.json(blocked.body, {
      status: blocked.status,
      headers: {
        'Retry-After': String(blocked.body.retryAfterSeconds),
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  }

  let body: z.infer<typeof registerSchema>;
  try {
    body = registerSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true },
  });
  if (existing) {
    // Mensagem genérica — anti-enumeração de emails.
    return NextResponse.json({ message: 'Conta criada. Verifique seu e-mail.' }, { status: 201 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  // Signup grant: 10 free credits so new users can try the Mentor before
  // buying. Created in the same request as the user; if the credit insert
  // fails, user creation is rolled back by Prisma's request flow (the
  // findUnique below would not return a row, so no orphan credit).
  const SIGNUP_GRANT_CREDITS = 10;
  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      name: body.name,
      birthDate: new Date(body.birthDate),
      birthTime: body.birthTime,
      birthCity: body.birthCity,
      birthLatitude: body.birthLatitude,
      birthLongitude: body.birthLongitude,
      birthTimezone: body.birthTimezone,
      // AD-T5-C: persistência mínima do consentimento LGPD
      consentAt: new Date(),
    },
    select: { id: true },
  });

  await prisma.creditEntry.create({
    data: {
      userId: newUser.id,
      delta: SIGNUP_GRANT_CREDITS,
      reason: 'signup_grant',
      balance: SIGNUP_GRANT_CREDITS,
    },
  });

  // Wave 19.3 — LGPD Art. 7º (consentimento expresso): registrar os
  // defaults de privacy consent no signup. Append-only audit trail (LGPD
  // Art. 37) — cada uma das 4 categorias vira UMA row em `privacy_consents`.
  // Defaults (ver DEFAULT_SIGNUP_CONSENTS):
  //   - MARKETING = false (opt-in obrigatório)
  //   - ANALYTICS = true  (legítimo interesse)
  //   - AI_TRAINING = false (LGPD Art. 11 — opt-in estrito)
  //   - THIRD_PARTY_SHARING = false (opt-in estrito)
  //
  // IP é hasheado (HMAC-SHA256, LGPD Art. 33) — NUNCA IP puro em logs.
  // Se falhar, NÃO rollback o user creation — o consent default é "nice
  // to have" para o audit trail (User.consentAt já foi persistido acima
  // como consentimento mínimo obrigatório). Logamos o erro para o admin
  // reportar e o user pode re-toggler via /conta/privacidade depois.
  try {
    const { hash: ipHash } = getClientIpInfo(request);
    const userAgent = request.headers.get('user-agent') ?? 'unknown';
    await recordDefaultConsents(newUser.id, { ipHash, userAgent });
  } catch (consentErr) {
    // Non-fatal: signup succeeded, consent audit trail failed.
    // Logged but doesn't block the user.
    console.error('[register] Failed to record default privacy consents', {
      userId: newUser.id,
      error: consentErr instanceof Error ? consentErr.message : String(consentErr),
    });
  }

  return NextResponse.json({ message: 'Conta criada. Verifique seu e-mail.' }, { status: 201 });
}
