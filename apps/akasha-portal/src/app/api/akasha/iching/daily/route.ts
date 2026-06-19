import { NextResponse } from 'next/server';
import { computeDailyHexagram } from '@/lib/domain/iching';

/**
 * GET /api/akasha/iching/daily
 *
 * Retorna o hexagrama do dia (5º sistema oracular, Akasha v0.0.5 T7).
 * Determinístico por data — mesma data → mesmo hexagrama para todos.
 */
export async function GET() {
  try {
    const hex = computeDailyHexagram(new Date());
    return NextResponse.json(hex);
  } catch (err) {
    console.error('[GET /api/akasha/iching/daily]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
