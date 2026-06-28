// ============================================================================
// POST /api/email/subscribe-welcome — dispara welcome series para novo usuário
// ============================================================================
// Chamado pelo fluxo de signup (após criar conta + completar onboarding).
// Idempotente: se já existe campanha ativa para o user, não duplica.
//
// Body: { userId: string } ou {} (se houver sessão autenticada)
// Auth: opcional (signups públicos podem chamar)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import {
  scheduleWelcomeSeries,
  cancelWelcomeSeries,
  type WelcomeSequenceUser,
} from '@/lib/email/sequences';

export const dynamic = 'force-dynamic';

// ============================================================================
// Validation
// ============================================================================

const BodySchema = z
  .object({
    userId: z.string().min(1).optional(),
    cancel: z.boolean().optional(),
  })
  .optional();

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = BodySchema.parse(body);
    const viewer = await getViewer();

    // Resolve userId: do body, ou da sessão, ou erro
    const targetUserId = parsed?.userId ?? viewer?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId é obrigatório (body ou sessão)' },
        { status: 400 }
      );
    }

    // Permissão: só admin ou o próprio user pode disparar
    if (viewer && viewer.id !== targetUserId) {
      // Em produção: checar isAdmin. Aqui aceitamos se caller é o próprio user.
      return NextResponse.json(
        { error: 'Sem permissão para agendar welcome series para outro usuário' },
        { status: 403 }
      );
    }

    // Modo cancel: cancela jobs pendentes (ex: user pediu pra desativar)
    if (parsed?.cancel === true) {
      const cancelled = await cancelWelcomeSeries(targetUserId);
      return NextResponse.json({ ok: true, cancelled });
    }

    // Lookup do user
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem email' },
        { status: 404 }
      );
    }

    // Lookup do perfil espiritual (para tradições + caminho de vida)
    const profile = await prisma.spiritualProfile.findUnique({
      where: { userId: targetUserId },
      select: {
        caminhoDeVida: true,
        traditions: true,
        oduNascimento: true,
      },
    });

    // Tradições: do profile (categoria principal) ou do post inicial
    const traditions: string[] = [];
    let mainTradition: string | null = null;

    // Heurística simples: tradição mais frequente nos posts do user
    const topTradition = await prisma.post.findFirst({
      where: { authorId: targetUserId, deletedAt: null },
      orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
      select: { tradition: true },
    });

    if (topTradition?.tradition) {
      mainTradition = topTradition.tradition;
      traditions.push(topTradition.tradition);
    }

    // Fallback: tradição padrão se nenhuma preferência
    if (traditions.length === 0) {
      traditions.push('meditacao');
      mainTradition = 'meditacao';
    }

    const welcomeUser: WelcomeSequenceUser = {
      id: user.id,
      email: user.email,
      nomeCompleto: user.nomeCompleto,
      traditions,
      caminhoDeVida: profile?.caminhoDeVida ?? null,
      mainTradition,
    };

    const result = await scheduleWelcomeSeries(welcomeUser);

    return NextResponse.json(
      {
        ok: result.ok,
        campaignId: result.campaignId,
        jobsScheduled: result.jobsScheduled,
        message: result.ok
          ? `Welcome series agendada (${result.jobsScheduled} emails: Day 0, Day 2, Day 7)`
          : 'Welcome series já estava agendada — nenhuma duplicação criada',
      },
      { status: result.ok ? 201 : 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    console.error('[api/email/subscribe-welcome][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao agendar welcome series' },
      { status: 500 }
    );
  }
}
