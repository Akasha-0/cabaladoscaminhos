import { NextResponse } from 'next/server';
import { computeDailyHexagram } from '@/lib/daily-engine/iching';

/**
 * GET /api/akasha/iching/daily
 *
 * Retorna o hexagrama do dia (5º sistema oracular, Akasha v0.0.5 T7).
 * Determinístico por data — mesma data → mesmo hexagrama para todos.
 */
export async function GET() {
  const hex = computeDailyHexagram(new Date());
  return NextResponse.json(hex);
}
