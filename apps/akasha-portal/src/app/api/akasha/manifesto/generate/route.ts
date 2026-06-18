import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { buildManifestoContent } from '@/lib/application/akasha/manifesto-builder';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Retornar manifesto existente se já gerado
  const existing = await prisma.manifesto.findUnique({
    where: { userId: auth.id },
    select: { id: true, content: true },
  });
  if (existing) {
    return NextResponse.json({ manifestoId: existing.id, content: existing.content });
  }

  const [user, chart] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.id }, select: { name: true } }),
    prisma.birthChart.findUnique({ where: { userId: auth.id } }),
  ]);

  if (!user || !chart) {
    return NextResponse.json(
      { error: 'Mapa natal não encontrado. Complete o onboarding.' },
      { status: 404 }
    );
  }

  const content = buildManifestoContent(
    user.name,
    chart.astrologyMap,
    chart.kabalisticMap,
    chart.tantricMap,
    chart.oduBirth
  );

  const manifesto = await prisma.manifesto.create({
    data: {
      userId: auth.id,
      content: content as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return NextResponse.json({ manifestoId: manifesto.id, content }, { status: 201 });
}
