// Osa API
import { NextResponse } from 'next/server';
import { getData, OsaData } from '@/lib/osa/osa-data';

export type { OsaData };

/**
 * GET /api/osa/data
 * Returns Osa-related data including all Odu combinations and their spiritual meanings
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const odu = url.searchParams.get('odu');

  const osaData = getData();

  if (odu) {
    const normalizedOdu = odu.charAt(0).toUpperCase() + odu.slice(1).toLowerCase();
    const found = osaData.find(
      (o) => o.odu.toLowerCase() === normalizedOdu.toLowerCase()
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
    data: osaData,
    meta: {
      total: osaData.length,
      signs: [...new Set(osaData.map((o) => o.sign))],
    },
  });
}