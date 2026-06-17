import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
