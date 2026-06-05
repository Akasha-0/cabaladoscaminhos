import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const existing = await prisma.akashaBirthChart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ message: 'Mapa natal já calculado', chartId: existing.id });
  }

  const user = await prisma.akashaUser.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      birthDate: true,
      birthTime: true,
      birthLatitude: true,
      birthLongitude: true,
      birthTimezone: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const birthDateStr = user.birthDate.toISOString().split('T')[0];

  const [{ buildKabalisticMap }, { buildTantricMap }, { calculateBirthOdu }, { getBirthChart }] =
    await Promise.all([
      import('@akasha/core-cabala'),
      import('@akasha/core-tantra'),
      import('@akasha/core-odus'),
      import('@akasha/core-astrology'),
    ]);

  let astrologyMap: unknown;
  try {
    if (user.birthLatitude != null && user.birthLongitude != null) {
      astrologyMap = getBirthChart({
        birthDate: user.birthDate,
        latitude: user.birthLatitude,
        longitude: user.birthLongitude,
      });
    } else {
      astrologyMap = { note: 'Coordenadas ausentes; forneça lat/lng para mapa completo.' };
    }
  } catch (err) {
    astrologyMap = { error: 'Falha no cálculo astral', detail: String(err) };
  }

  let kabalisticMap: unknown;
  try {
    kabalisticMap = buildKabalisticMap(user.fullName, birthDateStr);
  } catch (err) {
    kabalisticMap = { error: 'Falha no cálculo cabalístico', detail: String(err) };
  }

  let tantricMap: unknown;
  try {
    tantricMap = buildTantricMap(birthDateStr);
  } catch (err) {
    tantricMap = { error: 'Falha no cálculo tântrico', detail: String(err) };
  }

  let oduBirth: unknown;
  try {
    oduBirth = calculateBirthOdu(birthDateStr);
  } catch (err) {
    oduBirth = { error: 'Falha no cálculo do Odu', detail: String(err) };
  }

  const incomplete = user.birthLatitude == null || user.birthLongitude == null;

  const chart = await prisma.akashaBirthChart.create({
    data: {
      userId,
      astrologyMap: astrologyMap ?? {},
      kabalisticMap: kabalisticMap ?? {},
      tantricMap: tantricMap ?? {},
      oduBirth: oduBirth ?? {},
      incomplete,
    },
    select: { id: true },
  });

  return NextResponse.json({ chartId: chart.id, incomplete }, { status: 201 });
}
