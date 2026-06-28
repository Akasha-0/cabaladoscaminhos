// ============================================================================
// POST /api/newsletter/unsubscribe — cancela inscrição (soft delete)
// ============================================================================
// Aceita token (público, via link no rodapé do email) OU email autenticado.
// Body: { token?: string, email?: string }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// Validation
// ============================================================================

const UnsubscribeSchema = z
  .object({
    token: z.string().min(8).max(128).optional(),
    email: z.string().email().max(255).optional(),
  })
  .refine((d) => d.token || d.email, {
    message: 'Informe token ou email',
  });

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = UnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, email } = parsed.data;

    const where = token
      ? { unsubscribeToken: token }
      : { email: email!.toLowerCase() };

    const subscription = await prisma.newsletterSubscription.findFirst({ where });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    if (subscription.unsubscribedAt) {
      return NextResponse.json({
        ok: true,
        alreadyUnsubscribed: true,
        message: 'Inscrição já estava cancelada',
      });
    }

    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: { unsubscribedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/newsletter/unsubscribe][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição' },
      { status: 500 }
    );
  }
}
