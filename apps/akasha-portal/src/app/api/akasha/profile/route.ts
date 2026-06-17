import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { geocodeCity } from '@/lib/infrastructure/geocoding/nominatim';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  birthDate: z.string().optional(), // ISO date 'YYYY-MM-DD'
  birthTime: z.string().optional(), // 'HH:mm' or 'HH:mm:ss'
  birthCity: z.string().max(200).optional(),
  birthTimezone: z.string().optional(),
});

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  let parsed: z.infer<typeof updateSchema>;
  try {
    const raw = await request.json();
    parsed = updateSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (parsed.name !== undefined) data.name = parsed.name.trim();

  if (parsed.birthDate !== undefined) {
    const date = new Date(parsed.birthDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }
    data.birthDate = date;
  }

  if (parsed.birthTime !== undefined) data.birthTime = parsed.birthTime;
  if (parsed.birthCity !== undefined) {
    data.birthCity = parsed.birthCity.trim();

    // Geocode city to fill lat/lng/timezone
    if (parsed.birthCity.trim().length >= 2) {
      const geo = await geocodeCity(parsed.birthCity, { countryCodes: 'br' });
      if (geo) {
        data.birthLatitude = geo.latitude;
        data.birthLongitude = geo.longitude;
        // Use explicit timezone if provided, otherwise from geocoding
        data.birthTimezone = parsed.birthTimezone ?? (geo as { timezone?: string }).timezone ?? null;
      }
    }
  } else if (parsed.birthTimezone !== undefined) {
    // City unchanged but timezone explicitly provided (e.g., manual correction)
    data.birthTimezone = parsed.birthTimezone;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
      birthLatitude: true,
      birthLongitude: true,
      birthTimezone: true,
    },
  });

  return NextResponse.json({ user: updated });
}
