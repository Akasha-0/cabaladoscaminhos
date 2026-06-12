/**
 * GET /api/akasha/dashboard/history
 * Retorna histórico de rituais completados
 * 
 * Query params:
 * - limit: number (optional, default: 20)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { DashboardService } from '@akasha/core';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: searchParams.get('limit') || '20',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.errors },
      { status: 400 }
    );
  }

  try {
    const service = new DashboardService(prisma);
    const history = await service.getHistory(userId, parsed.data.limit);
    return NextResponse.json(history);
  } catch (err) {
    console.error('[dashboard/history] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
