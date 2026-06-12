import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { buildDailyContent } from '@/lib/application/akasha/daily-engine';
import { computeDailyHexagram } from '@/lib/domain/iching';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyReading.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existing) {
    // Cached — compute synthesis on the fly since it's not stored
    const birthChart = await prisma.birthChart.findUnique({ where: { userId } });
    if (!birthChart) return NextResponse.json({ error: 'Mapa não encontrado' }, { status: 404 });
    const content = buildDailyContent(
      birthChart.astrologyMap,
      birthChart.kabalisticMap,
      birthChart.tantricMap,
      birthChart.oduBirth,
      today
    );
    return NextResponse.json({
      date: existing.date.toISOString().split('T')[0],
      climate: existing.climate,
      ritual: existing.ritual,
      alert: existing.alert,
      tensionPoint: existing.tensionPoint,
      hexagram: existing.hexagram,
      hexagramLines: existing.hexagramLines,
      synthesis: content.synthesis ?? null,
    });
  }

  const birthChart = await prisma.birthChart.findUnique({
    where: { userId },
  });

  if (!birthChart) {
    return NextResponse.json({ error: 'Mapa natal não encontrado' }, { status: 404 });
  }

  const content = buildDailyContent(
    birthChart.astrologyMap,
    birthChart.kabalisticMap,
    birthChart.tantricMap,
    birthChart.oduBirth,
    today
  );

  // v0.0.5 T7: hexagrama do dia (5º sistema oracular) — fallback se o
  // cronjob diário ainda não persistiu o registro (GET antes da meia-noite UTC).
  const dailyHex = computeDailyHexagram(today);

  const record = await prisma.dailyReading.create({
    data: {
      userId,
      date: today,
      climate: content.climate,
      ritual: content.ritual as object,
      alert: content.alert,
      tensionPoint: content.tensionPoint as object,
      hexagram: String(dailyHex.hexagramNumber),
      hexagramLines: dailyHex.lines as object,
    },
  });

  return NextResponse.json({
    date: record.date.toISOString().split('T')[0],
    climate: record.climate,
    ritual: record.ritual,
    alert: record.alert,
    tensionPoint: record.tensionPoint,
    hexagram: record.hexagram,
    hexagramLines: record.hexagramLines,
    /** §SYNTHESIS-F1: síntese narrativa Akasha — 6 áreas de vida + decisão diária */
    synthesis: content.synthesis ?? null,
  });
}
