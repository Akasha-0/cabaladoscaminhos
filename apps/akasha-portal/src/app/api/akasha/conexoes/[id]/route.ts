import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAkashaApi(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const userId = authResult.id;

    const connection = await prisma.connection.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Conexão não encontrada' }, { status: 404 });
    }

    if (connection.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await prisma.connection.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/akasha/conexoes/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAkashaApi(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const userId = authResult.id;

    const connection = await prisma.connection.findUnique({
      where: { id },
      select: {
        userId: true,
        otherName: true,
        otherBirthDate: true,
        otherBirthTime: true,
        otherBirthCity: true,
        romanticScore: true,
        partnershipScore: true,
        dominantType: true,
        authorityMatch: true,
        resultData: true,
        createdAt: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Conexão não encontrada' }, { status: 404 });
    }

    if (connection.userId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      connection: {
        id,
        otherName: connection.otherName,
        otherBirthDate: connection.otherBirthDate.toISOString().split('T')[0],
        otherBirthTime: connection.otherBirthTime,
        otherBirthCity: connection.otherBirthCity,
        romanticScore: connection.romanticScore,
        partnershipScore: connection.partnershipScore,
        dominantType: connection.dominantType,
        authorityMatch: connection.authorityMatch,
        resultData: connection.resultData,
        createdAt: connection.createdAt,
      },
    });
  } catch (err) {
    console.error('[GET /api/akasha/conexoes/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
