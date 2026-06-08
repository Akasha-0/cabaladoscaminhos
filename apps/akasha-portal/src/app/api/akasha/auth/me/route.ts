import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';

export async function GET(request: NextRequest) {
  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  const user = await prisma.user.findUnique({
    where: { id: userOrResponse.id },
    select: { id: true, email: true, name: true, emailVerified: true, locale: true, pushEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    locale: user.locale,
    pushEnabled: user.pushEnabled,
  });
}
