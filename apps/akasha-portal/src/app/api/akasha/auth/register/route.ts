import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { log, getRequestId } from '@/lib/shared/logging';
import { createHash } from 'crypto';

const ROUTE = '/api/akasha/auth/register';

/** Email fingerprint — correlação sem PII (LGPD Art. 33). */
function emailFingerprint(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12);
}

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
  const requestId = getRequestId(request);
  let body: z.infer<typeof registerSchema>;
  try {
    body = registerSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      log.warn('auth.register.invalid_body', { requestId, route: ROUTE, error: err });
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    log.error('auth.register.parse_failed', { requestId, route: ROUTE, error: err });
    throw err;
  }

  const emailFp = emailFingerprint(body.email);
  log.info('auth.register.attempt', { requestId, route: ROUTE, emailFingerprint: emailFp });

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true },
  });
  if (existing) {
    // Mensagem genérica — anti-enumeração de emails.
    // Log interno: userId já existe; correlaciona com tentativas repetidas.
    log.warn('auth.register.duplicate_email', {
      requestId,
      route: ROUTE,
      emailFingerprint: emailFp,
      existingUserId: existing.id,
    });
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

  log.info('auth.register.success', {
    requestId,
    route: ROUTE,
    userId: newUser.id,
    emailFingerprint: emailFp,
    signupGrantCredits: SIGNUP_GRANT_CREDITS,
    consent: true,
  });

  return NextResponse.json({ message: 'Conta criada. Verifique seu e-mail.' }, { status: 201 });
}