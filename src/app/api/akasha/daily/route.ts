import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import { buildDailyContent } from '@/lib/akasha/daily-engine';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.akashaDailyReading.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existing) {
    return NextResponse.json({
      date: existing.date.toISOString().split('T')[0],
      climate: existing.climate,
      ritual: existing.ritual,
      alert: existing.alert,
      tensionPoint: existing.tensionPoint,
      // Campos opcionais — podem não existir no schema antigo
      moonPhase: (existing as Record<string, unknown>)['moonPhase'] ?? null,
      overallTheme: (existing as Record<string, unknown>)['overallTheme'] ?? null,
    });
  }

  const birthChart = await prisma.akashaBirthChart.findUnique({
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

  const record = await prisma.akashaDailyReading.create({
    data: {
      userId,
      date: today,
      climate: content.climate,
      ritual: content.ritual as object,
      alert: content.alert,
      tensionPoint: content.tensionPoint as object,
    },
  });

  return NextResponse.json({
    date: record.date.toISOString().split('T')[0],
    climate: record.climate,
    ritual: record.ritual,
    alert: record.alert,
    tensionPoint: record.tensionPoint,
    moonPhase: (record as Record<string, unknown>)['moonPhase'] ?? content.moonPhase,
    overallTheme: (record as Record<string, unknown>)['overallTheme'] ?? content.overallTheme,
  });
}
