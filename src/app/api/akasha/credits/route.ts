import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.AKASHA_ADMIN_SECRET ?? '';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const result = await prisma.akashaCreditEntry.aggregate({
    where: { userId: authResult.id },
    _sum: { delta: true },
  });

  return NextResponse.json({ balance: result._sum.delta ?? 0 });
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.userId !== 'string' || typeof body.amount !== 'number') {
    return NextResponse.json({ error: 'userId (string) e amount (number) são obrigatórios' }, { status: 400 });
  }

  const user = await prisma.akashaUser.findUnique({ where: { id: body.userId } });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const ledger = await prisma.akashaCreditEntry.aggregate({
    where: { userId: body.userId },
    _sum: { delta: true },
  });
  const currentBalance = ledger._sum.delta ?? 0;
  const newBalance = currentBalance + body.amount;

  const entry = await prisma.akashaCreditEntry.create({
    data: {
      userId: body.userId,
      delta: body.amount,
      reason: body.reason ?? 'admin_credit',
      balance: newBalance,
    },
  });

  return NextResponse.json({ entry, balance: newBalance });
}
