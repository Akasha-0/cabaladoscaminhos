import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { checkStrictRateLimit, buildStrictRateLimitResponse } from '@/lib/infrastructure/security/rate-limit-strict';

/**
 * Wave 12.5 §12.5: anti-scraping — 30 req/min por userId.
 *
 * GET /api/akasha/auth/me retorna PII (email, nome, birthDate, birthCity).
 * Scrapers poderiam drenar dados pessoais. Rate limit por userId
 * (LGPD-safe, deterministic) bloqueia exfiltração em massa.
 */
async function enforceMeRateLimit(request: NextRequest) {
  const rateLimit = await checkStrictRateLimit(request, 'AUTH_ME', { preferUserId: true });
  if (!rateLimit.allowed) {
    const blocked = buildStrictRateLimitResponse('AUTH_ME');
    return NextResponse.json(blocked.body, {
      status: blocked.status,
      headers: {
        'Retry-After': String(blocked.body.retryAfterSeconds),
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const blocked = await enforceMeRateLimit(request);
  if (blocked) return blocked;

  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  const user = await prisma.user.findUnique({
    where: { id: userOrResponse.id },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      locale: true,
      pushEnabled: true,
      ichingEnabled: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    locale: user.locale,
    pushEnabled: user.pushEnabled,
    ichingEnabled: user.ichingEnabled,
    birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
    birthTime: user.birthTime,
    birthCity: user.birthCity,
  });
}

// Akasha v0.0.5 T8: opt-in LGPD do sorteio de I-Ching.
// Body: { ichingEnabled: boolean }
const patchSchema = z.object({
  ichingEnabled: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  const blocked = await enforceMeRateLimit(request);
  if (blocked) return blocked;

  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  let parsed: z.infer<typeof patchSchema>;
  try {
    const raw = await request.json();
    parsed = patchSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  if (typeof parsed.ichingEnabled !== 'boolean') {
    return NextResponse.json({ error: 'Nenhum campo atualizável' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userOrResponse.id },
    select: { ichingEnabled: true },
    data: { ichingEnabled: parsed.ichingEnabled },
  });

  return NextResponse.json({ ichingEnabled: updated.ichingEnabled });
}
