import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const sub = await prisma.akashaSubscription.findUnique({
    where: { userId: auth.id },
    select: { plan: true, status: true, currentPeriodEnd: true, stripeSubscriptionId: true },
  });

  if (!sub) {
    return NextResponse.json({ plan: 'FREEMIUM', status: 'ACTIVE', currentPeriodEnd: null });
  }

  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    hasSubscription: !!sub.stripeSubscriptionId,
  });
}
