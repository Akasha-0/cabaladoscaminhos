import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

// ---------------------------------------------------------------------------
// Shared helper: compute all 5 pilar maps from birth data
// ---------------------------------------------------------------------------
type BirthDataUser = {
  name: string;
  birthDate: Date;
  birthTime: string | null;
  birthLatitude: number | null;
  birthLongitude: number | null;
};

async function computeBirthChartMaps(user: BirthDataUser): Promise<{
  astrologyMap: unknown;
  kabalisticMap: unknown;
  tantricMap: unknown;
  oduBirth: unknown;
  ichingMap: unknown;
  incomplete: boolean;
}> {
  const birthDateStr = user.birthDate.toISOString().split('T')[0];

  const [
    { buildKabalisticMap },
    { buildTantricMap },
    { calculateBirthOdu },
    { getBirthChart },
    { buildIchingMap },
  ] = await Promise.all([
    import('@akasha/core-cabala'),
    import('@akasha/core-tantra'),
    import('@akasha/core-odus'),
    import('@akasha/core-astrology'),
    import('@akasha/core-iching'),
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
    kabalisticMap = buildKabalisticMap(user.name, birthDateStr);
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

  let ichingMap: unknown;
  try {
    ichingMap = buildIchingMap({ birthDate: birthDateStr, birthTime: user.birthTime ?? null });
  } catch (err) {
    ichingMap = { error: 'Falha no cálculo do I Ching', detail: String(err) };
  }

  const incomplete = user.birthLatitude == null || user.birthLongitude == null;

  return { astrologyMap, kabalisticMap, tantricMap, oduBirth, ichingMap, incomplete };
}

// ---------------------------------------------------------------------------
// POST — create birth chart (idempotent guard first)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const existing = await prisma.birthChart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ message: 'Mapa natal já calculado', chartId: existing.id });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
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

  if (!user.birthDate) {
    return NextResponse.json(
      { error: 'birthDate ausente. Complete seu cadastro.' },
      { status: 400 }
    );
  }

  const { astrologyMap, kabalisticMap, tantricMap, oduBirth, ichingMap, incomplete } =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await computeBirthChartMaps(user as BirthDataUser);

  const chart = await prisma.birthChart.create({
    data: {
      userId,
      astrologyMap: astrologyMap ?? {},
      kabalisticMap: kabalisticMap ?? {},
      tantricMap: tantricMap ?? {},
      oduBirth: oduBirth ?? {},
      ichingMap: (ichingMap as any) ?? null,
      incomplete,
    },
    select: { id: true },
  });

  return NextResponse.json({ chartId: chart.id, incomplete }, { status: 201 });
}

// ---------------------------------------------------------------------------
// PUT — replace birth chart (upsert)
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
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
  if (!user.birthDate) {
    return NextResponse.json(
      { error: 'birthDate ausente. Complete seu cadastro.' },
      { status: 400 }
    );
  }

  const { astrologyMap, kabalisticMap, tantricMap, oduBirth, ichingMap, incomplete } =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await computeBirthChartMaps(user as BirthDataUser);

  // Upsert: replace existing chart with fresh calculations
  await prisma.birthChart.upsert({
    where: { userId },
    create: {
      userId,
      astrologyMap: astrologyMap ?? {},
      kabalisticMap: kabalisticMap ?? {},
      tantricMap: tantricMap ?? {},
      oduBirth: oduBirth ?? {},
      ichingMap: (ichingMap as any) ?? null,
      incomplete,
    },
    update: {
      astrologyMap: astrologyMap ?? {},
      kabalisticMap: kabalisticMap ?? {},
      tantricMap: tantricMap ?? {},
      oduBirth: oduBirth ?? {},
      ichingMap: (ichingMap as any) ?? null,
      incomplete,
    },
  });

  return NextResponse.json({ message: 'Mapa natal atualizado', incomplete }, { status: 200 });
}
