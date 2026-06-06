import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import { buildManifestoContent } from '@/lib/akasha/manifesto-builder';

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Retornar manifesto existente se já gerado
  const existing = await prisma.akashaManifesto.findUnique({
    where: { userId: auth.id },
    select: { id: true, content: true },
  });
  if (existing) {
    return NextResponse.json({ manifestoId: existing.id, content: existing.content });
  }

  const [user, chart] = await Promise.all([
    prisma.akashaUser.findUnique({ where: { id: auth.id }, select: { fullName: true } }),
    prisma.akashaBirthChart.findUnique({ where: { userId: auth.id } }),
  ]);

  if (!user || !chart) {
    return NextResponse.json(
      { error: 'Mapa natal não encontrado. Complete o onboarding.' },
      { status: 404 }
    );
  }

  const content = buildManifestoContent(
    user.fullName,
    chart.astrologyMap,
    chart.kabalisticMap,
    chart.tantricMap,
    chart.oduBirth
  );

  const manifesto = await prisma.akashaManifesto.create({
    data: {
      userId: auth.id,
      content: content as unknown as Parameters<typeof prisma.akashaManifesto.create>[0]['data']['content'],
    },
    select: { id: true },
  });

  return NextResponse.json({ manifestoId: manifesto.id, content }, { status: 201 });
}
