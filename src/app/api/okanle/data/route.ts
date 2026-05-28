import { NextResponse } from 'next/server';
import { performPractice } from '@/lib/okanle/okanle-practice';

/**
 * GET /api/okanle/data
 * Returns Okanle-specific data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  switch (type) {
    case 'practice':
      return NextResponse.json({
        data: {
          practice: performPractice(),
        },
      });

    case 'info':
      return NextResponse.json({
        data: {
          name: 'Okanle',
          description: 'Okanle practice module',
        },
      });

    default:
      return NextResponse.json({
        data: {
          name: 'Okanle',
          practice: performPractice(),
        },
      });
  }
}