// ============================================================================
// PATCH /api/newsletter/preferences — atualiza tradições + frequência
// ============================================================================
// Auth: obrigatória (não-anônimo). Identifica pelo viewer.id OU pelo email.
// Body: { email?: string, traditions?: string[], frequency?: 'WEEKLY'|'MONTHLY'|'NEVER' }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Validation
// ============================================================================

const PrefsSchema = z.object({
  email: z.string().email().max(255).optional(),
  traditions: z.array(z.string().min(1).max(64)).max(20).optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'NEVER']).optional(),
});

// ============================================================================
// PATCH handler
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const viewer = await getViewer();
    const body = await request.json().catch(() => null);
    const parsed = PrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, traditions, frequency } = parsed.data;

    // Identifica a inscrição: viewer autenticado tem prioridade; senão, por email
    let subscription;
    if (viewer?.id) {
      subscription = await prisma.newsletterSubscription.findFirst({
        where: { userId: viewer.id },
      });
    }
    if (!subscription && email) {
      subscription = await prisma.newsletterSubscription.findUnique({
        where: { email: email.toLowerCase() },
      });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    const updated = await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        ...(traditions !== undefined ? { traditions } : {}),
        ...(frequency !== undefined ? { frequency } : {}),
      },
      select: {
        id: true,
        email: true,
        traditions: true,
        frequency: true,
        unsubscribedAt: true,
      },
    });

    return NextResponse.json({ ok: true, subscription: updated });
  } catch (err) {
    console.error('[api/newsletter/preferences][PATCH] error', err);
    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}
