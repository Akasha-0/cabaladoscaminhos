/**
 * GET /api/akasha/dashboard/streak
 * Retorna dias de streak para o calendário
 */
import { DashboardService } from '@akasha/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  try {
    const service = new DashboardService(prisma);
    const streak = await service.getStreak(userId);
    return NextResponse.json(streak);
  } catch (err) {
    console.error('[dashboard/streak] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar streak', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
