/**
 * POST /api/akasha/dashboard/complete
 * Salva completude de ritual
 * 
 * Body:
 * - ritualName: string
 * - ritualLevel: 'shadow' | 'gift' | 'siddhi'
 * - grimoireId?: string
 * - duration?: number
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { DashboardService, type RitualCompletionData } from '@akasha/core';

const bodySchema = z.object({
  ritualName: z.string(),
  ritualLevel: z.enum(['shadow', 'gift', 'siddhi']),
  grimoireId: z.string().optional(),
  duration: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await request.json();
    parsed = bodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    const service = new DashboardService(prisma);
    const data: RitualCompletionData = {
      ritualName: parsed.ritualName,
      ritualLevel: parsed.ritualLevel,
      grimoireId: parsed.grimoireId,
      duration: parsed.duration,
    };
    const result = await service.saveRitualCompletion(userId, data);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[dashboard/complete] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao salvar ritual', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
