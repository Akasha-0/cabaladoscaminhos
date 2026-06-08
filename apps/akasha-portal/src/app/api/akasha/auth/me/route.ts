import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export async function GET(request: NextRequest) {
  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  const user = await prisma.user.findUnique({
    where: { id: userOrResponse.id },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      locale: true,
      pushEnabled: true,
      ichingEnabled: true,
    },
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
    ichingEnabled: user.ichingEnabled,
  });
}

// Akasha v0.0.5 T8: opt-in LGPD do sorteio de I-Ching.
// Body: { ichingEnabled: boolean }
const patchSchema = z.object({
  ichingEnabled: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  let parsed: z.infer<typeof patchSchema>;
  try {
    const raw = await request.json();
    parsed = patchSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  if (typeof parsed.ichingEnabled !== 'boolean') {
    return NextResponse.json({ error: 'Nenhum campo atualizável' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userOrResponse.id },
    select: { ichingEnabled: true },
    data: { ichingEnabled: parsed.ichingEnabled },
  });

  return NextResponse.json({ ichingEnabled: updated.ichingEnabled });
}
