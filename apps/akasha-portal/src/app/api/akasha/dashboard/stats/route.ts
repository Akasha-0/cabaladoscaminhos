/**
 * GET /api/akasha/dashboard/stats
 * Retorna estatísticas do dashboard do usuário
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { DashboardService } from '@akasha/core';

export async function GET(request: NextRequest) {
  // 1. Autenticar
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  try {
    const service = new DashboardService(prisma);
    const stats = await service.getStats(userId);
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[dashboard/stats] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
