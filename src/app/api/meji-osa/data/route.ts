// Meji-Osa API
import { NextResponse } from 'next/server';
import { getData, MejiOsaData } from '@/lib/meji-osa/meji-osa-data';

export type { MejiOsaData };

/**
 * GET /api/meji-osa/data
 * Returns Meji-Osa-related data including all Odu combinations and their spiritual meanings
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const odu = url.searchParams.get('odu');

  const mejiOsaData = getData();

  if (odu) {
    const normalizedOdu = odu.charAt(0).toUpperCase() + odu.slice(1).toLowerCase();
    const found = mejiOsaData.find(
      (o) => o.name.toLowerCase().includes(normalizedOdu.toLowerCase()) ||
             o.id.toLowerCase().includes(normalizedOdu.toLowerCase())
    );

    if (!found) {
      return NextResponse.json(
        { error: 'Odu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: found });
  }

  return NextResponse.json({
    data: mejiOsaData,
    meta: {
      total: mejiOsaData.length,
      signs: [...new Set(mejiOsaData.map((o) => o.name))],
    },
  });
}