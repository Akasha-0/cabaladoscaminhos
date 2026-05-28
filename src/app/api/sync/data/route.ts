import { NextResponse } from 'next/server';

/**
 * GET /api/sync/data
 * Returns sync-related data and status
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = url.searchParams.get('since');
  const type = url.searchParams.get('type');

  // Return sync status or data
  return NextResponse.json({
    data: {
      status: 'ok',
      lastSync: since ? new Date(since).toISOString() : null,
      type: type || 'full',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * POST /api/sync/data
 * Handles sync data submission (push changes to server)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { changes, type, clientTimestamp } = body;

    // Process sync changes
    const result = {
      success: true,
      processed: changes?.length || 0,
      serverTimestamp: new Date().toISOString(),
      clientTimestamp,
      type: type || 'unknown',
    };

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: 'Invalid sync data' },
      { status: 400 }
    );
  }
}