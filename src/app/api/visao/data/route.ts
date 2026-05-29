import { NextResponse } from 'next/server';

/**
 * GET /api/visao/data
 * Returns visão-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  switch (type) {
    default:
      return NextResponse.json({
        data: [],
        meta: {
          types: [],
        },
      });
  }
}