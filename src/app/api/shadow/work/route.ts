import { NextRequest, NextResponse } from 'next/server';

// GET /api/shadow/work - Retrieve shadow work data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    // TODO: Connect to shadow data store
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        userId,
        limit,
        offset: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
